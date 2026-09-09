import { after } from "next/server";
import { limitedJson } from "@/server/request-body";
import { AuthenticationRequired, SubscriptionRequired, authenticatedContext, requireSubscription } from "@/server/auth";
import { aiConfigured, publicAiConfiguration, callAssistant } from "@/server/assistant-service";
import { readWorkspace } from "@/server/supabase-workspace-repository";
import { assistantRequestSchema } from "@/domain/assistant";
import { UsageLimitExceeded, UsageRequestError, beginUsage, finishUsage, failUsage, markUncertainUsage } from "@/server/usage-requests";
import { ProviderOutputError, ProviderRejectedError } from "@/server/provider-errors";
import { recordMilestone } from "@/server/operations";
import { greetingReply } from "@/domain/greeting";

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
  const started = performance.now();
  const timing: Record<string, number> = {};
  if (!aiConfigured()) return Response.json({ error: "Asystent jest chwilowo niedostępny." }, { status: 503, headers });
  let input: ReturnType<typeof assistantRequestSchema.parse>;
  try {
    input = assistantRequestSchema.parse(await limitedJson(request, 12_000_000));
    if (!input.idempotencyKey) throw new Error();
  } catch { return Response.json({ error: "Odśwież aplikację i sprawdź treść wiadomości." }, { status: 400, headers }); }
  try {
    const context = await authenticatedContext();
    timing.authMs = Math.round(performance.now() - started);
    // Independent reads for this verified organization. Nothing is returned and
    // no generation is dispatched until the payment gate also succeeds.
    const [, workspace] = await Promise.all([
      requireSubscription(context.supabase, context.organizationId),
      readWorkspace(context.supabase, context.organizationId),
    ]);
    timing.contextMs = Math.round(performance.now() - started);
    const greeting = greetingReply(input);
    if (greeting) {
      console.info("assistant_timing", { requestKey: input.idempotencyKey, kind: "greeting", ...timing, totalMs: Math.round(performance.now() - started) });
      return Response.json({ reply: greeting, model: "smartfach/system-greeting", sources: [], quote: null, report: null, billing: workspace.billing, workspaceRevision: workspace.revision }, { headers });
    }
    const replay = await beginUsage(context.organizationId, context.userId, input);
    if (replay) return Response.json(replay, { headers });
    timing.admittedMs = Math.round(performance.now() - started);
    async function execute(onReply?: (reply: string) => void) {
    let result;
    try {
      result = await callAssistant(input, workspace, fetch, context.userId, onReply ? (reply) => {
        timing.firstTextMs ??= Math.round(performance.now() - started);
        onReply(reply);
      } : undefined);
      timing.generatedMs = Math.round(performance.now() - started);
    } catch (error) {
      if ((error instanceof ProviderRejectedError || error instanceof ProviderOutputError) && await failUsage(context.organizationId, context.userId, input.idempotencyKey!))
        throw new UsageRequestError(502, "provider_failed", error.message);
      await markUncertainUsage(context.organizationId, context.userId, input.idempotencyKey!);
      console.error("ai_request_uncertain", { requestKey: input.idempotencyKey, reason: error instanceof Error ? error.name : "unknown" });
      throw new UsageRequestError(502, "uncertain", "Nie otrzymaliśmy pewnego wyniku od dostawcy AI. Ta próba wymaga sprawdzenia przez obsługę; nie naliczyliśmy zakończonej odpowiedzi.");
    }
    // Preserve the reservation on ambiguous persistence errors; never dispatch a second paid request.
    const response = await finishUsage(context.organizationId, context.userId, input, result);
    after(async () => {
      await recordMilestone(context.userId, "first_answer");
      if (input.mode === "guided_start") await recordMilestone(context.userId, "guided_start");
    });
    console.info("assistant_timing", { requestKey: input.idempotencyKey, ...timing, totalMs: Math.round(performance.now() - started) });
    return response;
    }
    if (!request.headers.get("accept")?.includes("text/event-stream")) return Response.json(await execute(), { headers });
    const encoder = new TextEncoder();
    let connected = true;
    let work: Promise<void> = Promise.resolve();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (event: unknown) => {
          if (!connected) return;
          try { controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)); }
          catch { connected = false; }
        };
        send({ type: "progress" });
        const heartbeat = setInterval(() => send({ type: "progress" }), 8000);
        work = (async () => {
          try {
            let previous = "";
            const result = await execute((reply) => {
              send(reply.startsWith(previous) ? { type: "delta", delta: reply.slice(previous.length) } : { type: "preview", reply });
              previous = reply;
            });
            send({ type: "result", result }); // only after durable settlement
          } catch (error) {
            send({ type: "error", ...await errorResponse(error).json() });
          } finally {
            clearInterval(heartbeat);
            if (connected) { try { controller.close(); } catch { /* client left */ } }
          }
        })();
      },
      cancel() { connected = false; },
    });
    // Keep consuming and settling an already dispatched generation if the tab
    // closes. Client disconnect is not proof that Google stopped billing.
    after(() => work);
    return new Response(body, { headers: { "Cache-Control": "no-store, no-transform", "Content-Type": "text/event-stream; charset=utf-8", "X-Accel-Buffering": "no" } });
  } catch (error) { return errorResponse(error); }
}
