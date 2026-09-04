begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'tenant-a@smartfach.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Tenant A"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'tenant-b@smartfach.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Tenant B"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);

select is(
  (select count(*) from public.organizations),
  1::bigint,
  'użytkownik A widzi tylko własną organizację'
);

select is(
  (select count(*) from public.workspaces),
  1::bigint,
  'użytkownik A widzi tylko własny workspace'
);

select is(
  (select count(*) from public.subscriptions),
  1::bigint,
  'użytkownik A widzi tylko własną subskrypcję'
);

select is(
  (
    select count(*)
    from public.workspaces
    where organization_id = (
      select id
      from public.organizations
      where owner_user_id = '20000000-0000-0000-0000-000000000002'
    )
  ),
  0::bigint,
  'workspace użytkownika B pozostaje niewidoczny'
);

select * from finish();
rollback;
