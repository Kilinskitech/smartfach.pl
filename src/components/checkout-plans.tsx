"use client";

import { useState } from "react";
import { ArrowRight, Check, CreditCard, ExternalLink, ShieldCheck } from "lucide-react";
import {
  normalizePlanForSalesEntry,
  plans,
  plansForSalesEntry,
  type PlanId,
  type SalesEntry,
} from "@/domain/billing";

export function CheckoutPlans({
  initialPlan,
  accountType,
  currentStatus,
  configured,
  canceled,
}: {
  initialPlan: PlanId;
  accountType: SalesEntry;
  currentStatus?: string;
  configured: boolean;
  canceled: boolean;
}) {
  const [plan, setPlan] = useState(() =>
    normalizePlanForSalesEntry(accountType, initialPlan),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const hasAccess = currentStatus === "active" || currentStatus === "trialing";
  const planOrder = plansForSalesEntry(accountType);
  const accountTypeLabel = accountType === "discover"
    ? "Buduję biznes od zera"
    : "Mam pomysł lub firmę";

  async function openCheckout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, idempotencyKey: crypto.randomUUID() }),
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
          <p className="checkout-entry"><span>TWÓJ PUNKT STARTU</span><strong>{accountTypeLabel}</strong><small>Plan zmieniasz poniżej bez przeładowania strony.</small></p>
          <section className="checkout-plan-grid checkout-plan-grid-two">
            {planOrder.map((id) => (
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

      {error && <p className="form-error" role="alert">{error}</p>}
      {!configured ? (
        <p className="setup-inline">Stripe czeka na konfigurację kluczy, cen i webhooka. Przycisk pozostaje wyłączony, aby nie udawać płatności.</p>
      ) : hasAccess ? (
        <div className="checkout-actions"><a className="button button-primary" href="/app">Przejdź do aplikacji <ArrowRight size={18} /></a><button className="button button-secondary" onClick={openPortal} disabled={busy}>Zarządzaj płatnością <ExternalLink size={17} /></button></div>
      ) : (
        <button className="button button-primary checkout-button" onClick={openCheckout} disabled={busy}>{busy ? "Otwieranie Stripe…" : "Przejdź do bezpiecznego formularza"}<ArrowRight size={18} /></button>
      )}
      <form action="/auth/wyloguj" method="post"><button className="auth-signout">Wyloguj się</button></form>
    </main>
  );
}
