import { timingSafeEqual } from "node:crypto";
import { assertDeploymentIdentity } from "@/server/operations";
import { retryPendingContracts } from "@/server/contract-delivery";
import { retryPendingCancellationEmails } from "@/server/cancellation-delivery";

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
    // Independent queues run concurrently within the existing 60-second budget.
    const [contracts, cancellations] = await Promise.allSettled([
      retryPendingContracts(), retryPendingCancellationEmails(),
    ]);
    if (contracts.status === "rejected" || cancellations.status === "rejected")
      throw new Error("Email queue unavailable");
    const result = { ...contracts.value, cancellations: cancellations.value };
    return Response.json(result, { status: result.failed || result.cancellations.failed ? 503 : 200, headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("contract_email_maintenance_failed");
    return Response.json({ error: "Email maintenance failed" }, { status: 503 });
  }
}
