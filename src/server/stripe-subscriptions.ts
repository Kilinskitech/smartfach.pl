import "server-only";
import type Stripe from "stripe";
import {
  emailConfirmationHoldAction,
  planIdSchema,
  type PlanId,
} from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, planForStripePriceId } from "@/lib/stripe";
import { withOperation, assertDeploymentIdentity, recordMilestone } from "./operations";

const emailConfirmationHoldMetadata = "smartfach_email_confirmation_hold";

const timestamp = (value: number | null | undefined) =>
  typeof value === "number" ? new Date(value * 1000).toISOString() : null;

function periodEnd(subscription: Stripe.Subscription) {
  const ends = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");
  return ends.length ? timestamp(Math.max(...ends)) : null;
}

function periodStart(subscription: Stripe.Subscription) {
  const starts = subscription.items.data
    .map((item) => item.current_period_start)
    .filter((value): value is number => typeof value === "number");
  return starts.length ? timestamp(Math.min(...starts)) : null;
}

export async function reconcileEmailConfirmationHold(
  subscription: Stripe.Subscription,
  stripe = getStripe(),
) {
  const userId = subscription.metadata.user_id;
  if (!userId) return subscription;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);
  if (error || !data.user)
    throw new Error("Nie można sprawdzić potwierdzenia adresu e-mail.");

  const emailConfirmed = Boolean(data.user.email_confirmed_at);
  const managedHold =
    subscription.metadata[emailConfirmationHoldMetadata] === "true";
  const action = emailConfirmationHoldAction({
    subscriptionStatus: subscription.status,
    emailConfirmed,
    managedHold,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });
  if (!action) return subscription;

  return stripe.subscriptions.update(
    subscription.id,
    {
      cancel_at_period_end: action === "apply",
      metadata: {
        [emailConfirmationHoldMetadata]: action === "apply" ? "true" : "false",
      },
    },
    { idempotencyKey: `email-confirmation:${action}:${subscription.id}` },
  );
}

export async function releaseEmailConfirmationHoldForUser(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (error || !data?.stripe_subscription_id) return;

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    String(data.stripe_subscription_id),
  );
  await syncSubscription(subscription);
}

export async function subscriptionHasPaymentMethod(
  subscription: Stripe.Subscription,
  stripe = getStripe(),
) {
  if (subscription.default_payment_method || subscription.default_source)
    return true;
  const customer =
    typeof subscription.customer === "string"
      ? await stripe.customers.retrieve(subscription.customer)
      : subscription.customer;
  if ("deleted" in customer && customer.deleted) return false;
  return Boolean(
    customer.invoice_settings.default_payment_method || customer.default_source,
  );
}

export async function syncSubscription(
  subscription: Stripe.Subscription,
  checkout?: { organizationId?: string; userId?: string; plan?: string },
) {
  await assertDeploymentIdentity();
  const admin = createAdminClient();
  const organizationId = checkout?.organizationId ?? subscription.metadata.organization_id;
  const ownerUserId = checkout?.userId ?? subscription.metadata.user_id;
  if (!organizationId || !ownerUserId) throw new Error("Brak powiązania abonamentu z kontem.");
  return withOperation(`subscription:${organizationId}`, async (token) => {
    const stripe = getStripe();
    // Fetch AFTER acquiring the organization lease. Snapshot events can arrive out of order.
    const fresh = await stripe.subscriptions.retrieve(subscription.id);
    const { data: previous, error: previousError } = await admin.from("subscriptions")
      .select("stripe_subscription_id,stripe_created_at").eq("organization_id", organizationId).maybeSingle();
    if (previousError) throw new Error("Nie odczytano abonamentu.");
    if (previous?.stripe_subscription_id && previous.stripe_subscription_id !== fresh.id) {
      const previousCreated = Number(previous.stripe_created_at) || (await stripe.subscriptions.retrieve(String(previous.stripe_subscription_id))).created;
      if (previousCreated >= fresh.created) return fresh;
    }
    if (fresh.metadata.organization_id !== organizationId || fresh.metadata.user_id !== ownerUserId)
      throw new Error("Niezgodność właściciela abonamentu.");
    const reconciled = await reconcileEmailConfirmationHold(fresh, stripe);
    const plan: PlanId | undefined = planForStripePriceId(reconciled.items.data[0]?.price.id)
      ?? planIdSchema.safeParse(checkout?.plan ?? reconciled.metadata.plan).data;
    if (!plan) throw new Error("Nieznany plan abonamentu.");
    const customer = typeof reconciled.customer === "string" ? reconciled.customer : reconciled.customer.id;
    const { error } = await admin.rpc("apply_subscription_snapshot", {
      org: organizationId, actor: ownerUserId, lease_token: token,
      snapshot: {
        id: reconciled.id, created: reconciled.created, customer, plan, status: reconciled.status,
        trial_start: timestamp(reconciled.trial_start), trial_end: timestamp(reconciled.trial_end),
        period_start: periodStart(reconciled), period_end: periodEnd(reconciled),
        cancel_at_period_end: reconciled.cancel_at_period_end,
        payment_method: await subscriptionHasPaymentMethod(reconciled, stripe),
      },
    });
    if (error) throw new Error("Nie zsynchronizowano abonamentu i limitu w koncie.");
    if (reconciled.status === "active") await recordMilestone(ownerUserId, "paid");
    if (reconciled.status === "canceled") await recordMilestone(ownerUserId, "canceled");
    return reconciled;
  });
}
