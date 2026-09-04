import "server-only";
import type { PlanId } from "@/domain/billing";
import { applicationUrl, getStripe, stripePriceId } from "@/lib/stripe";

export async function createSubscriptionCheckout(input: {
  organizationId: string;
  userId: string;
  email: string;
  plan: PlanId;
  customerId?: string | null;
  cancelPath: string;
  idempotencyKey: string;
}) {
  const stripe = getStripe();
  const baseUrl = applicationUrl();
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      locale: "pl",
      payment_method_collection: "always",
      line_items: [{ price: stripePriceId(input.plan), quantity: 1 }],
      ...(input.customerId
        ? { customer: input.customerId }
        : { customer_email: input.email }),
      client_reference_id: input.userId,
      tax_id_collection: { enabled: true },
      metadata: {
        organization_id: input.organizationId,
        user_id: input.userId,
        plan: input.plan,
      },
      subscription_data: {
        trial_period_days: 3,
        trial_settings: {
          end_behavior: { missing_payment_method: "cancel" },
        },
        metadata: {
          organization_id: input.organizationId,
          user_id: input.userId,
          plan: input.plan,
          smartfach_email_confirmation_hold: "false",
        },
      },
      success_url: `${baseUrl}/platnosc/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: new URL(input.cancelPath, baseUrl).toString(),
    },
    { idempotencyKey: input.idempotencyKey },
  );
  if (!session.url) throw new Error("Stripe nie zwrócił adresu płatności.");
  return session;
}
