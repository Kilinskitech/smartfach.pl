import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { syncSubscription } from "@/server/stripe-subscriptions";
import { grantUsageTopUpFromSession } from "@/server/stripe-top-ups";
import { confirmPurchaseContract } from "@/server/purchase-legal";
import { assertDeploymentIdentity, withOperation, recordMilestone, OperationBusy } from "@/server/operations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!signature || !secret) return Response.json({ error: "Brak podpisu webhooka." }, { status: 400 });
  const stripe = getStripe();
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return Response.json({ error: "Nieprawidłowy podpis webhooka." }, { status: 400 }); }
  const liveKey = /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY?.trim() ?? "");
  if (event.livemode !== liveKey) return Response.json({ error: "Niezgodny tryb płatności." }, { status: 400 });
  try {
    await assertDeploymentIdentity();
    return await withOperation(`stripe-event:${event.id}`, async (token) => {
      const admin = createAdminClient();
      const { data: existing, error: readError } = await admin.from("stripe_events").select("processed_at").eq("event_id",event.id).maybeSingle();
      if (readError) throw new Error("Nie można sprawdzić zdarzenia.");
      if (existing?.processed_at) return Response.json({ received: true });
      const { error: claimError } = await admin.from("stripe_events").upsert(
        { event_id: event.id, event_type: event.type }, { onConflict: "event_id", ignoreDuplicates: true },
      );
      if (claimError) throw new Error("Nie zapisano zdarzenia.");
      if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const session = event.data.object;
        if (session.metadata?.purchase_type === "usage_top_up") {
          if (session.payment_status === "paid") {
            await grantUsageTopUpFromSession(session);
            await confirmPurchaseContract(session);
            if (session.metadata.user_id) await recordMilestone(session.metadata.user_id, "top_up");
          }
        } else if (event.type === "checkout.session.completed") {
          const id = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
          if (!id) throw new Error("Brak abonamentu.");
          const latest = await syncSubscription(await stripe.subscriptions.retrieve(id), {
            organizationId: session.metadata?.organization_id, userId: session.metadata?.user_id, plan: session.metadata?.plan,
          });
          await confirmPurchaseContract(session, latest.trial_end);
          if (session.metadata?.user_id) await recordMilestone(session.metadata.user_id, "checkout_completed");
        }
      }
      if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
        if (event.data.object.metadata.smartfach_account_deleted !== "true") await syncSubscription(event.data.object);
      }
      const { data: finished, error } = await admin.rpc("complete_stripe_event", { event_id: event.id, lease_token: token });
      if (error || finished !== true) throw new Error("Nie potwierdzono zakończenia zdarzenia.");
      return Response.json({ received: true });
    });
  } catch (error) {
    console.error("stripe_event_failed", { eventId: event.id, eventType: event.type, message: error instanceof Error ? error.message : "unknown" });
    return Response.json({ error: "Webhook zostanie ponowiony." }, { status: error instanceof OperationBusy ? 503 : 500 });
  }
}
