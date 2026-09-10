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
    when safe_account_type = 'discover'
      and new.raw_user_meta_data ->> 'plan' in ('lite', 'pro')
      then new.raw_user_meta_data ->> 'plan'
    when safe_account_type in ('launch', 'operate')
      and new.raw_user_meta_data ->> 'plan' in ('pro', 'firma')
      then new.raw_user_meta_data ->> 'plan'
    else 'pro'
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

revoke all on function public.handle_new_user() from public, anon, authenticated;
