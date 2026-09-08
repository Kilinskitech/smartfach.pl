"use client";

import { useState } from "react";
import Link from "next/link";
import { PurchaseConsent } from "./purchase-consent";
import { legalDocumentVersion } from "@/domain/operator";
import { ArrowRight, Check, CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import {
  normalizePublicPlan,
  plans,
  publicPlanIds,
  type PublicPlanId,
} from "@/domain/billing";

export function CheckoutPlans({
  initialPlan,
  currentStatus,
  configured,
  canceled,
}: {
  initialPlan: PublicPlanId;
  currentStatus?: string;
  configured: boolean;
  canceled: boolean;
}) {
  const [plan, setPlan] = useState(() => normalizePublicPlan(initialPlan));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [consented, setConsented] = useState(false);
  const hasAccess = currentStatus === "active" || currentStatus === "trialing";

  async function openCheckout() {
    if (!consented) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, idempotencyKey: crypto.randomUUID(), termsAccepted: true, earlyServiceRequested: true, legalVersion: legalDocumentVersion }),
      });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string")
        throw new Error(result.error ?? "Nie otwarto płatności.");
      window.location.assign(result.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Nie otwarto płatności.");
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/billing/portal", { method: "POST" });
      const result = await response.json();
      if (!response.ok || typeof result.url !== "string")
        throw new Error(result.error ?? "Nie otwarto portalu płatności.");
      window.location.assign(result.url);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Nie otwarto portalu płatności.");
      setBusy(false);
    }
  }

  return (
    <main className="checkout-page">
      <header>
        <p className="eyebrow">BEZPIECZNY START</p>
        <h1>{hasAccess ? "Twój abonament jest aktywny" : "Wybierz plan i uruchom 3-dniową próbę"}</h1>
        <p>{hasAccess ? "Dostęp do aplikacji wynika ze statusu potwierdzonego przez Stripe." : "Dziś zapłacisz 0 zł. Karta jest wymagana, a pierwsza opłata nastąpi po 3 pełnych dniach, jeśli wcześniej nie anulujesz."}</p>
      </header>

      {canceled && <p className="checkout-notice">Płatność została przerwana. Próba nie wystartowała i niczego nie pobrano.</p>}

      {!hasAccess && (
        <>
          <p className="checkout-entry"><span>TWÓJ SMARTFACH</span><strong>Buduj własny przychód</strong><small>Wybierz tempo pracy. Plan zmienisz poniżej bez przeładowania strony.</small></p>
          <section className="checkout-plan-grid checkout-plan-grid-two">
            {publicPlanIds.map((id) => (
              <button key={id} type="button" aria-pressed={plan === id} className={plan === id ? "selected" : ""} onClick={() => setPlan(id)}>
                <span>{plan === id && <Check size={16} />}{plans[id].name}</span>
                <strong>{plans[id].price}<small>/ miesiąc po próbie</small></strong>
                <p>{plans[id].description}</p>
              </button>
            ))}
          </section>
        </>
      )}

      <section className="checkout-summary">
        <div><CreditCard size={22} /><span><strong>Dane karty obsługuje Stripe</strong><small>SmartFach nie otrzymuje pełnego numeru karty ani CVC.</small></span></div>
        <div><ShieldCheck size={22} /><span><strong>Proste anulowanie</strong><small>Po aktywacji zarządzasz abonamentem w portalu płatności.</small></span></div>
      </section>

      {!hasAccess && <div className="checkout-legal"><p className="purchase-summary">Dziś 0 zł. Po próbie <strong>{plans[plan].price} miesięcznie</strong> do anulowania. Cena całkowita. Plan zawiera {plans[plan].monthlyCredits} jednostek na okres; koszt zależy od zadania, minimum 1 na żądanie. Pula odnawia się bez kumulacji. Maksymalnie 20 zapytań na godzinę. <Link href="/regulamin#punkt-6" target="_blank">Zasady limitów</Link>.</p><PurchaseConsent onChange={setConsented} /></div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!configured ? (
        <p className="setup-inline">Stripe czeka na konfigurację kluczy, cen i webhooka. Przycisk pozostaje wyłączony, aby nie udawać płatności.</p>
      ) : hasAccess ? (
        <div className="checkout-actions"><a className="button button-primary" href="/app">Przejdź do aplikacji <ArrowRight size={18} /></a><button className="button button-secondary" onClick={openPortal} disabled={busy}>Zarządzaj płatnością <ExternalLink size={17} /></button></div>
      ) : (
        <button className="button button-primary checkout-button" onClick={openCheckout} disabled={busy || !consented}>{busy ? "Otwieranie Stripe…" : "Przejdź do bezpiecznego formularza"}<ArrowRight size={18} /></button>
      )}
      <form action="/auth/wyloguj" method="post"><button className="auth-signout">Wyloguj się</button></form>
    </main>
  );
}
