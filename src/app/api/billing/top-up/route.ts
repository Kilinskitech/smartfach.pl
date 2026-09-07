import { z } from "zod";
import { creditPackIdSchema } from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  AuthenticationRequired,
  SubscriptionRequired,
  authenticatedContext,
  requireSubscription,
} from "@/server/auth";
import { limitedJson } from "@/server/request-body";
import { createUsageTopUpCheckout } from "@/server/stripe-top-ups";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  packId: creditPackIdSchema,
  idempotencyKey: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await limitedJson(request, 10_000));
    const context = await authenticatedContext();
    await requireSubscription(context.supabase, context.organizationId);
    if (context.organizationRole !== "owner")
      return Response.json(
        { error: "Tylko właściciel konta może zwiększyć limit." },
        { status: 403 },
      );

    const admin = createAdminClient();
    const { data: subscription, error } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", context.organizationId)
      .single();
    if (error || !subscription?.stripe_customer_id)
      return Response.json(
        { error: "Najpierw aktywuj abonament SmartFach." },
        { status: 409 },
      );

    const session = await createUsageTopUpCheckout({
      organizationId: context.organizationId,
      userId: context.userId,
      customerId: String(subscription.stripe_customer_id),
      packId: input.packId,
      idempotencyKey: `usage-top-up:${context.organizationId}:${input.idempotencyKey}`,
    });
    return Response.json(
      { url: session.url },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const status =
      error instanceof AuthenticationRequired
        ? 401
        : error instanceof SubscriptionRequired
          ? 402
          : error instanceof z.ZodError
            ? 400
            : 502;
    console.error("Nie utworzono płatności zwiększenia limitu", {
      status,
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json(
      {
        error:
          status === 401
            ? "Zaloguj się ponownie."
            : status === 402
              ? "Aktywuj plan, aby zwiększyć limit."
              : status === 400
                ? "Nieprawidłowy pakiet zwiększenia limitu."
                : "Nie udało się otworzyć płatności. Spróbuj ponownie.",
      },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
