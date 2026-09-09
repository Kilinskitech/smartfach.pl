import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MailCheck, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { ConfirmationResend } from "@/components/confirmation-resend";
import { PaymentResultPage, type PaymentResultStep } from "@/components/payment-result";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { confirmPurchaseContract } from "@/server/purchase-legal";
import {
  syncSubscription,
} from "@/server/stripe-subscriptions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata: Metadata = {
  title: "Dokończ aktywację — SmartFach",
  robots: { index: false, follow: false },
};

type ActivationState = "confirmed" | "awaiting-email" | "processing" | "missing";

const stepsFor = (state: ActivationState): PaymentResultStep[] => [
  {
    label: "Konto",
    state: state === "missing" ? "pending" : "complete",
  },
  {
    label: "Karta",
    state:
      state === "confirmed" || state === "awaiting-email"
        ? "complete"
        : state === "processing"
          ? "current"
          : "pending",
  },
  {
    label: "Aktywacja",
    state:
      state === "confirmed"
        ? "complete"
        : state === "awaiting-email"
          ? "current"
          : "pending",
  },
];

async function activationState(sessionId: string | undefined): Promise<ActivationState> {
  if (!sessionId || !/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId))
    return "missing";

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
    const protectedSubscription = await syncSubscription(subscription, {
      organizationId,
      userId,
      plan: checkout.metadata?.plan,
    });

    // Webhook pozostaje główną ścieżką. Powrót ze Stripe bezpiecznie ponawia
    // zapis potwierdzenia do kolejki, gdy webhook jest opóźniony.
    try {
      await confirmPurchaseContract(checkout, protectedSubscription.trial_end);
    } catch (error) {
      console.error("Nie zapisano potwierdzenia umowy ze strony sukcesu", {
        sessionId: checkout.id,
        message: error instanceof Error ? error.message : "unknown",
      });
    }

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
      <PaymentResultPage
        icon={<CheckCircle2 size={34} />}
        eyebrow="GOTOWE"
        title="Konto zostało aktywowane"
        description="Możesz od razu przejść do SmartFach i zacząć pracę nad pierwszą ofertą."
        steps={stepsFor(state)}
      >
        <p className="payment-result-detail">
          Plan i termin następnej płatności sprawdzisz w swoim koncie.
          Jeśli rozpoczynasz pierwszą próbę, możesz anulować ją przed końcem 3 dni,
          aby uniknąć pierwszej opłaty.
        </p>
        <Link className="button button-primary" href="/app">
          Otwórz SmartFach <span aria-hidden>→</span>
        </Link>
      </PaymentResultPage>
    );

  if (state === "awaiting-email")
    return (
      <PaymentResultPage
        icon={<MailCheck size={34} />}
        eyebrow="OSTATNI KROK"
        title="Karta zapisana. Potwierdź adres e-mail."
        description="Wysłaliśmy wiadomość z przyciskiem aktywacyjnym. Po kliknięciu od razu przejdziesz do SmartFach — bez ponownego wybierania planu."
        tone="pending"
        steps={stepsFor(state)}
      >
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
      </PaymentResultPage>
    );

  if (state === "missing")
    return (
      <PaymentResultPage
        icon={<ShieldAlert size={34} />}
        eyebrow="BRAK DANYCH ZAMÓWIENIA"
        title="Otwórz stronę, na którą przekierował Cię Stripe"
        description="Ten ekran działa z indywidualnym identyfikatorem płatności. Jeśli adres został otwarty ręcznie, nie możemy sprawdzić zamówienia."
        tone="attention"
        steps={stepsFor(state)}
      >
        <Link className="button button-primary" href="/cennik">
          Wróć do wyboru planu
        </Link>
        <Link className="text-link" href="/kontakt">
          Płatność została wykonana? Napisz do nas
        </Link>
      </PaymentResultPage>
    );

  return (
    <PaymentResultPage
      icon={<RefreshCw size={34} />}
      eyebrow="WERYFIKUJEMY"
      title="Kończymy uruchamianie konta"
      description="Stripe może potrzebować krótkiej chwili na potwierdzenie płatności. Twoje zamówienie nie zostanie utworzone drugi raz."
      tone="pending"
      steps={stepsFor(state)}
    >
      <a
        className="button button-primary"
        href={`/platnosc/sukces?session_id=${encodeURIComponent(sessionId!)}`}
      >
        <RefreshCw size={17} aria-hidden="true" /> Sprawdź ponownie
      </a>
      <Link className="text-link" href="/kontakt">
        Problem nie znika? Skontaktuj się z nami
      </Link>
    </PaymentResultPage>
  );
}
