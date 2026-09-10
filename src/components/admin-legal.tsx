"use client";
import { useActionState } from "react";
import { MailCheck, Send } from "lucide-react";
import { resolveWithdrawal, testSmtpConnection } from "@/app/admin/actions";

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

export function AdminLegal({ withdrawals, smtpReady, contactEmail }: { withdrawals: WithdrawalRow[]; smtpReady: boolean; contactEmail: string }) {
  const [smtpState, smtpAction, smtpPending] = useActionState(testSmtpConnection, undefined);
  return <section className="admin-panel" id="obsluga-umow">
    <div className="admin-panel-heading"><div><span><small>SPRZEDAŻ I PRAWA KLIENTA</small><h2>Obsługa umów</h2></span></div></div>
    <div className="admin-smtp-test">
      <span className={smtpReady ? "ready" : "missing"}><MailCheck size={20} /></span>
      <div><strong>Poczta transakcyjna</strong><p>{smtpReady ? "Zmienne SMTP są ustawione. Wyślij kontrolną wiadomość bez wykonywania zakupu." : "Brak pełnej konfiguracji — nowe płatności Live są zablokowane."}</p></div>
      <form action={smtpAction}><button className="button button-secondary" disabled={!smtpReady || smtpPending}><Send size={16} /> {smtpPending ? "Wysyłanie…" : "Wyślij test SMTP"}</button></form>
    </div>
    {smtpState?.error && <p className="form-error" role="alert">{smtpState.error}</p>}
    {smtpState?.success && <p className="success-note" role="status">{smtpState.success}</p>}
    <div className="admin-contract-support">
      <h3>Kontakt i ręczne rozliczenia</h3>
      <p>Sprawy zwrotów i odstąpień obsługujesz przez <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. Każde należne rozliczenie wykonujesz osobiście w Stripe — żaden przycisk klienta nie zwraca pieniędzy automatycznie.</p>
    </div>
    <h3 className="admin-withdrawals-title">Zgłoszenia z formularza <span>{withdrawals.length}</span></h3>
    <p>Formularz zapisuje oświadczenie klienta. Przeglądaj tę listę i skrzynkę codziennie. Zgłoszenia wysłane bezpośrednio e-mailem nie pojawiają się na tej liście.</p>
    {withdrawals.length ? withdrawals.map(request => <WithdrawalItem key={request.id} request={request} />) : <p className="admin-empty-note"><MailCheck size={18} /> Brak oczekujących zgłoszeń z formularza.</p>}
  </section>;
}
