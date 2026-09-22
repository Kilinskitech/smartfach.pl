import "server-only";
import { after } from "next/server";
import type Stripe from "stripe";
import { planIdSchema } from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe, planForStripePriceId } from "@/lib/stripe";
import { getOperator } from "./operator-settings";
import { cancellationMessage, cancellationRequest } from "./subscription-cancellation";
import { sendCancellationEmail, smtpConfigured } from "./transactional-email";

/** Called only for verified subscription update/deletion webhooks, not page reads. */
export async function queueCancellationEmail(latest: Stripe.Subscription, eventSnapshot: Stripe.Subscription) {
  const request = cancellationRequest(latest);
  const eventRequest = cancellationRequest(eventSnapshot);
  // Ignore old events, reversals and events for a replaced subscription.
  if (!request || request.id !== eventRequest?.id) return;
  const userId = latest.metadata.user_id;
  const organizationId = latest.metadata.organization_id;
  if (!userId || !organizationId) throw new Error("Cancellation owner missing");
  const { error } = await createAdminClient().from("subscription_cancellation_emails").upsert({
    id: request.id, user_id: userId, organization_id: organizationId,
    subscription_id: latest.id, requested_at: request.requestedAt,
  }, { onConflict: "id", ignoreDuplicates: true });
  if (error) throw new Error("Cancellation email persistence failed");
  try {
    after(async () => {
      try { await deliverCancellationEmail(request.id); }
      catch { console.error("cancellation_email_pending", { messageId: request.id }); }
    });
  } catch {
    // The persisted message remains eligible for the existing email cron.
    console.error("cancellation_email_schedule_failed", { messageId: request.id });
  }
}

export async function deliverCancellationEmail(id: string): Promise<"sent" | "skipped"> {
  if (!smtpConfigured()) throw new Error("SMTP is not configured");
  const admin = createAdminClient();
  const { data: claimed, error: claimError } = await admin.rpc("claim_cancellation_email", { message_id: id });
  if (claimError) throw new Error("Cancellation email claim failed");
  if (claimed !== true) return "skipped";
  const { data: row, error } = await admin.from("subscription_cancellation_emails")
    .select("id,user_id,organization_id,subscription_id,delivery_claimed_at,email_sent_at,suppressed_at")
    .eq("id", id).maybeSingle();
  if (error) throw new Error("Cancellation email read failed");
  if (!row || row.email_sent_at || row.suppressed_at) return "skipped";
  if (!row.delivery_claimed_at) throw new Error("Cancellation email lease missing");

  const subscription = await getStripe().subscriptions.retrieve(String(row.subscription_id));
  if (subscription.metadata.user_id !== row.user_id || subscription.metadata.organization_id !== row.organization_id)
    throw new Error("Cancellation email ownership mismatch");
  const request = cancellationRequest(subscription);
  const current = request?.id === id;
  if (current) {
    const plan = planForStripePriceId(subscription.items.data[0]?.price.id) ?? planIdSchema.safeParse(subscription.metadata.plan).data;
    if (!plan) throw new Error("Cancellation email plan missing");
    const { data: auth, error: authError } = await admin.auth.admin.getUserById(String(row.user_id));
    if (authError || !auth.user?.email) throw new Error("Cancellation email recipient missing");
    const operator = await getOperator();
    await sendCancellationEmail({
      ...cancellationMessage(request!, plan), recipient: auth.user.email,
      replyTo: operator.email, messageId: id,
    });
  }
  // A resumed subscription or superseded cancellation must not get a stale email.
  const { data: completed, error: markError } = await admin.from("subscription_cancellation_emails")
    .update({ [current ? "email_sent_at" : "suppressed_at"]: new Date().toISOString(), delivery_claimed_at: null })
    .eq("id", id).eq("delivery_claimed_at", row.delivery_claimed_at).is("email_sent_at", null).is("suppressed_at", null)
    .select("id").maybeSingle();
  if (markError || !completed) throw new Error("Cancellation email completion failed");
  return current ? "sent" : "skipped";
}

export async function retryPendingCancellationEmails() {
  const cutoff = new Date(Date.now() - 2 * 60_000).toISOString();
  const { data, error } = await createAdminClient().from("subscription_cancellation_emails")
    .select("id").is("email_sent_at", null).is("suppressed_at", null)
    .or(`delivery_claimed_at.is.null,delivery_claimed_at.lt.${cutoff}`)
    .order("delivery_claimed_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true }).order("id", { ascending: true }).limit(5);
  if (error) throw new Error("Cancellation email queue read failed");
  const results = await Promise.all((data ?? []).map(async row => {
    try { return await deliverCancellationEmail(String(row.id)); }
    catch {
      console.error("cancellation_email_retry_failed", { messageId: row.id });
      return "failed";
    }
  }));
  return { attempted: results.length, sent: results.filter(r => r === "sent").length, failed: results.filter(r => r === "failed").length };
}
