"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { updatePassword } from "@/app/auth-actions";

export function PasswordUpdateForm() {
  const [state, action, pending] = useActionState(updatePassword, undefined);
  const [visible, setVisible] = useState(false);

  return (
    <form action={action} className="auth-form password-update-form">
      <div className="auth-form-heading">
        <span className="auth-form-icon"><LockKeyhole size={21} /></span>
        <div>
          <p className="eyebrow">BEZPIECZEŃSTWO KONTA</p>
          <h2>Ustaw nowe hasło</h2>
          <p>Nowe hasło powinno mieć co najmniej 8 znaków.</p>
        </div>
      </div>
      <label>
        Nowe hasło
        <span className="password-field">
          <input name="password" type={visible ? "text" : "password"} autoComplete="new-password" minLength={8} required autoFocus />
          <button type="button" aria-label={visible ? "Ukryj hasła" : "Pokaż hasła"} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>
        </span>
      </label>
      <label>
        Powtórz nowe hasło
        <input name="passwordConfirmation" type={visible ? "text" : "password"} autoComplete="new-password" minLength={8} required />
      </label>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      <button className="button button-primary auth-submit" disabled={pending}>{pending ? "Zapisywanie…" : "Zapisz nowe hasło"} <ArrowRight size={18} /></button>
    </form>
  );
}
