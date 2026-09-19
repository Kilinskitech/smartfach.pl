import "server-only";
import type Stripe from "stripe";
import { planIdSchema, type PlanId } from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { planForStripePriceId } from "@/lib/stripe";

export type FirstPaidSubscriptionInvoice = {
  invoiceId: string;
  paymentId: string | null;
  paymentIntentId: string | null;
  chargeId: string | null;
  subscriptionId: string;
  organizationId: string;
  userId: string;
  plan: PlanId;
  amountGrosze: number;
  currency: string;
  paidAt: string;
};

function objectId(value: string | { id: string } | null | undefined) {
  return typeof value === "string" ? value : value?.id ?? null;
}

export async function captureFirstPaidSubscriptionInvoice(
  invoice: Stripe.Invoice,
  stripe: Stripe,
): Promise<FirstPaidSubscriptionInvoice | null> {
  const subscriptionReference = invoice.parent?.subscription_details?.subscription;
  if (
    invoice.status !== "paid" ||
    invoice.amount_paid <= 0 ||
    invoice.billing_reason !== "subscription_cycle" ||
    !subscriptionReference
  )
    return null;

  const subscription =
    typeof subscriptionReference === "string"
      ? await stripe.subscriptions.retrieve(subscriptionReference)
      : subscriptionReference;
  const metadata = invoice.parent?.subscription_details?.metadata ?? subscription.metadata;
  const userId = metadata?.user_id ?? subscription.metadata.user_id;
  const organizationId = metadata?.organization_id ?? subscription.metadata.organization_id;
  if (!userId || !organizationId) return null;

  const plan =
    planIdSchema.safeParse(metadata?.plan ?? subscription.metadata.plan).data ??
    planForStripePriceId(subscription.items.data[0]?.price.id);
  if (!plan) return null;

  const payments =
    invoice.payments?.data ??
    (await stripe.invoicePayments.list({ invoice: invoice.id, status: "paid", limit: 1 })).data;
  const payment = payments.find((candidate) => candidate.status === "paid") ?? null;
  const paidAtSeconds =
    invoice.status_transitions.paid_at ?? payment?.status_transitions.paid_at ?? invoice.created;
  const paidAt = new Date(paidAtSeconds * 1000).toISOString();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("product_events")
    .upsert(
      { user_id: userId, event: "paid", occurred_at: paidAt },
      { onConflict: "user_id,event", ignoreDuplicates: true },
    )
    .select("event")
    .maybeSingle();
  if (error) throw new Error("Nie zapisano pierwszej płatności po próbie.");
  if (!data) return null;

  return {
    invoiceId: invoice.id,
    paymentId: payment?.id ?? null,
    paymentIntentId: objectId(payment?.payment.payment_intent),
    chargeId: objectId(payment?.payment.charge),
    subscriptionId: subscription.id,
    organizationId,
    userId,
    plan,
    amountGrosze: invoice.amount_paid,
    currency: invoice.currency.toUpperCase(),
    paidAt,
  };
}
