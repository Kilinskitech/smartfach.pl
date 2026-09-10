-- Apply before deploying the matching server code. Additive; no customer data removed.
begin;
-- Make invoker RPC permissions explicit instead of relying on dashboard defaults.
grant select on public.memberships, public.workspaces, public.organizations, public.subscriptions, public.usage_events, public.stripe_events to service_role;
grant update on public.workspaces, public.organizations to service_role;
grant insert, update on public.subscriptions, public.stripe_events to service_role;
grant insert on public.usage_events, public.usage_credit_charges, public.admin_audit_events to service_role;
grant usage, select on sequence public.admin_audit_events_id_seq to service_role;
create table public.ai_requests (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  request_key uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  fingerprint text not null,
  state text not null check (state in ('pending', 'succeeded', 'failed', 'uncertain')),
  reserved_credits integer not null check (reserved_credits > 0),
  response jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz,
  primary key (organization_id, request_key)
);
create index ai_requests_user_time on public.ai_requests(user_id, created_at);
alter table public.ai_requests enable row level security;
revoke all on public.ai_requests from public, anon, authenticated;
grant all on public.ai_requests to service_role;

create or replace function public.begin_ai_request(org uuid, actor uuid, request_key uuid, fingerprint text, minimum_credits integer)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare w public.workspaces%rowtype; r public.ai_requests%rowtype; available integer; reserved integer; allowance integer;
begin
  if minimum_credits < 1 or minimum_credits > 7 or length(fingerprint) <> 64 then raise exception 'Invalid request'; end if;
  if not exists (select 1 from public.memberships where organization_id=org and user_id=actor and status='active') then
    raise exception using errcode='42501', message='Forbidden'; end if;
  select * into w from public.workspaces where organization_id=org for update;
  if not found then raise exception 'Workspace missing'; end if;
  update public.ai_requests set state='uncertain' where organization_id=org and state='pending' and created_at < now()-interval '2 minutes';
  -- Lazy per-workspace cleanup; explicit retention cleanup must also run daily.
  update public.ai_requests set response=null where organization_id=org and response is not null and finished_at<now()-interval '24 hours';
  select * into r from public.ai_requests a where a.organization_id=org and a.request_key=begin_ai_request.request_key;
  if found then
    if r.user_id <> actor or r.fingerprint <> fingerprint then return jsonb_build_object('status','conflict'); end if;
    if r.state='succeeded' then
      -- Result bodies are short-lived; retain the receipt to prevent another paid call.
      if r.finished_at < now()-interval '24 hours' then
        update public.ai_requests a set response=null where a.organization_id=org and a.request_key=begin_ai_request.request_key;
        return jsonb_build_object('status','expired');
      end if;
      return jsonb_build_object('status','replay','response',r.response,'billing',w.data->'billing','revision',w.revision);
    end if;
    return jsonb_build_object('status',case when r.state='pending' then 'busy' else r.state end);
  end if;
  -- A crashed worker must never silently restart an already dispatched paid call.
  if exists(select 1 from public.ai_requests where organization_id=org and state='pending') then return jsonb_build_object('status','busy'); end if;
  if (select count(*) from public.ai_requests where user_id=actor and created_at>now()-interval '1 hour') >= 20 then return jsonb_build_object('status','rate_limit'); end if;
  allowance := case w.data#>>'{billing,plan}' when 'lite' then 225 when 'pro' then 550 else 0 end;
  select coalesce(sum(reserved_credits),0) into reserved from public.ai_requests where organization_id=org and state in ('pending','uncertain');
  available := allowance + coalesce((w.data#>>'{billing,topUpCredits}')::integer,0) - coalesce((w.data#>>'{billing,usedCredits}')::integer,0) - reserved;
  if available < minimum_credits then return jsonb_build_object('status','limit'); end if;
  insert into public.ai_requests(organization_id,request_key,user_id,fingerprint,state,reserved_credits)
    values(org,request_key,actor,fingerprint,'pending',least(30,available));
  return jsonb_build_object('status','started');
end $$;

create or replace function public.finish_ai_request(org uuid, actor uuid, request_key uuid, result jsonb, charged_credits integer)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare w public.workspaces%rowtype; r public.ai_requests%rowtype; charged integer; available integer; reserved integer; u jsonb;
begin
  if result is null or jsonb_typeof(result)<>'object' or octet_length(result::text)>100000 or charged_credits<1 or charged_credits>100000 then raise exception 'Invalid result'; end if;
  select * into w from public.workspaces where organization_id=org for update;
  select * into r from public.ai_requests a where a.organization_id=org and a.request_key=finish_ai_request.request_key for update;
  if not found or r.user_id<>actor then raise exception using errcode='42501',message='Forbidden'; end if;
  if r.state='succeeded' then return jsonb_build_object('response',r.response,'billing',w.data->'billing','revision',w.revision); end if;
  if r.state not in ('pending','uncertain') then raise exception 'Request is closed'; end if;
  select coalesce(sum(reserved_credits),0) into reserved from public.ai_requests a
    where a.organization_id=org and a.request_key<>finish_ai_request.request_key and state in ('pending','uncertain');
  available := greatest(0, (case w.data#>>'{billing,plan}' when 'lite' then 225 when 'pro' then 550 else 0 end)
    + (w.data#>>'{billing,topUpCredits}')::integer - (w.data#>>'{billing,usedCredits}')::integer - reserved);
  -- Never discard a paid answer near the limit. Operator absorbs any excess and retains the real vendor cost.
  charged := least(charged_credits, available);
  u := result->'usage';
  if u is not null and u->>'costUsd' is not null then
    insert into public.usage_events(organization_id,user_id,model,provider_request_id,provider,prompt_tokens,completion_tokens,total_tokens,reasoning_tokens,cached_tokens,cost_usd)
      values(org,actor,result->>'model',u->>'providerRequestId',u->>'provider',coalesce((u->>'promptTokens')::bigint,0),coalesce((u->>'completionTokens')::bigint,0),
      coalesce((u->>'totalTokens')::bigint,0),coalesce((u->>'reasoningTokens')::bigint,0),coalesce((u->>'cachedTokens')::bigint,0),(u->>'costUsd')::numeric)
      on conflict(provider_request_id) do nothing;
  end if;
  if charged>0 then
    insert into public.usage_credit_charges(idempotency_key,organization_id,user_id,charged_credits,provider_request_id)
      values(gen_random_uuid(),org,actor,charged,u->>'providerRequestId');
  end if;
  update public.workspaces set revision=revision+1,
    data=jsonb_set(jsonb_set(data,'{billing,usedCredits}',to_jsonb((data#>>'{billing,usedCredits}')::integer+charged)),'{revision}',to_jsonb(revision+1)),updated_at=now()
    where organization_id=org returning * into w;
  result := result || jsonb_build_object('creditsUsed',charged);
  update public.ai_requests a set state='succeeded',response=result,finished_at=now()
    where a.organization_id=org and a.request_key=finish_ai_request.request_key;
  return jsonb_build_object('response',result,'billing',w.data->'billing','revision',w.revision);
end $$;

create or replace function public.fail_ai_request(org uuid, actor uuid, request_key uuid)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.workspaces where organization_id=org for update;
  update public.ai_requests a set state='failed',finished_at=now() where a.organization_id=org and a.request_key=fail_ai_request.request_key and user_id=actor and state='pending';
end $$;

-- Distributed leases: both webhook deliveries and subscription synchronization use fencing tokens.
create table public.operation_leases(resource text primary key, token uuid not null, expires_at timestamptz not null);
alter table public.operation_leases enable row level security;
revoke all on public.operation_leases from public,anon,authenticated;
grant all on public.operation_leases to service_role;
create or replace function public.claim_operation(resource text, token uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
declare claimed integer;
begin
  insert into public.operation_leases as l values(resource,token,now()+interval '2 minutes')
    on conflict on constraint operation_leases_pkey do update set token=excluded.token,expires_at=excluded.expires_at where l.expires_at<now();
  get diagnostics claimed=row_count;
  return claimed=1;
end $$;

alter table public.organizations add column trial_consumed_at timestamptz;
create or replace function public.complete_stripe_event(event_id text, lease_token uuid) returns boolean
language plpgsql security invoker set search_path='' as $$
begin
  perform 1 from public.operation_leases where resource='stripe-event:'||event_id and token=lease_token and expires_at>now() for update;
  if not found then return false; end if;
  update public.stripe_events s set processed_at=now() where s.event_id=complete_stripe_event.event_id;
  return found;
end $$;
revoke all on function public.complete_stripe_event(text,uuid) from public,anon,authenticated;
grant execute on function public.complete_stripe_event(text,uuid) to service_role;
update public.organizations o set trial_consumed_at=s.trial_started_at from public.subscriptions s
  where o.id=s.organization_id and s.trial_started_at is not null;
alter table public.subscriptions add column stripe_created_at bigint not null default 0;
create table public.checkout_attempts(
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  attempt_id uuid not null, plan text not null check(plan in ('lite','pro')),
  trial boolean not null, session_id text, created_at timestamptz not null default now()
);
alter table public.checkout_attempts enable row level security;
revoke all on public.checkout_attempts from public,anon,authenticated;
grant all on public.checkout_attempts to service_role;

create or replace function public.apply_subscription_snapshot(org uuid, actor uuid, lease_token uuid, snapshot jsonb)
returns boolean language plpgsql security invoker set search_path='' as $$
declare w public.workspaces%rowtype; old public.subscriptions%rowtype; b jsonb; start_at timestamptz; leftover integer;
begin
  perform 1 from public.operation_leases where resource='subscription:'||org::text and token=lease_token and expires_at>now() for update;
  if not found then raise exception 'Lease expired'; end if;
  select * into w from public.workspaces where organization_id=org for update;
  if not found or not exists(select 1 from public.organizations where id=org and owner_user_id=actor) then raise exception 'Invalid owner'; end if;
  select * into old from public.subscriptions where organization_id=org for update;
  if old.stripe_created_at > (snapshot->>'created')::bigint then return false; end if;
  start_at := (snapshot->>'period_start')::timestamptz;
  b := w.data->'billing';
  if start_at is not null and start_at > (b->>'periodStartedAt')::timestamptz then
    leftover:=greatest(0,(b->>'topUpCredits')::integer-greatest(0,(b->>'usedCredits')::integer-(case b->>'plan' when 'lite' then 225 else 550 end)));
    b:=b||jsonb_build_object('usedCredits',0,'topUpCredits',leftover,'periodStartedAt',to_char(start_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'));
  end if;
  b:=b||jsonb_build_object('plan',snapshot->>'plan');
  insert into public.subscriptions(organization_id,owner_user_id,plan,status,stripe_customer_id,stripe_subscription_id,trial_started_at,trial_ends_at,current_period_started_at,current_period_ends_at,cancel_at_period_end,payment_method_attached,stripe_created_at)
    values(org,actor,snapshot->>'plan',snapshot->>'status',snapshot->>'customer',snapshot->>'id',(snapshot->>'trial_start')::timestamptz,(snapshot->>'trial_end')::timestamptz,start_at,(snapshot->>'period_end')::timestamptz,(snapshot->>'cancel_at_period_end')::boolean,(snapshot->>'payment_method')::boolean,(snapshot->>'created')::bigint)
    on conflict(organization_id) do update set plan=excluded.plan,status=excluded.status,stripe_customer_id=excluded.stripe_customer_id,stripe_subscription_id=excluded.stripe_subscription_id,
      trial_started_at=excluded.trial_started_at,trial_ends_at=excluded.trial_ends_at,current_period_started_at=excluded.current_period_started_at,current_period_ends_at=excluded.current_period_ends_at,
      cancel_at_period_end=excluded.cancel_at_period_end,payment_method_attached=excluded.payment_method_attached,stripe_created_at=excluded.stripe_created_at,updated_at=now();
  if snapshot->>'trial_start' is not null then update public.organizations set trial_consumed_at=coalesce(trial_consumed_at,(snapshot->>'trial_start')::timestamptz) where id=org; end if;
  if b is distinct from w.data->'billing' then
    update public.workspaces set data=jsonb_set(jsonb_set(data,'{billing}',b),'{revision}',to_jsonb(revision+1)),revision=revision+1,updated_at=now() where organization_id=org;
  end if;
  return true;
end $$;

-- An installation is explicitly bound to one environment before Stripe Live is enabled.
create table public.deployment_identity(id boolean primary key default true check(id), environment text not null check(environment in ('preview','production')));
alter table public.deployment_identity enable row level security;
revoke all on public.deployment_identity from public,anon,authenticated;
grant all on public.deployment_identity to service_role;

-- Operational milestones only: no prompts, IP addresses, advertising cookies or third-party scripts.
create table public.product_events(
  user_id uuid not null references auth.users(id) on delete cascade,
  event text not null check(event in ('registered','checkout_opened','checkout_completed','first_answer','guided_start','paid','canceled','top_up')),
  occurred_at timestamptz not null default now(),
  primary key(user_id,event)
);
alter table public.product_events enable row level security;
revoke all on public.product_events from public,anon,authenticated;
grant all on public.product_events to service_role;

create or replace function public.admin_operational_summary() returns jsonb
language sql security invoker set search_path='' as $$
select jsonb_build_object(
  'milestones',coalesce((select jsonb_object_agg(event,n) from
    (select event,count(*) n from public.product_events where occurred_at>=now()-interval '30 days' group by event) t),'{}'::jsonb),
  'uncertain',coalesce((select jsonb_agg(t) from
    (select organization_id,request_key,user_id,reserved_credits,created_at from public.ai_requests
     where state='uncertain' or (state='pending' and created_at<now()-interval '2 minutes')
     order by created_at limit 50) t),'[]'::jsonb),
  'pendingWebhooks',(select count(*) from public.stripe_events where processed_at is null and received_at<now()-interval '2 minutes')
); $$;

create or replace function public.admin_usage_totals()
returns table(user_id uuid,cost_usd numeric,period_cost_usd numeric,total_tokens bigint,response_count bigint)
language sql security invoker set search_path='' as $$
select u.user_id, sum(u.cost_usd),
  coalesce(sum(u.cost_usd) filter(where u.created_at>=coalesce(s.current_period_started_at,(w.data#>>'{billing,periodStartedAt}')::timestamptz,date_trunc('month',now()))),0),
  sum(u.total_tokens)::bigint,count(*)
from public.usage_events u left join public.subscriptions s on s.organization_id=u.organization_id
left join public.workspaces w on w.organization_id=u.organization_id group by u.user_id;
$$;

-- Admin explicitly absorbs the uncertain cost. This is not a vendor refund or a retry.
create or replace function public.resolve_ai_reservation(org uuid, request_key uuid, admin_actor uuid)
returns boolean language plpgsql security invoker set search_path='' as $$
declare r public.ai_requests%rowtype;
begin
  perform 1 from public.workspaces where organization_id=org for update;
  select * into r from public.ai_requests a where a.organization_id=org and a.request_key=resolve_ai_reservation.request_key for update;
  if not found or r.state not in ('pending','uncertain') or r.created_at>now()-interval '2 minutes' then return false; end if;
  update public.ai_requests a set state='failed',finished_at=now() where a.organization_id=org and a.request_key=resolve_ai_reservation.request_key;
  insert into public.admin_audit_events(admin_user_id,target_user_id,action,metadata)
    values(admin_actor,r.user_id,'release_uncertain_ai',jsonb_build_object('request_key',request_key,'organization_id',org,'reserved_credits',r.reserved_credits));
  return true;
end $$;

create or replace function public.purge_ai_response_bodies() returns void
language sql security invoker set search_path='' as $$
update public.ai_requests set response=null where response is not null and finished_at<now()-interval '24 hours';
$$;
revoke all on function public.admin_operational_summary(),public.admin_usage_totals(),public.resolve_ai_reservation(uuid,uuid,uuid),public.purge_ai_response_bodies() from public,anon,authenticated;
grant execute on function public.admin_operational_summary(),public.admin_usage_totals(),public.resolve_ai_reservation(uuid,uuid,uuid),public.purge_ai_response_bodies() to service_role;

revoke all on function public.begin_ai_request(uuid,uuid,uuid,text,integer), public.finish_ai_request(uuid,uuid,uuid,jsonb,integer),public.fail_ai_request(uuid,uuid,uuid),public.claim_operation(text,uuid),public.apply_subscription_snapshot(uuid,uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.begin_ai_request(uuid,uuid,uuid,text,integer), public.finish_ai_request(uuid,uuid,uuid,jsonb,integer),public.fail_ai_request(uuid,uuid,uuid),public.claim_operation(text,uuid),public.apply_subscription_snapshot(uuid,uuid,uuid,jsonb) to service_role;
commit;
