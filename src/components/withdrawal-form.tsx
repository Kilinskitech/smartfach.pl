"use client";
import { useActionState, useState } from "react";
import { submitWithdrawal } from "@/app/odstapienie/actions";

export function WithdrawalForm({ email = "", orders = [] }: { email?: string; orders?: Array<{ id: string; date: string }> }) {
  const [review, setReview] = useState(false);
  const [state, action, pending] = useActionState(submitWithdrawal, undefined);
  if (state?.success) return <div className="withdrawal-result"><p style={{ whiteSpace: "pre-line" }} role="status">{state.success}</p><button className="button button-secondary" onClick={() => { const url = URL.createObjectURL(new Blob([state.success!], { type: "text/plain;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "smartfach-odstapienie.txt"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }}>Zapisz potwierdzenie</button></div>;
  return <form action={action} className="auth-form" onChange={() => setReview(false)} onSubmit={event => { if (!review) { event.preventDefault(); setReview(true); } }}>
    <label>Imię i nazwisko<input name="fullName" autoComplete="name" required minLength={2} maxLength={160} /></label>
    <label>E-mail konta i do potwierdzenia<input name="email" type="email" defaultValue={email} autoComplete="email" required /></label>
    <label>Zamówienie{orders.length ? <select name="order" required>{orders.map(order => <option key={order.id} value={order.id}>{order.date} · {order.id.slice(-12)}</option>)}</select> : <input name="order" placeholder="cs_… — numer z potwierdzenia zamówienia" required maxLength={200} pattern="cs_.*" />}</label>
    <input type="hidden" name="confirm" value="yes" />
    {review && <p className="purchase-summary">Potwierdzając, składasz oświadczenie o odstąpieniu od wskazanej umowy. Nie musisz podawać przyczyny. Potwierdzenie otrzymasz na podany e-mail. Zgłoszenie wymaga rozliczenia przez sprzedawcę; przycisk nie wykonuje automatycznego zwrotu.</p>}
    {state?.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="button button-primary" disabled={pending}>{pending ? "Przyjmowanie oświadczenia…" : review ? "Potwierdź odstąpienie" : "Przejdź do potwierdzenia"}</button>
  </form>;
}
