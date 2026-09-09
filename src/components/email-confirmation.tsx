"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { requestConfirmationEmail } from "@/app/auth-actions";

function ConfirmButton({ recovery, pending }: { recovery: boolean; pending: boolean }) {
  return <button className="button button-primary" disabled={pending}>{pending ? "Sprawdzamy bezpieczny link…" : recovery ? "Przejdź do zmiany hasła" : "Potwierdź e-mail i przejdź dalej"}</button>;
}

export function EmailConfirmation({ token, type }: { token?: string; type: "signup" | "recovery" }) {
  const [state, action, pending] = useActionState(requestConfirmationEmail, undefined);
  const [confirming, setConfirming] = useState(false);
  return <>
    {token ? <form action="/auth/potwierdz/verify" method="post" onSubmit={() => setConfirming(true)}>
      <input type="hidden" name="token_hash" value={token} />
      <input type="hidden" name="type" value={type} />
      <ConfirmButton recovery={type === "recovery"} pending={confirming} />
    </form> : type === "recovery" ? <Link className="button button-primary" href="/logowanie">Zamów nowy link na stronie logowania</Link> : <form action={action} className="auth-form">
      <label>Adres e-mail konta<input name="email" type="email" autoComplete="email" required /></label>
      <button className="button button-primary" disabled={pending || Boolean(state?.success)}>{pending ? "Wysyłanie…" : "Wyślij nowy link potwierdzający"}</button>
      {state?.success && <p role="status">{state.success}</p>}
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
    </form>}
    <Link className="button button-secondary" href="/logowanie">Mam już potwierdzone konto — zaloguj się</Link>
    <p className="form-hint">Korzystasz z innej przeglądarki lub zainstalowanej aplikacji? Po potwierdzeniu możesz zalogować się tam tym samym e-mailem i hasłem.</p>
  </>;
}
