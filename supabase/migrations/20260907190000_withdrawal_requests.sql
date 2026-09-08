begin;
create table public.withdrawal_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  checkout_session_id text not null unique,
  full_name text not null,
  email text not null,
  statement text not null,
  received_at timestamptz not null default now(),
  email_sent_at timestamptz,
  resolved_at timestamptz
);
alter table public.withdrawal_requests enable row level security;
revoke all on public.withdrawal_requests from anon, authenticated;
grant select on public.withdrawal_requests to authenticated;
grant all on public.withdrawal_requests to service_role;
create policy withdrawal_requests_read_own on public.withdrawal_requests
for select to authenticated using ((select auth.uid()) = user_id);

create function public.resolve_withdrawal(request_id uuid, actor_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare target_id uuid;
begin
  update public.withdrawal_requests set resolved_at = now()
  where id = request_id and resolved_at is null returning user_id into target_id;
  if found then
    insert into public.admin_audit_events(admin_user_id, target_user_id, action, metadata)
    values (actor_id, target_id, 'resolve_withdrawal', jsonb_build_object('request_id', request_id));
  end if;
end;
$$;
revoke all on function public.resolve_withdrawal(uuid, uuid) from public, anon, authenticated;
grant execute on function public.resolve_withdrawal(uuid, uuid) to service_role;
commit;
