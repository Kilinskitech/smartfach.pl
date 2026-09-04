"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Check, Compass, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { signIn, signUp } from "@/app/auth-actions";
import {
  normalizePlanForSalesEntry,
  plans,
  plansForSalesEntry,
  salesEntryForAccountType,
  type PlanId,
  type SalesEntry,
} from "@/domain/billing";
import type { JourneyMode } from "@/domain/workspace";
import { BrandMark } from "./brand";

export function AuthForm({ next = "/app", initialPlan = "pro", initialAccountType = "discover", checkoutCanceled = false, confirmationFailed = false }: { next?: string; initialPlan?: PlanId; initialAccountType?: JourneyMode; checkoutCanceled?: boolean; confirmationFailed?: boolean }) {
  const [view, setView] = useState<"register" | "login">(
    checkoutCanceled || confirmationFailed ? "login" : "register",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(signIn, undefined);
  const [registerState, registerAction, registerPending] = useActionState(signUp, undefined);
  const initialEntry = salesEntryForAccountType(initialAccountType);
  const [accountType, setAccountType] = useState<SalesEntry>(initialEntry);
  const [plan, setPlan] = useState<PlanId>(() =>
    normalizePlanForSalesEntry(initialEntry, initialPlan),
  );
  const availablePlans = plansForSalesEntry(accountType);

  function selectAccountType(nextAccountType: SalesEntry) {
    setAccountType(nextAccountType);
    setPlan((currentPlan) =>
      normalizePlanForSalesEntry(nextAccountType, currentPlan),
    );
  }

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link href="/" className="auth-brand"><BrandMark size={46} /><span>Smart<b>Fach</b></span></Link>
        <div>
          <p className="eyebrow">JEDEN ASYSTENT · CAŁA DROGA</p>
          <h1>Od celu 10 000 zł przychodu po codzienną pracę firmy.</h1>
          <p>SmartFach pomaga zdecydować, co zrobić, przygotować gotowy rezultat i wrócić do pracy bez zaczynania od zera.</p>
        </div>
        <ul>
          <li><Check size={17} /> 3 pełne dni bez opłat</li>
          <li><Check size={17} /> karta wymagana przed startem próby</li>
          <li><Check size={17} /> anulowanie w portalu Stripe</li>
        </ul>
      </section>

      <section className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Konto SmartFach">
          <button className={view === "register" ? "selected" : ""} onClick={() => setView("register")}>Załóż konto</button>
          <button className={view === "login" ? "selected" : ""} onClick={() => setView("login")}>Zaloguj się</button>
        </div>

        {checkoutCanceled && (
          <p className="checkout-notice" role="status">
            Formularz Stripe został przerwany i niczego nie pobrano. Konto już
            istnieje — potwierdź adres z wiadomości, zaloguj się i ponownie wybierz plan.
          </p>
        )}
        {confirmationFailed && (
          <p className="form-error" role="alert">
            Link potwierdzający jest nieprawidłowy albo wygasł. Spróbuj zalogować
            się lub wróć do wiadomości wysłanej przez SmartFach.
          </p>
        )}

        {view === "login" ? (
          <form action={loginAction} className="auth-form">
            <div><p className="eyebrow">WITAJ PONOWNIE</p><h2>Zaloguj się do SmartFach</h2></div>
            <input type="hidden" name="next" value={next} />
            <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label>Hasło<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" minLength={8} required /><button type="button" aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            {loginState?.error && <p className="form-error" role="alert">{loginState.error}</p>}
            <button className="button button-primary auth-submit" disabled={loginPending}>Zaloguj się <ArrowRight size={18} /></button>
          </form>
        ) : (
          <form action={registerAction} className="auth-form">
            <div><p className="eyebrow">ZAŁÓŻ KONTO</p><h2>Zacznij działać</h2><p>Wybierz tylko sytuację, która najlepiej opisuje Cię dzisiaj.</p></div>
            <label>Imię lub nazwa firmy<input name="displayName" autoComplete="name" required maxLength={160} /></label>
            <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label>Hasło<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required /><button type="button" aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            <fieldset className="auth-options auth-entry-options">
              <legend>Od czego zaczynasz?</legend>
              <label>
                <input type="radio" name="accountType" value="discover" checked={accountType === "discover"} onChange={() => selectAccountType("discover")} />
                <Compass size={18} />
                <span><strong>Buduję biznes od zera</strong><small>Chcę stworzyć ofertę, zdobyć klientów i pracować nad celem 10 000 zł przychodu miesięcznie.</small></span>
              </label>
              <label>
                <input type="radio" name="accountType" value="operate" checked={accountType === "operate"} onChange={() => selectAccountType("operate")} />
                <BriefcaseBusiness size={18} />
                <span><strong>Mam pomysł lub firmę</strong><small>Chcę zdobywać klientów i sprawniej prowadzić codzienną pracę.</small></span>
              </label>
            </fieldset>
            <fieldset className="auth-options auth-plan-options">
              <legend>Wybierz plan po 3-dniowej próbie</legend>
              {availablePlans.map((planId) => (
                <label key={planId}>
                  <input type="radio" name="plan" value={planId} checked={plan === planId} onChange={() => setPlan(planId)} />
                  <span className="auth-plan-copy">
                    <span className="auth-plan-heading"><strong>SmartFach {plans[planId].name}</strong>{planId === "pro" && <b>POLECANY</b>}</span>
                    <em>{plans[planId].price}<small> / miesiąc</small></em>
                    <small>{plans[planId].description}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <p className="auth-selection-note"><Check size={15} /> Zmieniasz sytuację i plan tutaj — bez przeładowania strony.</p>
            <label className="auth-consent"><input type="checkbox" name="terms" value="accepted" required /><span>Akceptuję <Link href="/regulamin" target="_blank">regulamin</Link> i <Link href="/polityka-prywatnosci" target="_blank">politykę prywatności</Link>.</span></label>
            {registerState?.error && <p className="form-error" role="alert">{registerState.error}</p>}
            <button className="button button-primary auth-submit" disabled={registerPending}>{registerPending ? "Przekierowanie do Stripe…" : "Utwórz konto i przejdź dalej"} <ArrowRight size={18} /></button>
            <p className="auth-trial-copy"><ShieldCheck size={15} /> Przejdziesz bezpośrednio do Stripe. Adres e-mail potwierdzisz po zapisaniu karty.</p>
          </form>
        )}
      </section>
    </main>
  );
}
