create extension if not exists pgcrypto;

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  account_type text not null default 'operate'
    check (account_type in ('discover', 'launch', 'operate')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  status text not null default 'active' check (status in ('invited', 'active', 'disabled')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);
create index memberships_user_id_idx on public.memberships(user_id);

create table public.workspaces (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  revision bigint not null default 0 check (revision >= 0),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  plan text not null default 'lite' check (plan in ('lite', 'pro', 'firma')),
  status text not null default 'incomplete',
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  current_period_ends_at timestamptz,
  cancel_at_period_end boolean not null default false,
  payment_method_attached boolean not null default false,
  updated_at timestamptz not null default now()
);
create index subscriptions_owner_user_id_idx on public.subscriptions(owner_user_id);
create index subscriptions_status_idx on public.subscriptions(status);

create table public.stripe_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create table public.usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  conversation_id text,
  provider_request_id text unique,
  provider text,
  model text not null,
  prompt_tokens bigint not null default 0 check (prompt_tokens >= 0),
  completion_tokens bigint not null default 0 check (completion_tokens >= 0),
  total_tokens bigint not null default 0 check (total_tokens >= 0),
  reasoning_tokens bigint not null default 0 check (reasoning_tokens >= 0),
  cached_tokens bigint not null default 0 check (cached_tokens >= 0),
  cost_usd numeric(18, 10) not null default 0 check (cost_usd >= 0),
  created_at timestamptz not null default now()
);
create index usage_events_organization_id_idx on public.usage_events(organization_id);
create index usage_events_user_id_idx on public.usage_events(user_id);
create index usage_events_created_at_idx on public.usage_events(created_at desc);

create table public.admin_audit_events (
  id bigint generated always as identity primary key,
  admin_user_id uuid not null references auth.users(id) on delete restrict,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_events_target_user_id_idx on public.admin_audit_events(target_user_id);
create index admin_audit_events_created_at_idx on public.admin_audit_events(created_at desc);

create schema if not exists private;

create or replace function private.is_org_member(target_organization_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.memberships
    where organization_id = target_organization_id
      and user_id = (select auth.uid())
      and status = 'active'
  );
$$;

revoke all on function private.is_org_member(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_org_member(uuid) to authenticated;

alter table public.user_profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.workspaces enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;
alter table public.usage_events enable row level security;
alter table public.admin_audit_events enable row level security;

revoke all on table public.user_profiles from anon, authenticated;
revoke all on table public.organizations from anon, authenticated;
revoke all on table public.memberships from anon, authenticated;
revoke all on table public.workspaces from anon, authenticated;
revoke all on table public.subscriptions from anon, authenticated;
revoke all on table public.stripe_events from anon, authenticated;
revoke all on table public.usage_events from anon, authenticated;
revoke all on table public.admin_audit_events from anon, authenticated;

grant select, update on table public.user_profiles to authenticated;
grant select on table public.organizations to authenticated;
grant select on table public.memberships to authenticated;
grant select on table public.workspaces to authenticated;
grant select on table public.subscriptions to authenticated;
grant select on table public.usage_events to authenticated;

create policy "profile_select_own" on public.user_profiles
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "profile_update_own" on public.user_profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "organizations_select_member" on public.organizations
for select to authenticated
using ((select private.is_org_member(id)));

create policy "memberships_select_member_org" on public.memberships
for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "workspaces_select_member" on public.workspaces
for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "subscriptions_select_member" on public.subscriptions
for select to authenticated
using ((select private.is_org_member(organization_id)));

create policy "usage_events_select_member" on public.usage_events
for select to authenticated
using ((select private.is_org_member(organization_id)));

create or replace function public.save_workspace(
  target_organization_id uuid,
  actor_user_id uuid,
  expected_revision bigint,
  next_data jsonb
)
returns table (revision bigint, data jsonb)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_revision bigint;
  saved_data jsonb;
  next_account_type text;
begin
  if next_data is null or jsonb_typeof(next_data) <> 'object' or next_data ->> 'version' <> '1' then
    raise exception using errcode = '22023', message = 'Nieprawidłowy format workspace.';
  end if;

  update public.workspaces
  set revision = expected_revision + 1,
      data = jsonb_set(next_data, '{revision}', to_jsonb(expected_revision + 1), true),
      updated_at = now()
  where organization_id = target_organization_id
    and revision = expected_revision
  returning workspaces.revision, workspaces.data into saved_revision, saved_data;

  if saved_revision is null then
    raise exception using errcode = '40001', message = 'Dane zmieniły się w innym oknie.';
  end if;

  next_account_type := saved_data #>> '{journey,mode}';
  if next_account_type in ('discover', 'launch', 'operate') then
    update public.user_profiles
    set account_type = next_account_type, updated_at = now()
    where user_id = actor_user_id;
  end if;

  return query select saved_revision, saved_data;
end;
$$;

revoke all on function public.save_workspace(uuid, uuid, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.save_workspace(uuid, uuid, bigint, jsonb) to service_role;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organization_id uuid := gen_random_uuid();
  safe_account_type text;
  safe_plan text;
  safe_name text;
  initial_workspace jsonb;
begin
  safe_account_type := case
    when new.raw_user_meta_data ->> 'account_type' in ('discover', 'launch', 'operate')
      then new.raw_user_meta_data ->> 'account_type'
    else 'operate'
  end;
  safe_plan := case
    when new.raw_user_meta_data ->> 'plan' in ('lite', 'pro', 'firma')
      then new.raw_user_meta_data ->> 'plan'
    else 'lite'
  end;
  safe_name := left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Użytkownik'), 160);

  insert into public.user_profiles (user_id, display_name, account_type)
  values (new.id, safe_name, safe_account_type);

  insert into public.organizations (id, owner_user_id, name)
  values (new_organization_id, new.id, safe_name);

  insert into public.memberships (organization_id, user_id, role, status)
  values (new_organization_id, new.id, 'owner', 'active');

  initial_workspace := jsonb_build_object(
    'version', 1,
    'revision', 0,
    'company', jsonb_build_object('name', safe_name, 'phone', '', 'email', coalesce(new.email, ''), 'address', '', 'taxId', ''),
    'clients', '[]'::jsonb,
    'catalog', '[]'::jsonb,
    'team', '[]'::jsonb,
    'documents', '[]'::jsonb,
    'conversations', '[]'::jsonb,
    'journey', jsonb_build_object('mode', safe_account_type, 'focus', '', 'goal', ''),
    'billing', jsonb_build_object('plan', safe_plan, 'usedCredits', 0, 'topUpCredits', 0, 'periodStartedAt', to_char(now() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'))
  );

  insert into public.workspaces (organization_id, revision, data)
  values (new_organization_id, 0, initial_workspace);

  insert into public.subscriptions (organization_id, owner_user_id, plan, status)
  values (new_organization_id, new.id, safe_plan, 'incomplete');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

revoke all on function public.handle_new_user() from public, anon, authenticated;
