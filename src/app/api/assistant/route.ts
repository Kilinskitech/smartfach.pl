import { limitedJson } from "@/server/request-body";
import { AuthenticationRequired, SubscriptionRequired, authenticatedContext, requireSubscription } from "@/server/auth";
import { aiConfigured, publicAiConfiguration, callAssistant } from "@/server/assistant-service";
import { readWorkspace } from "@/server/supabase-workspace-repository";
import { assistantRequestSchema } from "@/domain/assistant";
import { UsageLimitExceeded, UsageRequestError, beginUsage, finishUsage, failUsage, markUncertainUsage } from "@/server/usage-requests";
import { ProviderRejectedError } from "@/server/provider-errors";
import { assertDeploymentIdentity, recordMilestone } from "@/server/operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const headers = { "Cache-Control": "no-store" };
function errorResponse(error: unknown) {
  const status = error instanceof AuthenticationRequired ? 401 : error instanceof SubscriptionRequired || error instanceof UsageLimitExceeded ? 402 : error instanceof UsageRequestError ? error.status : 502;
  return Response.json({
    code: error instanceof UsageLimitExceeded ? "credit_limit" : error instanceof UsageRequestError ? error.code : status === 402 ? "billing_required" : undefined,
    error: error instanceof Error && error.name !== "TimeoutError" ? error.message : "AI nie odpowiedziało w czasie. Spróbuj ponownie.",
  }, { status, headers });
}
export async function GET() {
  try { await authenticatedContext(); return Response.json(publicAiConfiguration(), { headers }); }
  catch (error) { return errorResponse(error); }
}
export async function POST(request: Request) {
  if (!aiConfigured()) return Response.json({ error: "Asystent jest chwilowo niedostępny." }, { status: 503, headers });
  let input;
  try {
    input = assistantRequestSchema.parse(await limitedJson(request, 12_000_000));
    if (!input.idempotencyKey) throw new Error();
  } catch { return Response.json({ error: "Odśwież aplikację i sprawdź treść wiadomości." }, { status: 400, headers }); }
  try {
    const context = await authenticatedContext();
    await assertDeploymentIdentity();
    await requireSubscription(context.supabase, context.organizationId);
    const replay = await beginUsage(context.organizationId, context.userId, input);
    if (replay) return Response.json(replay, { headers });
    let workspace;
    try {
      workspace = await readWorkspace(context.supabase, context.organizationId);
    } catch (error) {
      await failUsage(context.organizationId, context.userId, input.idempotencyKey!);
      throw error;
    }
    let result;
    try {
      result = await callAssistant(input, workspace, fetch, context.userId);
    } catch (error) {
      if (error instanceof ProviderRejectedError && await failUsage(context.organizationId, context.userId, input.idempotencyKey!))
        return Response.json({ code: "provider_failed", error: error.message }, { status: 502, headers });
      await markUncertainUsage(context.organizationId, context.userId, input.idempotencyKey!);
      console.error("ai_request_uncertain", { requestKey: input.idempotencyKey, reason: error instanceof Error ? error.name : "unknown" });
      throw new UsageRequestError(502, "uncertain", "Nie otrzymaliśmy pewnego wyniku od dostawcy AI. Ta próba wymaga sprawdzenia przez obsługę; nie naliczyliśmy zakończonej odpowiedzi.");
    }
    // Preserve the reservation on ambiguous persistence errors; never dispatch a second paid request.
    const response = await finishUsage(context.organizationId, context.userId, input, result);
    await recordMilestone(context.userId, "first_answer");
    if (input.mode === "guided_start") await recordMilestone(context.userId, "guided_start");
    return Response.json(response, { headers });
  } catch (error) { return errorResponse(error); }
}
