import { createAdminClient } from "@/lib/supabase/admin";
import { limitedJson } from "@/server/request-body";
import {
  AuthenticationRequired,
  SubscriptionRequired,
  authenticatedContext,
  requireSubscription,
} from "@/server/auth";
import {
  aiConfigured,
  publicAiConfiguration,
  callAssistant,
} from "@/server/assistant-service";
import { readWorkspace } from "@/server/supabase-workspace-repository";
import { assistantRequestSchema } from "@/domain/assistant";
import {
  estimateRequestCredits,
  remainingCredits,
  settleRequestCredits,
} from "@/domain/billing";
import {
  UsageLimitExceeded,
  chargeWorkspaceUsage,
} from "@/server/usage-billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const limits = new Map<string, { windowStart: number; count: number; busy: boolean }>();

function errorResponse(error: unknown) {
  const status =
    error instanceof AuthenticationRequired
      ? 401
      : error instanceof SubscriptionRequired
        ? 402
        : error instanceof UsageLimitExceeded
          ? 402
        : 502;
  return Response.json(
    {
      code:
        error instanceof UsageLimitExceeded
          ? "credit_limit"
          : status === 402
            ? "billing_required"
            : undefined,
      error:
        error instanceof Error && error.name !== "TimeoutError"
          ? error.message
          : "AI nie odpowiedziało w czasie. Twoja wiadomość pozostaje w polu.",
    },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  try {
    await authenticatedContext();
    return Response.json(publicAiConfiguration(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  if (!aiConfigured())
    return Response.json(
      { error: "Asystent nie jest jeszcze podłączony przez właściciela SmartFach." },
      { status: 503 },
    );

  let input;
  try {
    input = assistantRequestSchema.parse(await limitedJson(request, 12_000_000));
  } catch {
    return Response.json(
      { error: "Wiadomość jest nieprawidłowa albo zbyt długa." },
      { status: 400 },
    );
  }

  let context;
  try {
    context = await authenticatedContext();
    await requireSubscription(context.supabase, context.organizationId);
  } catch (error) {
    return errorResponse(error);
  }

  const now = Date.now();
  const current = limits.get(context.userId) ?? {
    windowStart: now,
    count: 0,
    busy: false,
  };
  if (now - current.windowStart >= 3_600_000) {
    current.windowStart = now;
    current.count = 0;
  }
  if (current.busy || current.count >= 20)
    return Response.json(
      {
        error: current.busy
          ? "Poczekaj na poprzednią odpowiedź."
          : "Limit bezpieczeństwa zapytań został osiągnięty. Spróbuj później.",
      },
      { status: 429 },
    );

  current.busy = true;
  current.count += 1;
  limits.set(context.userId, current);

  try {
    const workspace = await readWorkspace(context.supabase, context.organizationId);
    const estimated = estimateRequestCredits(input.attachments);
    if (remainingCredits(workspace.billing) < estimated)
      return Response.json(
        {
          code: "credit_limit",
          error:
            "Limit Twojego planu został wykorzystany. Możesz zwiększyć go, aby kontynuować.",
        },
        { status: 402, headers: { "Cache-Control": "no-store" } },
      );

    const result = await callAssistant(input, workspace, fetch, context.userId);
    if (result.usage) {
      const admin = createAdminClient();
      const { error } = await admin.from("usage_events").insert({
        organization_id: context.organizationId,
        user_id: context.userId,
        conversation_id: input.conversationId ?? null,
        provider_request_id: result.usage.providerRequestId ?? null,
        provider: result.usage.provider ?? null,
        model: result.model,
        prompt_tokens: result.usage.promptTokens,
        completion_tokens: result.usage.completionTokens,
        total_tokens: result.usage.totalTokens,
        reasoning_tokens: result.usage.reasoningTokens,
        cached_tokens: result.usage.cachedTokens,
        cost_usd: result.usage.costUsd,
      });
      if (error && error.code !== "23505")
        console.error("Nie zapisano metryki kosztu OpenRouter", {
          code: error.code,
          requestId: result.usage.providerRequestId ?? "unknown",
        });
    }

    const creditsUsed = settleRequestCredits(
      input.attachments,
      result.sources.length > 0,
      result.usage?.costUsd,
    );
    const charged = await chargeWorkspaceUsage({
      organizationId: context.organizationId,
      userId: context.userId,
      idempotencyKey: input.idempotencyKey ?? crypto.randomUUID(),
      credits: creditsUsed,
      plan: workspace.billing.plan,
      providerRequestId: result.usage?.providerRequestId,
    });

    return Response.json(
      {
        ...result,
        creditsUsed,
        billing: charged.billing,
        workspaceRevision: charged.revision,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return errorResponse(error);
  } finally {
    current.busy = false;
  }
}
