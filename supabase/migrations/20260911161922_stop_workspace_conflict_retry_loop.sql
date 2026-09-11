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
    raise sqlstate 'PT409' using message = 'Dane zmieniły się w innym oknie.';
  end if;

  return query select saved_revision, saved_data;
end;
$$;

revoke all on function public.save_workspace(uuid, uuid, bigint, jsonb) from public, anon, authenticated;
grant execute on function public.save_workspace(uuid, uuid, bigint, jsonb) to service_role;
