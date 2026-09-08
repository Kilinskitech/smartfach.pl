import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";
import { ConfirmationResend } from "@/components/confirmation-resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import {
  reconcileEmailConfirmationHold,
  syncSubscription,
} from "@/server/stripe-subscriptions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Dokończ aktywację — SmartFach",
  robots: { index: false, follow: false },
};

type ActivationState = "confirmed" | "awaiting-email" | "processing";

async function activationState(sessionId: string | undefined): Promise<ActivationState> {
  if (!sessionId || !/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId))
    return "processing";

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const subscriptionId =
      typeof checkout.subscription === "string"
        ? checkout.subscription
        : checkout.subscription?.id;
    const userId = checkout.metadata?.user_id;
    const organizationId = checkout.metadata?.organization_id;
    if (
      checkout.status !== "complete" ||
      !subscriptionId ||
      !userId ||
      !organizationId
    )
      return "processing";

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const protectedSubscription = await reconcileEmailConfirmationHold(
      subscription,
      stripe,
    );
    await syncSubscription(protectedSubscription, {
      organizationId,
      userId,
      plan: checkout.metadata?.plan,
    });

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) return "processing";
    return data.user.email_confirmed_at ? "confirmed" : "awaiting-email";
  } catch (error) {
    console.error("Nie odczytano aktywacji Stripe", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return "processing";
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sessionId = (await searchParams).session_id;
  const state = await activationState(sessionId);

  if (state === "confirmed")
    return (
      <main className="payment-success">
        <CheckCircle2 size={48} />
        <p className="eyebrow">GOTOWE</p>
        <h1>Konto i 3-dniowa próba są aktywne</h1>
        <p>
          Pierwsza opłata nastąpi po 3 pełnych dniach, jeśli wcześniej nie
          anulujesz abonamentu.
        </p>
        <Link className="button button-primary" href="/app">
          Otwórz SmartFach <span aria-hidden>→</span>
        </Link>
      </main>
    );

  if (state === "awaiting-email")
    return (
      <main className="payment-success payment-confirm-email">
        <MailCheck size={48} />
        <p className="eyebrow">OSTATNI KROK</p>
        <h1>Karta zapisana. Potwierdź teraz adres e-mail.</h1>
        <p>
          Wysłaliśmy wiadomość z przyciskiem aktywacyjnym. Po kliknięciu od razu
          przejdziesz do SmartFach — bez ponownego wybierania planu.
        </p>
        <div className="activation-safety">
          <ShieldCheck size={20} />
          <span>
            Dopóki adres nie zostanie potwierdzony, abonament jest ustawiony do
            zakończenia wraz z trialem i nie przejdzie w płatne odnowienie.
          </span>
        </div>
        <ConfirmationResend sessionId={sessionId!} />
        <Link className="text-link" href="/logowanie">
          Adres już potwierdzony? Zaloguj się
        </Link>
      </main>
    );

  return (
    <main className="payment-success">
      <ShieldCheck size={48} />
      <p className="eyebrow">WERYFIKUJEMY</p>
      <h1>Kończymy uruchamianie konta</h1>
      <p>
        Stripe może potrzebować krótkiej chwili na potwierdzenie. Odśwież stronę;
        jeśli problem nie zniknie, napisz na kontakt@smartfach.pl.
      </p>
      <Link className="button button-secondary" href="/">
        Wróć na stronę główną
      </Link>
    </main>
  );
}
