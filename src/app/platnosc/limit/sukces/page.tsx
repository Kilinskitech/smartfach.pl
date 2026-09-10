import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import { PaymentResultPage, type PaymentResultStep } from "@/components/payment-result";
import { authenticatedContext } from "@/server/auth";
import { retrieveAndGrantUsageTopUp } from "@/server/stripe-top-ups";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Limit zwiększony — SmartFach",
  robots: { index: false, follow: false },
};

const checkoutSessionPattern = /^cs_(?:test_|live_)?[A-Za-z0-9]+$/;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const sessionId = (await searchParams).session_id;
  let success = false;
  try {
    if (!sessionId || !checkoutSessionPattern.test(sessionId))
      throw new Error("Brak sesji płatności.");
    const context = await authenticatedContext();
    await retrieveAndGrantUsageTopUp(sessionId, {
      organizationId: context.organizationId,
      userId: context.userId,
    });
    success = true;
  } catch (error) {
    console.error("Nie potwierdzono zwiększenia limitu", {
      message: error instanceof Error ? error.message : "unknown",
    });
  }

  const steps: PaymentResultStep[] = [
    { label: "Płatność", state: success ? "complete" : "current" },
    { label: "Nowy limit", state: success ? "complete" : "pending" },
  ];

  return (
    <PaymentResultPage
      icon={success ? <CheckCircle2 size={34} /> : <ShieldAlert size={34} />}
      eyebrow={success ? "GOTOWE" : "WERYFIKUJEMY"}
      title={success ? "Twój limit został zwiększony" : "Nie udało się jeszcze potwierdzić płatności"}
      description={success
        ? "Dodatkowy zakres jest już dostępny i nie zmienia ceny ani terminu Twojego abonamentu."
        : "Stripe może potrzebować krótkiej chwili. Sprawdź ponownie albo skontaktuj się z nami, jeśli komunikat pozostanie."}
      tone={success ? "success" : "pending"}
      steps={steps}
    >
      <Link className="button button-primary" href="/app">
        {success ? "Wróć do SmartFach" : <><RefreshCw size={17} /> Sprawdź w aplikacji</>}
      </Link>
      {!success && <Link className="text-link" href="/kontakt">Płatność pobrana, a limit się nie zmienił?</Link>}
    </PaymentResultPage>
  );
}
