alter table public.subscriptions
  add column if not exists current_period_started_at timestamptz;

create table if not exists public.usage_top_ups (
  checkout_session_id text primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  pack_id text not null check (pack_id in ('mini', 'plus', 'max')),
  granted_credits integer not null check (granted_credits > 0 and granted_credits <= 100000),
  amount_total_grosze integer not null check (amount_total_grosze > 0),
  currency text not null check (currency = 'pln'),
  created_at timestamptz not null default now()
);

create index if not exists usage_top_ups_organization_id_idx
  on public.usage_top_ups(organization_id, created_at desc);
create index if not exists usage_top_ups_user_id_idx
  on public.usage_top_ups(user_id);
create index if not exists organizations_owner_user_id_idx
  on public.organizations(owner_user_id);
create index if not exists admin_audit_events_admin_user_id_idx
  on public.admin_audit_events(admin_user_id);

create table if not exists public.usage_credit_charges (
  idempotency_key uuid primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  charged_credits integer not null check (charged_credits > 0 and charged_credits <= 100000),
  provider_request_id text,
  created_at timestamptz not null default now()
);

create index if not exists usage_credit_charges_organization_id_idx
  on public.usage_credit_charges(organization_id, created_at desc);
create index if not exists usage_credit_charges_user_id_idx
  on public.usage_credit_charges(user_id);

alter table public.usage_top_ups enable row level security;
alter table public.usage_credit_charges enable row level security;
revoke all on table public.usage_top_ups from anon, authenticated;
revoke all on table public.usage_credit_charges from anon, authenticated;
grant select on table public.usage_top_ups to authenticated;
grant select on table public.usage_credit_charges to authenticated;

drop policy if exists "usage_top_ups_select_member" on public.usage_top_ups;
create policy "usage_top_ups_select_member" on public.usage_top_ups
for select to authenticated
using ((select private.is_org_member(organization_id)));

drop policy if exists "usage_credit_charges_select_member" on public.usage_credit_charges;
create policy "usage_credit_charges_select_member" on public.usage_credit_charges
for select to authenticated
using ((select private.is_org_member(organization_id)));

create or replace function public.charge_usage_credits(
  target_organization_id uuid,
  target_user_id uuid,
  target_idempotency_key uuid,
  target_charged_credits integer,
  target_monthly_credits integer,
  target_provider_request_id text default null
)
returns table (revision bigint, billing jsonb, newly_charged boolean)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  inserted_rows integer;
  current_workspace public.workspaces%rowtype;
  current_used integer;
  current_top_up integer;
begin
  if target_charged_credits <= 0
    or target_charged_credits > 100000
    or target_monthly_credits <= 0
    or target_monthly_credits > 1000000 then
    raise exception using errcode = '22023', message = 'Nieprawidłowe rozliczenie użycia.';
  end if;

  if not exists (
    select 1
    from public.memberships
    where organization_id = target_organization_id
      and user_id = target_user_id
      and status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'Brak dostępu do konta.';
  end if;

  insert into public.usage_credit_charges (
    idempotency_key,
    organization_id,
    user_id,
    charged_credits,
    provider_request_id
  ) values (
    target_idempotency_key,
    target_organization_id,
    target_user_id,
    target_charged_credits,
    nullif(target_provider_request_id, '')
  )
  on conflict (idempotency_key) do nothing;

  get diagnostics inserted_rows = row_count;
  select * into current_workspace
  from public.workspaces
  where organization_id = target_organization_id
  for update;

  if current_workspace.organization_id is null then
    raise exception using errcode = 'P0001', message = 'Nie znaleziono danych konta.';
  end if;

  if inserted_rows = 0 then
    return query select
      current_workspace.revision,
      current_workspace.data -> 'billing',
      false;
    return;
  end if;

  current_used := coalesce((current_workspace.data #>> '{billing,usedCredits}')::integer, 0);
  current_top_up := coalesce((current_workspace.data #>> '{billing,topUpCredits}')::integer, 0);
  if current_used + target_charged_credits > target_monthly_credits + current_top_up then
    raise exception using errcode = 'P0001', message = 'Limit planu został wykorzystany.';
  end if;

  update public.workspaces as w
  set revision = w.revision + 1,
      data = jsonb_set(
        jsonb_set(
          w.data,
          '{billing,usedCredits}',
          to_jsonb(current_used + target_charged_credits),
          true
        ),
        '{revision}',
        to_jsonb(w.revision + 1),
        true
      ),
      updated_at = now()
  where w.organization_id = target_organization_id
  returning w.organization_id, w.revision, w.data, w.updated_at into current_workspace;

  return query select
    current_workspace.revision,
    current_workspace.data -> 'billing',
    true;
end;
$$;

revoke all on function public.charge_usage_credits(
  uuid, uuid, uuid, integer, integer, text
) from public, anon, authenticated;
grant execute on function public.charge_usage_credits(
  uuid, uuid, uuid, integer, integer, text
) to service_role;

create or replace function public.grant_usage_top_up(
  target_organization_id uuid,
  target_user_id uuid,
  target_checkout_session_id text,
  target_pack_id text,
  target_granted_credits integer,
  target_amount_total_grosze integer,
  target_currency text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  inserted_rows integer;
  updated_rows integer;
begin
  if target_checkout_session_id !~ '^cs_(test_|live_)?[A-Za-z0-9]+$'
    or target_pack_id not in ('mini', 'plus', 'max')
    or target_granted_credits <= 0
    or target_granted_credits > 100000
    or target_amount_total_grosze <= 0
    or lower(target_currency) <> 'pln' then
    raise exception using errcode = '22023', message = 'Nieprawidłowe dane zwiększenia limitu.';
  end if;

  if not exists (
    select 1
    from public.memberships
    where organization_id = target_organization_id
      and user_id = target_user_id
      and role = 'owner'
      and status = 'active'
  ) then
    raise exception using errcode = '42501', message = 'Brak właściciela konta dla zakupu.';
  end if;

  insert into public.usage_top_ups (
    checkout_session_id,
    organization_id,
    user_id,
    pack_id,
    granted_credits,
    amount_total_grosze,
    currency
  ) values (
    target_checkout_session_id,
    target_organization_id,
    target_user_id,
    target_pack_id,
    target_granted_credits,
    target_amount_total_grosze,
    lower(target_currency)
  )
  on conflict (checkout_session_id) do nothing;

  get diagnostics inserted_rows = row_count;
  if inserted_rows = 0 then
    return false;
  end if;

  update public.workspaces
  set revision = public.workspaces.revision + 1,
      data = jsonb_set(
        jsonb_set(
          public.workspaces.data,
          '{billing,topUpCredits}',
          to_jsonb(
            coalesce((public.workspaces.data #>> '{billing,topUpCredits}')::integer, 0)
            + target_granted_credits
          ),
          true
        ),
        '{revision}',
        to_jsonb(public.workspaces.revision + 1),
        true
      ),
      updated_at = now()
  where organization_id = target_organization_id;

  get diagnostics updated_rows = row_count;
  if updated_rows <> 1 then
    raise exception using errcode = 'P0001', message = 'Nie znaleziono danych konta dla zakupu.';
  end if;

  return true;
end;
$$;

revoke all on function public.grant_usage_top_up(
  uuid, uuid, text, text, integer, integer, text
) from public, anon, authenticated;
grant execute on function public.grant_usage_top_up(
  uuid, uuid, text, text, integer, integer, text
) to service_role;
