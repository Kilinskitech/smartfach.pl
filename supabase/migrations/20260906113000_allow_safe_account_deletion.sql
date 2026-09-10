alter table public.organizations
  drop constraint organizations_owner_user_id_fkey,
  add constraint organizations_owner_user_id_fkey
    foreign key (owner_user_id) references auth.users(id) on delete cascade;

alter table public.subscriptions
  drop constraint subscriptions_owner_user_id_fkey,
  add constraint subscriptions_owner_user_id_fkey
    foreign key (owner_user_id) references auth.users(id) on delete cascade;
