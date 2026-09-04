import "server-only";
import type Stripe from "stripe";
import {
  emailConfirmationHoldAction,
  planIdSchema,
  type PlanId,
} from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, planForStripePriceId } from "@/lib/stripe";

const emailConfirmationHoldMetadata = "smartfach_email_confirmation_hold";

const timestamp = (value: number | null | undefined) =>
  typeof value === "number" ? new Date(value * 1000).toISOString() : null;

function periodEnd(subscription: Stripe.Subscription) {
  const ends = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");
  return ends.length ? timestamp(Math.max(...ends)) : null;
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
  const reconciled = await reconcileEmailConfirmationHold(subscription, stripe);
  if (
    reconciled.cancel_at_period_end !== subscription.cancel_at_period_end ||
    reconciled.metadata[emailConfirmationHoldMetadata] !==
      subscription.metadata[emailConfirmationHoldMetadata]
  )
    await syncSubscription(reconciled);
}

export async function syncSubscription(
  subscription: Stripe.Subscription,
  checkout?: {
    organizationId?: string;
    userId?: string;
    plan?: string;
    paymentMethodAttached?: boolean;
  },
) {
  const admin = createAdminClient();
  let organizationId = checkout?.organizationId ?? subscription.metadata.organization_id;
  let ownerUserId = checkout?.userId ?? subscription.metadata.user_id;
  const pricePlan = planForStripePriceId(subscription.items.data[0]?.price.id);
  let plan: PlanId | undefined =
    pricePlan ??
    planIdSchema.safeParse(checkout?.plan ?? subscription.metadata.plan).data;

  if (!organizationId || !ownerUserId || !plan) {
    const { data } = await admin
      .from("subscriptions")
      .select("organization_id, owner_user_id, plan")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();
    organizationId ||= data?.organization_id;
    ownerUserId ||= data?.owner_user_id;
    const existingPlan = planIdSchema.safeParse(data?.plan);
    if (!plan && existingPlan.success) plan = existingPlan.data;
  }

  if (!organizationId || !ownerUserId || !plan)
    throw new Error("Subskrypcja Stripe nie ma powiązania z kontem SmartFach.");

  const { data: existingSubscription } = await admin
    .from("subscriptions")
    .select("payment_method_attached")
    .eq("organization_id", organizationId)
    .maybeSingle();
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  const paymentMethodAttached = Boolean(
    subscription.default_payment_method ||
      checkout?.paymentMethodAttached ||
      existingSubscription?.payment_method_attached,
  );
  const { error } = await admin.from("subscriptions").upsert(
    {
      organization_id: organizationId,
      owner_user_id: ownerUserId,
      plan,
      status: subscription.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      trial_started_at: timestamp(subscription.trial_start),
      trial_ends_at: timestamp(subscription.trial_end),
      current_period_ends_at: periodEnd(subscription),
      cancel_at_period_end: subscription.cancel_at_period_end,
      payment_method_attached: paymentMethodAttached,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" },
  );
  if (error) throw new Error("Nie zapisano statusu subskrypcji.");

  const { data: workspaceRow } = await admin
    .from("workspaces")
    .select("revision, data")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (workspaceRow?.data && typeof workspaceRow.data === "object") {
    const workspace = workspaceRow.data as Record<string, unknown>;
    const billing =
      workspace.billing && typeof workspace.billing === "object"
        ? (workspace.billing as Record<string, unknown>)
        : {};
    if (billing.plan === plan) return;
    const expectedRevision = Number(workspaceRow.revision);
    const nextData = {
      ...workspace,
      revision: expectedRevision,
      billing: { ...billing, plan },
    };
    const { error: workspaceError } = await admin.rpc("save_workspace", {
      target_organization_id: organizationId,
      actor_user_id: ownerUserId,
      expected_revision: expectedRevision,
      next_data: nextData,
    });
    if (workspaceError) throw new Error("Nie zsynchronizowano planu w koncie.");
  }
}
