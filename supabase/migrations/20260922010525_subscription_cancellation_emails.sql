-- Private outbox: one confirmation per cancellation request, not per webhook.
create table public.subscription_cancellation_emails (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subscription_id text not null,
  requested_at bigint not null check (requested_at > 0),
  created_at timestamptz not null default now(),
  delivery_claimed_at timestamptz,
  email_sent_at timestamptz,
  suppressed_at timestamptz,
  unique (subscription_id, requested_at)
);
alter table public.subscription_cancellation_emails enable row level security;
revoke all on public.subscription_cancellation_emails from public, anon, authenticated;
grant select, insert, update, delete on public.subscription_cancellation_emails to service_role;
create index cancellation_emails_user on public.subscription_cancellation_emails(user_id);
create index cancellation_emails_organization on public.subscription_cancellation_emails(organization_id);
create index cancellation_emails_pending on public.subscription_cancellation_emails(delivery_claimed_at nulls first, created_at, id)
  where email_sent_at is null and suppressed_at is null;

create function public.claim_cancellation_email(message_id text) returns boolean
language plpgsql security invoker set search_path = '' as $$
begin
  update public.subscription_cancellation_emails set delivery_claimed_at = clock_timestamp()
  where id = message_id and email_sent_at is null and suppressed_at is null
    and (delivery_claimed_at is null or delivery_claimed_at < now() - interval '2 minutes');
  return found;
end;
$$;
revoke all on function public.claim_cancellation_email(text) from public, anon, authenticated;
grant execute on function public.claim_cancellation_email(text) to service_role;
