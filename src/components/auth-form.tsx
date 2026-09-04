"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, Check, Compass, Eye, EyeOff, Rocket, ShieldCheck } from "lucide-react";
import { signIn, signUp } from "@/app/auth-actions";
import type { PlanId } from "@/domain/billing";
import type { JourneyMode } from "@/domain/workspace";
import { BrandMark } from "./brand";

export function AuthForm({ next = "/app", initialPlan = "pro", initialAccountType = "operate" }: { next?: string; initialPlan?: PlanId; initialAccountType?: JourneyMode }) {
  const [view, setView] = useState<"register" | "login">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [loginState, loginAction, loginPending] = useActionState(signIn, undefined);
  const [registerState, registerAction, registerPending] = useActionState(signUp, undefined);

  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link href="/" className="auth-brand"><BrandMark size={46} /><span>Smart<b>Fach</b></span></Link>
        <div>
          <p className="eyebrow">TWÓJ ASYSTENT DO BIZNESU</p>
          <h1>Od pomysłu do codziennej pracy w jednym miejscu.</h1>
          <p>SmartFach pomaga podjąć następną decyzję, przygotować wycenę i zapisać historię klienta.</p>
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
            <div><p className="eyebrow">ZAŁÓŻ KONTO</p><h2>Zacznij od swojej sytuacji</h2><p>Typ konta zmienisz później w Ustawieniach.</p></div>
            <label>Imię lub nazwa firmy<input name="displayName" autoComplete="name" required maxLength={160} /></label>
            <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
            <label>Hasło<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required /><button type="button" aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            <fieldset className="auth-options"><legend>Co najlepiej Cię opisuje?</legend><label><input type="radio" name="accountType" value="discover" defaultChecked={initialAccountType === "discover"} /><Compass size={18} /><span><strong>Odkrywam</strong><small>Szukam kierunku na biznes</small></span></label><label><input type="radio" name="accountType" value="launch" defaultChecked={initialAccountType === "launch"} /><Rocket size={18} /><span><strong>Uruchamiam</strong><small>Mam pomysł i chcę ruszyć</small></span></label><label><input type="radio" name="accountType" value="operate" defaultChecked={initialAccountType === "operate"} /><ShieldCheck size={18} /><span><strong>Prowadzę</strong><small>Mam klientów lub zespół</small></span></label></fieldset>
            <fieldset className="auth-options auth-plans"><legend>Plan po 3-dniowej próbie</legend><label><input type="radio" name="plan" value="lite" defaultChecked={initialPlan === "lite"} /><span><strong>Lite</strong><small>49 zł / mies.</small></span></label><label><input type="radio" name="plan" value="pro" defaultChecked={initialPlan === "pro"} /><span><strong>Pro</strong><small>99 zł / mies.</small></span></label><label><input type="radio" name="plan" value="firma" defaultChecked={initialPlan === "firma"} /><span><strong>Firma</strong><small>299 zł / mies.</small></span></label></fieldset>
            <label className="auth-consent"><input type="checkbox" name="terms" value="accepted" required /><span>Akceptuję <Link href="/regulamin" target="_blank">regulamin</Link> i <Link href="/polityka-prywatnosci" target="_blank">politykę prywatności</Link>.</span></label>
            {registerState?.error && <p className="form-error" role="alert">{registerState.error}</p>}
            {registerState?.success && <p className="success-note" role="status"><Check size={16} />{registerState.success}</p>}
            <button className="button button-primary auth-submit" disabled={registerPending}>Utwórz konto <ArrowRight size={18} /></button>
            <p className="auth-trial-copy"><ShieldCheck size={15} /> Konto nie uruchamia opłaty. Kartę podasz bezpiecznie w Stripe przed rozpoczęciem próby.</p>
          </form>
        )}
      </section>
    </main>
  );
}
