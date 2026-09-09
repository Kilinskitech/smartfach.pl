import { timingSafeEqual } from "node:crypto";
import { assertDeploymentIdentity } from "@/server/operations";
import { retryPendingContracts } from "@/server/contract-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization") ?? "";
  const wanted = `Bearer ${expected ?? ""}`;
  if (!expected || Buffer.byteLength(supplied) !== Buffer.byteLength(wanted) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(wanted)))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertDeploymentIdentity();
    const result = await retryPendingContracts();
    return Response.json(result, { status: result.failed ? 503 : 200, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("contract_email_maintenance_failed");
    return Response.json({ error: "Email maintenance failed" }, { status: 503 });
  }
}
