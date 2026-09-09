import type { ReactNode } from "react";
import Link from "next/link";
import { Check, LifeBuoy, LockKeyhole, ShieldCheck } from "lucide-react";
import { BrandMark } from "./brand";

export type PaymentResultStep = {
  label: string;
  state: "complete" | "current" | "pending";
};

export function PaymentResultPage({
  icon,
  eyebrow,
  title,
  description,
  tone = "success",
  steps,
  children,
  trustText = "Dane karty obsługuje Stripe. SmartFach nie przechowuje numeru karty ani kodu CVC.",
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  tone?: "success" | "pending" | "attention";
  steps: readonly PaymentResultStep[];
  children: ReactNode;
  trustText?: string;
}) {
  return (
    <div className="payment-result-site">
      <header className="payment-result-header">
        <Link
          className="marketing-brand"
          href="/"
          aria-label="SmartFach — strona główna"
        >
          <BrandMark size={38} />
          <span>
            Smart<b>Fach</b>
          </span>
        </Link>
        <span className="payment-result-secure">
          <LockKeyhole size={15} aria-hidden="true" />
          Bezpieczna aktywacja
        </span>
        <Link className="payment-result-help" href="/kontakt">
          <LifeBuoy size={16} aria-hidden="true" />
          <span>Potrzebujesz pomocy?</span>
        </Link>
      </header>

      <main className="payment-result-main">
        <section className={`payment-result-card payment-result-${tone}`}>
          <div className="payment-result-icon" aria-hidden="true">
            {icon}
          </div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="payment-result-description">{description}</p>

          {steps.length > 0 && <ol className="payment-result-steps" aria-label="Postęp aktywacji">
            {steps.map((step, index) => (
              <li className={step.state} key={step.label}>
                <span aria-hidden="true">
                  {step.state === "complete" ? <Check size={15} /> : index + 1}
                </span>
                <small>{step.label}</small>
              </li>
            ))}
          </ol>}

          <div className="payment-result-actions">{children}</div>

          <div className="payment-result-trust">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>
              {trustText}
            </span>
          </div>
        </section>
      </main>

      <footer className="payment-result-footer">
        <span>© SmartFach</span>
        <nav aria-label="Informacje prawne i kontakt">
          <Link href="/kontakt">Kontakt</Link>
          <Link href="/regulamin">Regulamin</Link>
          <Link href="/polityka-prywatnosci">Prywatność</Link>
        </nav>
      </footer>
    </div>
  );
}
