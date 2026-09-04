import { RevisionConflict } from "@/server/repository-errors";
import { limitedJson } from "@/server/request-body";
import { workspaceSchema } from "@/domain/workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AuthenticationRequired,
  SubscriptionRequired,
  authenticatedContext,
  requireSubscription,
} from "@/server/auth";
import {
  readWorkspace,
  writeWorkspace,
} from "@/server/supabase-workspace-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const context = await authenticatedContext();
    await requireSubscription(context.supabase, context.organizationId);
    return Response.json(
      await readWorkspace(context.supabase, context.organizationId),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Nie udało się odczytać danych." },
      {
        status:
          error instanceof AuthenticationRequired
            ? 401
            : error instanceof SubscriptionRequired
              ? 402
              : 500,
      },
    );
  }
}
export async function PUT(request: Request) {
  try {
    const context = await authenticatedContext();
    await requireSubscription(context.supabase, context.organizationId);
    const current = await readWorkspace(context.supabase, context.organizationId);
    const next = workspaceSchema.parse(await limitedJson(request));
    if (
      next.billing.plan !== current.billing.plan ||
      next.billing.topUpCredits !== current.billing.topUpCredits ||
      next.billing.periodStartedAt !== current.billing.periodStartedAt ||
      next.billing.usedCredits < current.billing.usedCredits
    )
      return Response.json(
        { error: "Pola rozliczeniowe może zmienić wyłącznie system płatności." },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
    const saved = await writeWorkspace(
      createAdminClient(),
      context.organizationId,
      context.userId,
      next,
    );
    return Response.json(saved, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof RevisionConflict
            ? error.message
            : "Nie zapisano zmian. Sprawdź dane lub połączenie z kontem.",
      },
      {
        status:
          error instanceof AuthenticationRequired
            ? 401
            : error instanceof SubscriptionRequired
              ? 402
              : error instanceof RevisionConflict
                ? 409
                : 400,
      },
    );
  }
}
