import "server-only";
import { matchesSubscriptionPrice, plans, type PlanId } from "@/domain/billing";
import { applicationUrl, getStripe, stripePriceId } from "@/lib/stripe";
import { recordPurchaseAcceptance } from "./purchase-legal";

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
  const plan = plans[input.plan];
  const price = await stripe.prices.retrieve(stripePriceId(input.plan));
  if (!matchesSubscriptionPrice(input.plan, price))
    throw new Error("Cena Stripe musi odpowiadać cenie planu w PLN za jeden miesiąc.");
  const acceptanceId = await recordPurchaseAcceptance({ userId: input.userId, purchaseKey: input.idempotencyKey,
    offer: `SmartFach ${plan.name}: dziś 0 zł, po 3 pełnych dniach ${plan.price} miesięcznie, automatycznie do anulowania. Limit: ${plan.monthlyCredits} jednostek na okres. Cena całkowita.`,
  });
  const session = await stripe.checkout.sessions.create(
    {
      mode: "subscription",
      submit_type: "subscribe",
      locale: "pl",
      payment_method_collection: "always",
      custom_text: { submit: { message: `3 dni bez opłat, następnie ${plan.price} co miesiąc do anulowania. Limit ${plan.monthlyCredits} jednostek na okres. Anuluj przed końcem próby, aby uniknąć pierwszej opłaty.` } },
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
        legal_acceptance_id: acceptanceId,
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
