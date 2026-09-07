import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
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

  return (
    <main className="payment-success">
      {success ? <CheckCircle2 size={48} /> : <ShieldCheck size={48} />}
      <p className="eyebrow">{success ? "GOTOWE" : "WERYFIKUJEMY"}</p>
      <h1>
        {success
          ? "Twój limit został zwiększony"
          : "Nie udało się jeszcze potwierdzić płatności"}
      </h1>
      <p>
        {success
          ? "Dodatkowy zakres jest już dostępny i nie zmienia Twojego abonamentu."
          : "Płatność może potrzebować krótkiej chwili. Odśwież stronę albo skontaktuj się z nami, jeśli komunikat pozostanie."}
      </p>
      <Link className="button button-primary" href="/app">
        {success ? "Wróć do SmartFach" : "Wróć do aplikacji"}
        <span aria-hidden>→</span>
      </Link>
    </main>
  );
}
