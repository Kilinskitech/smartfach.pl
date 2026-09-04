import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { workspaceSchema, type Workspace } from "@/domain/workspace";
import { RevisionConflict } from "./repository-errors";

export async function readWorkspace(
  supabase: SupabaseClient,
  organizationId: string,
): Promise<Workspace> {
  const { data, error } = await supabase
    .from("workspaces")
    .select("revision, data")
    .eq("organization_id", organizationId)
    .single();
  if (error || !data) throw new Error("Nie można odczytać danych konta.");
  return workspaceSchema.parse({
    ...(data.data as object),
    revision: Number(data.revision),
  });
}

export async function writeWorkspace(
  supabase: SupabaseClient,
  organizationId: string,
  actorUserId: string,
  input: unknown,
): Promise<Workspace> {
  const next = workspaceSchema.parse(input);
  const serialized = JSON.stringify(next);
  if (Buffer.byteLength(serialized) > 2_000_000)
    throw new Error("Osiągnięto limit danych konta.");

  const { data, error } = await supabase.rpc("save_workspace", {
    target_organization_id: organizationId,
    actor_user_id: actorUserId,
    expected_revision: next.revision,
    next_data: next,
  });
  if (error?.code === "40001")
    throw new RevisionConflict(
      "Dane zmieniły się w innym oknie. Odśwież widok przed zapisem.",
    );
  if (error)
    console.error("Supabase odrzucił zapis workspace", {
      code: error.code,
      message: error.message,
      hint: error.hint,
    });
  if (error || !Array.isArray(data) || !data[0])
    throw new Error("Nie zapisano zmian w koncie.");
  const row = data[0] as { revision: number; data: object };
  return workspaceSchema.parse({
    ...row.data,
    revision: Number(row.revision),
  });
}
