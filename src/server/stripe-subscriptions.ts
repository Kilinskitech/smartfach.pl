import "server-only";
import type Stripe from "stripe";
import { planIdSchema, type PlanId } from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { planForStripePriceId } from "@/lib/stripe";

const timestamp = (value: number | null | undefined) =>
  typeof value === "number" ? new Date(value * 1000).toISOString() : null;

function periodEnd(subscription: Stripe.Subscription) {
  const ends = subscription.items.data
    .map((item) => item.current_period_end)
    .filter((value): value is number => typeof value === "number");
  return ends.length ? timestamp(Math.max(...ends)) : null;
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
