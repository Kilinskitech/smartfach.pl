import { z } from "zod";
import { planIdSchema } from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationUrl, getStripe, stripePriceId } from "@/lib/stripe";
import { authenticatedContext } from "@/server/auth";
import { limitedJson } from "@/server/request-body";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  plan: planIdSchema,
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

    const stripe = getStripe();
    const baseUrl = applicationUrl();
    const customerId = existing?.stripe_customer_id
      ? String(existing.stripe_customer_id)
      : null;
    const session = await stripe.checkout.sessions.create(
      {
        mode: "subscription",
        locale: "pl",
        payment_method_collection: "always",
        line_items: [{ price: stripePriceId(input.plan), quantity: 1 }],
        ...(customerId
          ? { customer: customerId }
          : { customer_email: userData.user.email }),
        client_reference_id: context.userId,
        tax_id_collection: { enabled: true },
        metadata: {
          organization_id: context.organizationId,
          user_id: context.userId,
          plan: input.plan,
        },
        subscription_data: {
          trial_period_days: 3,
          trial_settings: {
            end_behavior: { missing_payment_method: "cancel" },
          },
          metadata: {
            organization_id: context.organizationId,
            user_id: context.userId,
            plan: input.plan,
          },
        },
        success_url: `${baseUrl}/platnosc/sukces?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/platnosc?plan=${input.plan}&anulowano=1`,
      },
      { idempotencyKey: `checkout:${context.organizationId}:${input.idempotencyKey}` },
    );
    if (!session.url) throw new Error("Stripe nie zwrócił adresu płatności.");
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
