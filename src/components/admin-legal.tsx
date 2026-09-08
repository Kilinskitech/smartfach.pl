"use client";
import { useActionState } from "react";
import { resolveWithdrawal } from "@/app/admin/actions";

export type WithdrawalRow = { id: string; userId: string | null; email: string; statement: string; receivedAt: string; emailSent: boolean; orderId: string };

function WithdrawalItem({ request }: { request: WithdrawalRow }) {
  const [state, action, pending] = useActionState(resolveWithdrawal, undefined);
  return <article className="admin-withdrawal">
    <h3>{request.email}</h3>
    <p>Otrzymano {new Date(request.receivedAt).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })} · {request.emailSent ? "Potwierdzenie przyjęte przez serwer poczty" : "Potwierdzenie e-mail wymaga sprawdzenia"}</p>
    <p>{request.statement}</p>
    {request.userId && <a href={`/admin/uzytkownicy/${request.userId}`}>Otwórz konto użytkownika</a>}
    <form action={action}>
      <input type="hidden" name="id" value={request.id} />
      <label className="purchase-consent-row"><input name="confirmed" type="checkbox" value="yes" required /><span>Rozpatrzyłem zgłoszenie, wykonałem należny zwrot i zakończenie umowy w Stripe oraz odpowiedziałem klientowi.</span></label>
      <button className="button button-secondary" disabled={pending || Boolean(state?.success)}>{pending ? "Zapisywanie…" : "Oznacz jako obsłużone"}</button>
      {state?.error && <p role="alert">{state.error}</p>}{state?.success && <p role="status">{state.success}</p>}
    </form>
  </article>;
}

export function AdminLegal({ withdrawals, pendingEmails, smtpReady }: { withdrawals: WithdrawalRow[]; pendingEmails: number; smtpReady: boolean }) {
  return <section className="admin-panel" id="obsluga-umow">
    <div className="admin-panel-heading"><div><span><small>SPRZEDAŻ I PRAWA KLIENTA</small><h2>Obsługa umów</h2></span></div></div>
    <p>SMTP: {smtpReady ? "zmienne ustawione — dostarczalność wymaga testu" : "brak konfiguracji — płatności Live są zablokowane"}.</p>
    <p>Potwierdzenia zamówień oczekujące na wysyłkę: <strong>{pendingEmails}</strong>. Sprawdź błędy webhooka i po naprawie ponów zdarzenie checkout.session.completed w Stripe.</p>
    <h3>Odstąpienia do obsłużenia: {withdrawals.length}</h3>
    <p>Przeglądaj zgłoszenia codziennie. Formularz przyjmuje oświadczenie, ale nie anuluje subskrypcji ani nie wykonuje zwrotu automatycznie. Należne rozliczenie wykonaj w Stripe, odpowiedz klientowi i dopiero oznacz zgłoszenie jako obsłużone.</p>
    {withdrawals.length ? withdrawals.map(request => <WithdrawalItem key={request.id} request={request} />) : <p>Brak oczekujących zgłoszeń.</p>}
  </section>;
}
