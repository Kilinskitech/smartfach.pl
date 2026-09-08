"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import { requestPasswordReset, signIn, signUp } from "@/app/auth-actions";
import { plans, publicPlanIds, type PublicPlanId } from "@/domain/billing";
import { BrandMark } from "./brand";
import { PurchaseConsent } from "./purchase-consent";

export function AuthForm({ next = "/app", initialPlan = "pro", checkoutCanceled = false, confirmationFailed = false, loginFirst = false }: { next?: string; initialPlan?: PublicPlanId; checkoutCanceled?: boolean; confirmationFailed?: boolean; loginFirst?: boolean }) {
  const [view, setView] = useState<"register" | "login" | "reset">(
    checkoutCanceled || confirmationFailed || loginFirst ? "login" : "register",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(signIn, undefined);
  const [registerState, registerAction, registerPending] = useActionState(signUp, undefined);
  const [resetState, resetAction, resetPending] = useActionState(requestPasswordReset, undefined);
  const [plan, setPlan] = useState<PublicPlanId>(initialPlan);

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link href="/" className="auth-brand"><BrandMark size={46} /><span>Smart<b>Fach</b></span></Link>
        <div>
          <p className="eyebrow">NIE KOLEJNY KURS · ASYSTENT DO DZIAŁANIA</p>
          <h1>Od Twoich warunków do pierwszej sprzedawalnej usługi.</h1>
          <p>Wolisz pracować zdalnie albo lokalnie? Nie wiesz, co możesz sprzedawać? SmartFach dopasuje kierunek, pomoże zbudować ofertę i wskaże następne działanie.</p>
        </div>
        <ul>
          <li><Check size={17} /> 3 pełne dni bez opłat</li>
          <li><Check size={17} /> karta wymagana przed startem próby</li>
          <li><Check size={17} /> anulowanie w portalu Stripe</li>
        </ul>
      </section>

      <section className="auth-card">
        {view !== "reset" && <div className="auth-tabs" role="tablist" aria-label="Konto SmartFach">
          <button className={view === "register" ? "selected" : ""} onClick={() => setView("register")}>Załóż konto</button>
          <button className={view === "login" ? "selected" : ""} onClick={() => setView("login")}>Zaloguj się</button>
        </div>}

        {view !== "reset" && checkoutCanceled && (
          <p className="checkout-notice" role="status">
            Formularz Stripe został przerwany i niczego nie pobrano. Konto już
            istnieje — potwierdź adres z wiadomości, zaloguj się i ponownie wybierz plan.
          </p>
        )}
        {view !== "reset" && confirmationFailed && (
          <p className="form-error" role="alert">
            Link potwierdzający jest nieprawidłowy albo wygasł. Spróbuj zalogować
            się lub wróć do wiadomości wysłanej przez SmartFach.
          </p>
        )}

        {view === "reset" ? (
          <form action={resetAction} className="auth-form auth-reset-form">
            <button type="button" className="auth-back-button" onClick={() => setView("login")}><ArrowLeft size={16} /> Wróć do logowania</button>
            <div className="auth-form-heading"><span className="auth-form-icon"><KeyRound size={20} /></span><div><p className="eyebrow">ODZYSKIWANIE DOSTĘPU</p><h2>Ustaw nowe hasło</h2><p>Podaj adres konta. Wyślemy bezpieczny link do ustawienia nowego hasła.</p></div></div>
            <label>E-mail<input name="email" type="email" autoComplete="email" autoFocus required /></label>
            {resetState?.error && <p className="form-error" role="alert">{resetState.error}</p>}
            {resetState?.success && <p className="success-note" role="status"><Check size={16} /> {resetState.success}</p>}
            <button className="button button-primary auth-submit" disabled={resetPending || Boolean(resetState?.success)}>{resetPending ? "Wysyłanie…" : "Wyślij link do zmiany hasła"} <ArrowRight size={18} /></button>
          </form>
        ) : view === "login" ? (
          <form action={loginAction} className="auth-form">
            <div><p className="eyebrow">WITAJ PONOWNIE</p><h2>Zaloguj się do SmartFach</h2></div>
            <input type="hidden" name="next" value={next} />
            <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label>Hasło<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" minLength={8} required /><button type="button" aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            <button type="button" className="auth-forgot-button" onClick={() => setView("reset")}>Nie pamiętasz hasła?</button>
            {loginState?.error && <p className="form-error" role="alert">{loginState.error}</p>}
            <button className="button button-primary auth-submit" disabled={loginPending}>Zaloguj się <ArrowRight size={18} /></button>
          </form>
        ) : (
          <form action={registerAction} className="auth-form">
            <div><p className="eyebrow">ZAŁÓŻ KONTO</p><h2>Zacznij od siebie</h2><p>Nie musisz mieć pomysłu. Po wejściu SmartFach zapyta o sposób pracy, możliwości i rzeczy, których chcesz uniknąć.</p></div>
            <label>Jak mamy się do Ciebie zwracać?<input name="displayName" autoComplete="name" required maxLength={160} /></label>
            <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label>Hasło<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required /><button type="button" aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            <fieldset className="auth-options auth-plan-options">
              <legend>Wybierz plan po 3-dniowej próbie</legend>
              {publicPlanIds.map((planId) => (
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
            <p className="auth-selection-note"><Check size={15} /> Oba plany prowadzą przez ten sam proces. Pro ma większy miesięczny limit.</p>
            <p className="purchase-summary">Dziś 0 zł. Po 3 pełnych dniach <strong>{plans[plan].price} miesięcznie</strong>, automatycznie do anulowania. Ceny całkowite. Karta jest wymagana. Anulujesz w Ustawieniach lub przez kontakt.</p>
            <details className="purchase-limits"><summary>Co obejmuje limit planu?</summary><p>Plan {plans[plan].name} obejmuje 100% miesięcznego limitu. Długość rozmowy, zdjęcia i używane narzędzia wpływają na tempo jego wykorzystania. Limit odnawia się bez kumulacji. Po wyczerpaniu możesz poczekać albo zwiększyć go jednorazowo. Dodatkowy limit bezpieczeństwa: 20 zapytań na godzinę. <Link href="/regulamin#punkt-6" target="_blank">Pełne zasady limitu</Link>.</p></details>
            <PurchaseConsent />
            {registerState?.error && <p className="form-error" role="alert">{registerState.error}</p>}
            <button className="button button-primary auth-submit" disabled={registerPending}>{registerPending ? "Przekierowanie do Stripe…" : "Utwórz konto i przejdź dalej"} <ArrowRight size={18} /></button>
            <p className="auth-trial-copy"><ShieldCheck size={15} /> Przejdziesz bezpośrednio do Stripe. Adres e-mail potwierdzisz po zapisaniu karty.</p>
          </form>
        )}
      </section>
    </main>
  );
}
