"use client";

import { useState } from "react";

import {
  Check,
  CreditCard,
  Gauge,
  LockKeyhole,
} from "lucide-react";
import {
  creditPacks,
  monthlyUsagePercentage,
  plans,
  remainingTopUpPercentage,
  type CreditPackId,
} from "@/domain/billing";
import type { Billing } from "@/domain/workspace";
import { Dialog } from "./dialog";
import { PurchaseConsent } from "./purchase-consent";
import { legalDocumentVersion } from "@/domain/operator";

const packNames = {
  mini: ["Małe zwiększenie", "Na kilka dodatkowych zadań"],
  plus: ["Większe zwiększenie", "Na regularną dalszą pracę"],
  max: ["Intensywna praca", "Na wyjątkowo aktywny okres"],
} as const;

export function BillingDialog({
  billing,
  onClose,
}: {
  billing: Billing;
  onClose: () => void;
}) {
  const [busyPack, setBusyPack] = useState<CreditPackId | null>(null);
  const [selectedPack, setSelectedPack] = useState<CreditPackId>("plus");
  const [error, setError] = useState("");
  const [consented, setConsented] = useState(false);
  const plan = plans[billing.plan];
  const percentage = monthlyUsagePercentage(billing);
  const remaining = Math.max(0, 100 - percentage);
  const extraRemaining = remainingTopUpPercentage(billing);
  const selected = creditPacks.find((pack) => pack.id === selectedPack)!;

  async function openCheckout(packId: CreditPackId) {
    if (busyPack || !consented) return;
    setBusyPack(packId);
    setError("");
    try {
      const response = await fetch("/api/billing/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, idempotencyKey: crypto.randomUUID(), termsAccepted: true, earlyServiceRequested: true, legalVersion: legalDocumentVersion }),
      });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url)
        throw new Error(result.error ?? "Nie udało się otworzyć płatności.");
      window.location.assign(result.url);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Nie udało się otworzyć płatności.",
      );
      setBusyPack(null);
    }
  }
  return (
    <Dialog
      title="Zwiększ limit"
      description="Jednorazowo dodaj zapas do obecnego planu. Nie zmieniamy ceny ani terminu abonamentu."
      onClose={onClose}
      busy={Boolean(busyPack)}
      wide
    >
      <div className="billing-dialog">
        <section className="billing-summary billing-summary-compact">
          <div><span className="billing-plan">PLAN {plan.name}</span><strong>{remaining}% miesięcznego limitu pozostało</strong></div>
          <span className="billing-percentage">{percentage}% wykorzystane</span>
          <div className="credit-progress" aria-label={`${percentage}% wykorzystanego limitu`}>
            <span style={{ width: `${percentage}%` }} />
          </div>
        </section>
        <div className="billing-heading">
          <div>
            <p className="eyebrow">WYBIERZ ZAPAS</p>
            <h3>Ile dodatkowego limitu potrzebujesz?</h3>
          </div>
          {extraRemaining > 0 && <span>Masz jeszcze +{extraRemaining}% dodatkowego limitu</span>}
        </div>
        <fieldset className="credit-pack-grid" aria-label="Pakiet dodatkowego limitu">
          {creditPacks.map((pack) => (
            <label key={pack.id} className={`${pack.id === "plus" ? "featured " : ""}${selectedPack === pack.id ? "selected" : ""}`}>
              <input
                type="radio"
                name="creditPack"
                value={pack.id}
                checked={selectedPack === pack.id}
                onChange={() => {
                  setSelectedPack(pack.id);
                  setError("");
                }}
              />
              {pack.id === "plus" && <small>NAJLEPSZY NA START</small>}
              <span className="credit-pack-check">{selectedPack === pack.id ? <Check size={16} /> : <Gauge size={16} />}</span>
              <strong>{packNames[pack.id][0]}</strong>
              <p>{packNames[pack.id][1]}</p>
              <b>+{pack.percentage}% limitu</b>
              <em>{pack.price}</em>
            </label>
          ))}
        </fieldset>
        <section className="billing-checkout-box">
          <div className="billing-order-line"><span>Wybrano <strong>+{selected.percentage}% limitu</strong></span><b>{selected.price}</b></div>
          <p>Jednorazowa płatność. Zwiększenie przechodzi na kolejne okresy i działa przy aktywnym abonamencie. Różne zadania mogą wykorzystywać limit w różnym tempie.</p>
          <PurchaseConsent onChange={setConsented} />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="button" className="button button-primary billing-checkout-button" disabled={Boolean(busyPack) || !consented} onClick={() => void openCheckout(selectedPack)}>
            <CreditCard size={18} />{busyPack ? "Otwieranie Stripe…" : `Kup za ${selected.price}`}
          </button>
          <div className="billing-local-note"><LockKeyhole size={17} /><p><strong>Bezpieczna płatność przez Stripe.</strong> Limit dopiszemy po potwierdzeniu płatności.</p></div>
        </section>
      </div>
    </Dialog>
  );
}
