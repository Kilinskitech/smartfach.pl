alter table public.user_profiles
  drop constraint if exists user_profiles_account_type_check;

update public.user_profiles
set account_type = 'builder',
    updated_at = now()
where account_type <> 'builder';

alter table public.user_profiles
  alter column account_type set default 'builder',
  add constraint user_profiles_account_type_check
    check (account_type = 'builder');

alter table public.subscriptions
  drop constraint if exists subscriptions_plan_check;

update public.subscriptions
set plan = 'pro',
    updated_at = now()
where plan not in ('lite', 'pro');

alter table public.subscriptions
  add constraint subscriptions_plan_check
    check (plan in ('lite', 'pro'));

update public.workspaces
set data = jsonb_set(
      jsonb_set(
        data #- '{journey,mode}',
        '{billing,plan}',
        to_jsonb(
          case
            when data #>> '{billing,plan}' in ('lite', 'pro')
              then data #>> '{billing,plan}'
            else 'pro'
          end
        ),
        true
      ),
      '{conversations}',
      coalesce(
        (
          select jsonb_agg(item.value - 'mode')
          from jsonb_array_elements(
            coalesce(public.workspaces.data -> 'conversations', '[]'::jsonb)
          ) as item(value)
        ),
        '[]'::jsonb
      ),
      true
    ),
    updated_at = now()
where data #>> '{journey,mode}' is not null
   or data #>> '{billing,plan}' not in ('lite', 'pro')
   or exists (
     select 1
     from jsonb_array_elements(
       coalesce(public.workspaces.data -> 'conversations', '[]'::jsonb)
     ) as item(value)
     where item.value ? 'mode'
   );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organization_id uuid := gen_random_uuid();
  safe_plan text;
  safe_name text;
  initial_workspace jsonb;
begin
  safe_plan := case
    when new.raw_user_meta_data ->> 'plan' in ('lite', 'pro')
      then new.raw_user_meta_data ->> 'plan'
    else 'pro'
  end;
  safe_name := left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'Użytkownik'), 160);

  insert into public.user_profiles (user_id, display_name, account_type)
  values (new.id, safe_name, 'builder');

  insert into public.organizations (id, owner_user_id, name)
  values (new_organization_id, new.id, safe_name);

  insert into public.memberships (organization_id, user_id, role, status)
  values (new_organization_id, new.id, 'owner', 'active');

  initial_workspace := jsonb_build_object(
    'version', 1,
    'revision', 0,
    'company', jsonb_build_object('name', '', 'phone', '', 'email', coalesce(new.email, ''), 'address', '', 'taxId', ''),
    'clients', '[]'::jsonb,
    'catalog', '[]'::jsonb,
    'team', '[]'::jsonb,
    'documents', '[]'::jsonb,
    'conversations', '[]'::jsonb,
    'journey', jsonb_build_object(
      'focus', '',
      'goal', '',
      'workStyle', 'open',
      'weeklyHours', '',
      'experience', '',
      'constraints', ''
    ),
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
begin
  if next_data is null or jsonb_typeof(next_data) <> 'object' or next_data ->> 'version' <> '1' then
    raise exception using errcode = '22023', message = 'Nieprawidłowy format workspace.';
  end if;

  update public.workspaces as workspace_row
  set revision = expected_revision + 1,
      data = jsonb_set(next_data, '{revision}', to_jsonb(expected_revision + 1), true),
      updated_at = now()
  where workspace_row.organization_id = target_organization_id
    and workspace_row.revision = expected_revision
  returning workspace_row.revision, workspace_row.data
  into saved_revision, saved_data;

  if saved_revision is null then
    raise exception using errcode = '40001', message = 'Dane zmieniły się w innym oknie.';
  end if;

  return query select saved_revision, saved_data;
end;
$$;

revoke all on function public.save_workspace(uuid, uuid, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.save_workspace(uuid, uuid, bigint, jsonb) to service_role;
