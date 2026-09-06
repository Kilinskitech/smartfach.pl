import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import {
  reconcileEmailConfirmationHold,
  syncSubscription,
} from "@/server/stripe-subscriptions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!signature || !secret)
    return Response.json({ error: "Brak podpisu webhooka." }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return Response.json({ error: "Nieprawidłowy podpis webhooka." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error: claimError } = await admin.from("stripe_events").insert({
    event_id: event.id,
    event_type: event.type,
  });
  if (claimError?.code === "23505") return Response.json({ received: true });
  if (claimError) return Response.json({ error: "Nie zapisano webhooka." }, { status: 500 });

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const protectedSubscription = await reconcileEmailConfirmationHold(
          subscription,
          stripe,
        );
        await syncSubscription(protectedSubscription, {
          organizationId: session.metadata?.organization_id,
          userId: session.metadata?.user_id,
          plan: session.metadata?.plan,
          paymentMethodAttached: true,
        });
      }
    }
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      if (event.data.object.metadata.smartfach_account_deleted === "true") {
        await admin
          .from("stripe_events")
          .update({ processed_at: new Date().toISOString() })
          .eq("event_id", event.id);
        return Response.json({ received: true });
      }
      const protectedSubscription = await reconcileEmailConfirmationHold(
        event.data.object,
        stripe,
      );
      await syncSubscription(protectedSubscription);
    }
    await admin
      .from("stripe_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("event_id", event.id);
    return Response.json({ received: true });
  } catch (error) {
    await admin.from("stripe_events").delete().eq("event_id", event.id);
    console.error("Nie przetworzono webhooka Stripe", {
      eventId: event.id,
      eventType: event.type,
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json({ error: "Webhook zostanie ponowiony." }, { status: 500 });
  }
}
