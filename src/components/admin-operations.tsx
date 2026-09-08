"use client";
import { useActionState } from "react";
import { releaseAiReservation } from "@/app/admin/actions";

export type OperationalSummary = {
  milestones: Record<string, number>;
  pendingWebhooks: number;
  uncertain: Array<{ organization_id: string; request_key: string; user_id: string; reserved_credits: number; created_at: string }>;
};
function Reservation({ item }: { item: OperationalSummary["uncertain"][number] }) {
  const [state, action, pending] = useActionState(releaseAiReservation, undefined);
  return <article className="admin-withdrawal">
    <a href={`/admin/uzytkownicy/${item.user_id}`}>Otwórz użytkownika</a>
    <p>Próba: <code>{item.request_key}</code><br />{new Date(item.created_at).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })} · rezerwacja: {(item.reserved_credits / 100).toFixed(2)} USD limitu</p>
    <form action={action}>
      <input type="hidden" name="organizationId" value={item.organization_id} />
      <input type="hidden" name="requestKey" value={item.request_key} />
      <label className="purchase-consent-row"><input name="confirmed" type="checkbox" value="yes" required /><span>Sprawdziłem logi dostawcy. Zwalniam rezerwację użytkownika, a ewentualny koszt nieudanej próby pokrywa SmartFach. Nie ponawiam zapytania.</span></label>
      <button className="button button-secondary" disabled={pending || Boolean(state?.success)}>{pending ? "Zapisywanie…" : "Zwolnij rezerwację"}</button>
      {state?.error && <p role="alert">{state.error}</p>}{state?.success && <p role="status">{state.success}</p>}
    </form>
  </article>;
}
export function AdminOperations({ summary }: { summary: OperationalSummary }) {
  const labels: Record<string, string> = { registered: "Rejestracje", checkout_opened: "Otwarcie Stripe", checkout_completed: "Ukończony checkout", first_answer: "Pierwsza odpowiedź AI", guided_start: "Pierwszy start biznesu", paid: "Pierwszy status aktywnego abonamentu", canceled: "Pierwsze zakończenie abonamentu", top_up: "Pierwsze doładowanie" };
  return <section className="admin-panel" id="operacje">
    <div className="admin-panel-heading"><div><span><small>AKTYWACJA I NIEZAWODNOŚĆ</small><h2>Co dzieje się w produkcie</h2></span></div></div>
    <p>Pierwsze osiągnięcie każdego etapu w ostatnich 30 dniach, liczone od wdrożenia pomiaru. To nie są współczynniki konwersji ani liczba wszystkich transakcji. Etapy mogą dotyczyć różnych grup użytkowników.</p>
    <dl className="admin-milestones">{Object.entries(labels).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{summary.milestones[key] ?? 0}</dd></div>)}</dl>
    <h3>Webhooki wymagające sprawdzenia: {summary.pendingWebhooks}</h3>
    <p>Zdarzenia bez potwierdzenia od ponad 2 minut. Sprawdź odpowiedź endpointu i ponów dostarczenie w Stripe. Sam otrzymany e-mail nie potwierdza poprawnego zapisu abonamentu.</p>
    <h3>Niepewne próby AI: {summary.uncertain.length}{summary.uncertain.length === 50 ? "+" : ""}</h3>
    <p>Rezerwacja chroni przed powtórnym wykonaniem i rozliczeniem po utracie odpowiedzi. Nie jest pobraną opłatą. Poniżej najstarsze 50 spraw.</p>
    {summary.uncertain.map(item => <Reservation key={item.request_key} item={item} />)}
  </section>;
}
