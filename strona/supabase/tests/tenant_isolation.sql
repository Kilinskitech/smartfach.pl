begin;

create extension if not exists pgtap with schema extensions;

select plan(9);

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

select lives_ok(
  $$
    select *
    from public.save_workspace(
      (
        select id
        from public.organizations
        where owner_user_id = '10000000-0000-0000-0000-000000000001'
      ),
      '10000000-0000-0000-0000-000000000001',
      0,
      (
        select data
        from public.workspaces
        where organization_id = (
          select id
          from public.organizations
          where owner_user_id = '10000000-0000-0000-0000-000000000001'
        )
      )
    )
  $$,
  'workspace można zapisać z kontrolą wersji'
);

select lives_ok(
  $$
    select *
    from public.charge_usage_credits(
      (select id from public.organizations where owner_user_id = '10000000-0000-0000-0000-000000000001'),
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000003',
      2,
      225,
      'test-provider-request'
    )
  $$,
  'serwer nalicza użycie z kluczem idempotencji'
);

select lives_ok(
  $$
    select public.grant_usage_top_up(
      (select id from public.organizations where owner_user_id = '10000000-0000-0000-0000-000000000001'),
      '10000000-0000-0000-0000-000000000001',
      'cs_test_SmartFachTopUp123',
      'mini',
      150,
      1999,
      'pln'
    )
  $$,
  'serwer dopisuje opłacone zwiększenie limitu'
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
  (select count(*) from public.usage_credit_charges),
  1::bigint,
  'użytkownik A widzi tylko własne naliczenia limitu'
);

select is(
  (select count(*) from public.usage_top_ups),
  1::bigint,
  'użytkownik A widzi tylko własne zwiększenia limitu'
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
