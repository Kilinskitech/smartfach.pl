import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { authenticatedContext } from "@/server/auth";
import { getStripe } from "@/lib/stripe";
import { syncSubscription } from "@/server/stripe-subscriptions";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const context = await authenticatedContext();
  const sessionId = (await searchParams).session_id;
  let ready = false;
  if (sessionId?.startsWith("cs_")) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
    if (session.client_reference_id === context.userId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscription(subscription, {
        organizationId: context.organizationId,
        userId: context.userId,
        plan: session.metadata?.plan,
        paymentMethodAttached: true,
      });
      ready = ["trialing", "active"].includes(subscription.status);
    }
  }
  return <main className="payment-success"><CheckCircle2 size={46} /><h1>{ready ? "Próba została uruchomiona" : "Stripe potwierdza płatność"}</h1><p>{ready ? "Masz dostęp do SmartFach. Pierwsza opłata nastąpi po 3 pełnych dniach, jeśli wcześniej nie anulujesz." : "Status może aktualizować się przez chwilę. Odśwież stronę przed wejściem do aplikacji."}</p><Link className="button button-primary" href={ready ? "/app" : "/platnosc"}>{ready ? "Otwórz SmartFach" : "Sprawdź status"}<Arrow /></Link></main>;
}

function Arrow() {
  return <span aria-hidden>→</span>;
}
