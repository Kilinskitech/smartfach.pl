import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertDeploymentIdentity } from "@/server/operations";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization") ?? "";
  const wanted = `Bearer ${expected ?? ""}`;
  if (!expected || Buffer.byteLength(supplied) !== Buffer.byteLength(wanted) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(wanted)))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertDeploymentIdentity();
    const { error } = await createAdminClient().rpc("purge_ai_response_bodies");
    if (error) throw error;
    return Response.json({ ok: true });
  } catch { return Response.json({ error: "Maintenance failed" }, { status: 500 }); }
}
