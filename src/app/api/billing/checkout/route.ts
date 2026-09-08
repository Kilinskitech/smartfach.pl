import { z } from "zod";
import { publicPlanIdSchema } from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { authenticatedContext } from "@/server/auth";
import { limitedJson } from "@/server/request-body";
import { createSubscriptionCheckout } from "@/server/stripe-checkout";
import { purchaseConsentSchema } from "@/domain/legal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = purchaseConsentSchema.extend({
  plan: publicPlanIdSchema,
  idempotencyKey: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await limitedJson(request, 10_000));
    const context = await authenticatedContext();
    if (context.organizationRole !== "owner")
      return Response.json(
        { error: "Tylko właściciel konta może zmienić abonament." },
        { status: 403 },
      );

    const { data: userData, error: userError } = await context.supabase.auth.getUser();
    if (userError || !userData.user?.email)
      return Response.json({ error: "Konto nie ma potwierdzonego adresu e-mail." }, { status: 401 });

    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("subscriptions")
      .select("status, stripe_customer_id")
      .eq("organization_id", context.organizationId)
      .maybeSingle();
    if (existing && ["active", "trialing"].includes(String(existing.status)))
      return Response.json(
        { error: "Ten abonament jest już aktywny. Zarządzaj nim w portalu płatności." },
        { status: 409 },
      );

    const customerId = existing?.stripe_customer_id
      ? String(existing.stripe_customer_id)
      : null;
    const session = await createSubscriptionCheckout({
      organizationId: context.organizationId,
      userId: context.userId,
      email: userData.user.email,
      plan: input.plan,
      customerId,
      cancelPath: `/platnosc?plan=${input.plan}&anulowano=1`,
      idempotencyKey: `checkout:${context.organizationId}:${input.idempotencyKey}`,
    });
    return Response.json({ url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Nie utworzono sesji Stripe Checkout", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json(
      { error: "Nie udało się otworzyć bezpiecznej płatności. Spróbuj ponownie." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
