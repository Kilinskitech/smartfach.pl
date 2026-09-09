import "server-only";
import { after } from "next/server";
import { matchesSubscriptionPrice, plans, stripeExistingCustomerUpdate, type PlanId } from "@/domain/billing";
import { applicationUrl, getStripe, stripePriceId } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordPurchaseAcceptance } from "./purchase-legal";
import { assertDeploymentIdentity, withOperation, recordMilestone } from "./operations";

export async function createSubscriptionCheckout(input: {
  organizationId: string; userId: string; email: string; plan: PlanId;
  customerId?: string | null; cancelPath: string; idempotencyKey: string;
}) {
  await assertDeploymentIdentity();
  return withOperation(`checkout:${input.organizationId}`, async () => {
    const admin = createAdminClient();
    const stripe = getStripe();
    const baseUrl = applicationUrl();
    const plan = plans[input.plan];
    const [{ data: organization, error: orgError }, { data: subscription, error: subError }, { data: previous, error: previousError }, price] = await Promise.all([
      admin.from("organizations").select("owner_user_id,trial_consumed_at").eq("id",input.organizationId).single(),
      admin.from("subscriptions").select("status,stripe_customer_id,stripe_subscription_id,trial_started_at").eq("organization_id",input.organizationId).maybeSingle(),
      admin.from("checkout_attempts").select("*").eq("organization_id",input.organizationId).maybeSingle(),
      stripe.prices.retrieve(stripePriceId(input.plan)),
    ]);
    if (orgError || subError || previousError || organization?.owner_user_id !== input.userId) throw new Error("Nie można sprawdzić konta płatności.");
    if (subscription && (["active","trialing","past_due","unpaid","paused"].includes(subscription.status) || (subscription.status === "incomplete" && subscription.stripe_subscription_id)))
      throw new Error("Zarządzaj istniejącym abonamentem w portalu płatności.");
    let attempt = previous;
    if (attempt?.session_id) {
      const session = await stripe.checkout.sessions.retrieve(String(attempt.session_id));
      if (session.status === "open" && attempt.plan === input.plan && session.url) return session;
      if (session.status === "open") await stripe.checkout.sessions.expire(session.id);
      if (session.status === "complete" && !["canceled","incomplete_expired"].includes(subscription?.status ?? ""))
        throw new Error("Zakup został ukończony. Poczekaj na potwierdzenie abonamentu.");
      attempt = null;
    }
    if (attempt && attempt.plan !== input.plan) throw new Error("Dokończ poprzedni wybór planu przed zmianą. Spróbuj ponownie z poprzednim planem.");
    // Stripe may prune idempotency keys after 24h. Do not recreate an ambiguous old purchase.
    if (attempt && Date.parse(attempt.created_at) < Date.now() - 23 * 60 * 60 * 1000)
      throw new Error("Poprzednia próba płatności wymaga sprawdzenia przez obsługę. Nie utworzyliśmy kolejnego zakupu.");
    if (!matchesSubscriptionPrice(input.plan,price)) throw new Error("Nieprawidłowa cena miesięczna Stripe.");
    if (!attempt) {
      attempt = {
        organization_id: input.organizationId, attempt_id: crypto.randomUUID(), plan: input.plan,
        trial: !organization.trial_consumed_at && !subscription?.trial_started_at, session_id: null,
        created_at: new Date().toISOString(),
      };
      const { error } = await admin.from("checkout_attempts").upsert(attempt, { onConflict: "organization_id" });
      if (error) throw new Error("Nie zarezerwowano zakupu.");
    }
    const trial = Boolean(attempt.trial);
    const terms = trial
      ? `Dziś 0 zł, po 3 pełnych dniach ${plan.price} miesięcznie do anulowania.`
      : `Dziś ${plan.price}, następnie ${plan.price} co miesiąc do anulowania. Próba na tym koncie została już wykorzystana.`;
    const purchaseKey = `checkout-v2:${attempt.attempt_id}`;
    const acceptanceId = await recordPurchaseAcceptance({
      userId: input.userId, purchaseKey,
      offer: `SmartFach ${plan.name}: ${terms} Plan obejmuje 100% miesięcznego limitu. Cena całkowita.`,
    });
    const customerId = input.customerId ?? subscription?.stripe_customer_id;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", submit_type: "subscribe", locale: "pl", payment_method_collection: "always",
      custom_text: { submit: { message: terms } },
      line_items: [{ price: price.id, quantity: 1 }],
      ...(customerId ? { customer: customerId, customer_update: stripeExistingCustomerUpdate } : { customer_email: input.email }),
      client_reference_id: input.userId, tax_id_collection: { enabled: true },
      metadata: { organization_id: input.organizationId, user_id: input.userId, plan: input.plan, legal_acceptance_id: acceptanceId, checkout_attempt_id: String(attempt.attempt_id) },
      subscription_data: {
        ...(trial ? { trial_period_days: 3, trial_settings: { end_behavior: { missing_payment_method: "cancel" as const } } } : {}),
        metadata: { organization_id: input.organizationId, user_id: input.userId, plan: input.plan, smartfach_email_confirmation_hold: "false" },
      },
      success_url: `${baseUrl}/platnosc/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/platnosc?plan=${input.plan}&anulowano=1`,
    }, { idempotencyKey: purchaseKey });
    if (!session.url) throw new Error("Stripe nie zwrócił adresu płatności.");
    const { error } = await admin.from("checkout_attempts").update({ session_id: session.id }).eq("organization_id", input.organizationId).eq("attempt_id",attempt.attempt_id);
    if (error) throw new Error("Nie zapisano sesji płatności. Spróbuj ponownie.");
    after(() => recordMilestone(input.userId, "checkout_opened"));
    return session;
  });
}
