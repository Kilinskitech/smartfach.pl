"use client";

import { useState } from "react";

import {
  ArrowUpRight,
  CreditCard,
  Gauge,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import {
  creditPacks,
  monthlyUsagePercentage,
  plans,
  remainingCredits,
  remainingTopUpCredits,
  type CreditPackId,
} from "@/domain/billing";
import { useRouter } from "next/navigation";
import type { Billing } from "@/domain/workspace";
import { Dialog } from "./dialog";

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
  const router = useRouter();
  const [busyPack, setBusyPack] = useState<CreditPackId | null>(null);
  const [error, setError] = useState("");
  const plan = plans[billing.plan];
  const percentage = monthlyUsagePercentage(billing);
  const remaining = remainingCredits(billing);
  const hasExtraLimit = remainingTopUpCredits(billing) > 0;

  async function openCheckout(packId: CreditPackId) {
    if (busyPack) return;
    setBusyPack(packId);
    setError("");
    try {
      const response = await fetch("/api/billing/top-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId, idempotencyKey: crypto.randomUUID() }),
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
      description="Pracuj dalej bez czekania na odnowienie planu."
      onClose={onClose}
      wide
    >
      <div className="billing-dialog">
        <section className="billing-summary">
          <div>
            <span className="billing-plan">Plan {plan.name}</span>
            <strong>{percentage}% miesięcznego limitu wykorzystane</strong>
            <p>
              {remaining > 0
                ? "Możesz pracować dalej albo zwiększyć zapas już teraz."
                : "Zwiększ limit, aby od razu kontynuować pracę."}
            </p>
          </div>
          <Gauge size={34} />
          <div className="credit-progress" aria-label={`${percentage}% wykorzystanego limitu`}>
            <span style={{ width: `${percentage}%` }} />
          </div>
        </section>
        <div className="credit-rules">
          <span><Gauge size={16} /> Miesięczny limit odnawia się automatycznie</span>
          <span><RefreshCw size={16} /> {hasExtraLimit ? "Masz aktywny dodatkowy zapas" : "Dodatkowy zapas nie wygasa z końcem miesiąca"}</span>
        </div>
        <div className="limit-renewal-note">
          <RefreshCw size={17} />
          <span>
            Podstawowy limit odnowi się automatycznie z kolejnym okresem planu.
          </span>
          <button onClick={() => router.push("/platnosc")}>
            Wyższy plan <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="billing-heading">
          <div>
            <p className="eyebrow">PRACUJ DALEJ TERAZ</p>
            <h3>Jednorazowo zwiększ swój limit</h3>
          </div>
          <span>Nie zmienia abonamentu</span>
        </div>
        <div className="credit-pack-grid">
          {creditPacks.map((pack) => (
            <article key={pack.id} className={pack.id === "plus" ? "featured" : ""}>
              {pack.id === "plus" && <small>NAJLEPSZY NA START</small>}
              <Gauge size={23} />
              <strong>{packNames[pack.id][0]}</strong>
              <p>{packNames[pack.id][1]}</p>
              <span>{pack.price}</span>
              <button
                className="button button-primary"
                disabled={Boolean(busyPack)}
                onClick={() => void openCheckout(pack.id)}
              >
                <CreditCard size={17} />
                {busyPack === pack.id ? "Otwieranie…" : "Zwiększ limit"}
              </button>
            </article>
          ))}
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="billing-local-note">
          <LockKeyhole size={18} />
          <p>
            <strong>Bezpieczna płatność jednorazowa przez Stripe.</strong>
            Zwiększenie zostanie dopisane po potwierdzeniu płatności i nie zmieni
            ceny ani terminu Twojego abonamentu.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
