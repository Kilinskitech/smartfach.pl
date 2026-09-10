begin;

create table public.platform_settings (
  key text primary key check (key = 'operator'),
  value jsonb not null check (jsonb_typeof(value) = 'object'),
  updated_at timestamptz not null default now()
);
alter table public.platform_settings enable row level security;
revoke all on public.platform_settings from anon, authenticated;
grant all on public.platform_settings to service_role;

create or replace function public.save_operator_settings(settings_value jsonb, actor_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into public.platform_settings(key, value) values ('operator', settings_value)
  on conflict (key) do update set value = excluded.value, updated_at = now();
  insert into public.admin_audit_events(admin_user_id, target_user_id, action, metadata)
  values (actor_id, actor_id, 'update_operator_settings', jsonb_build_object('operator', settings_value));
end;
$$;
revoke all on function public.save_operator_settings(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.save_operator_settings(jsonb, uuid) to service_role;

create table public.purchase_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  purchase_key text not null unique,
  document_version text not null,
  document_hash text not null,
  accepted_at timestamptz not null default now(),
  snapshot jsonb not null,
  check (jsonb_typeof(snapshot) = 'object')
);
alter table public.purchase_acceptances enable row level security;
revoke all on public.purchase_acceptances from anon, authenticated;
grant select on public.purchase_acceptances to authenticated;
grant all on public.purchase_acceptances to service_role;
create policy purchase_acceptances_read_own on public.purchase_acceptances
for select to authenticated using ((select auth.uid()) = user_id);

create table public.purchase_contracts (
  checkout_session_id text primary key,
  acceptance_id uuid not null references public.purchase_acceptances(id),
  user_id uuid references auth.users(id) on delete set null,
  recipient text not null,
  body text not null,
  created_at timestamptz not null default now(),
  email_sent_at timestamptz,
  delivery_claimed_at timestamptz
);
alter table public.purchase_contracts enable row level security;
revoke all on public.purchase_contracts from anon, authenticated;
grant select on public.purchase_contracts to authenticated;
grant all on public.purchase_contracts to service_role;
create policy purchase_contracts_read_own on public.purchase_contracts
for select to authenticated using ((select auth.uid()) = user_id);

-- A short lease prevents simultaneous webhook retries from emailing twice.
create function public.claim_contract_delivery(session_id text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare claimed text;
begin
  update public.purchase_contracts set delivery_claimed_at = now()
  where checkout_session_id = session_id and email_sent_at is null
    and (delivery_claimed_at is null or delivery_claimed_at < now() - interval '2 minutes')
  returning checkout_session_id into claimed;
  return claimed is not null;
end;
$$;
revoke all on function public.claim_contract_delivery(text) from public, anon, authenticated;
grant execute on function public.claim_contract_delivery(text) to service_role;
commit;
