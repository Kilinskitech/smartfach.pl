"use client";

import {
  ArrowUpRight,
  CreditCard,
  Gauge,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { creditPacks, plans } from "@/domain/billing";
import { useRouter } from "next/navigation";
import type { Billing } from "@/domain/workspace";
import { Dialog } from "./dialog";

const packNames = {
  mini: ["Małe zwiększenie", "Do 100 krótkich odpowiedzi"],
  plus: ["Większe zwiększenie", "Do 300 krótkich odpowiedzi"],
  max: ["Intensywna praca", "Do 1000 krótkich odpowiedzi"],
} as const;

export function BillingDialog({
  billing,
  onClose,
}: {
  billing: Billing;
  onClose: () => void;
}) {
  const router = useRouter();
  const plan = plans[billing.plan];
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
            <strong>Limit na ten okres został wykorzystany</strong>
            <p>Wybierz jednorazowe zwiększenie albo przejdź na wyższy plan.</p>
          </div>
          <Gauge size={34} />
        </section>
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
              <button className="button button-primary" disabled>
                <CreditCard size={17} />
                Zwiększ limit
              </button>
            </article>
          ))}
        </div>
        <div className="billing-local-note">
          <LockKeyhole size={18} />
          <p>
            <strong>Abonamentem zarządzasz bezpiecznie przez Stripe.</strong>
            Jednorazowe zwiększenia limitu pozostają wyłączone do chwili wdrożenia
            transakcyjnej księgi użycia. Nie będziemy udawać zakupu samą zmianą licznika.
          </p>
        </div>
      </div>
    </Dialog>
  );
}
