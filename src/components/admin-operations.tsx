"use client";
import { useActionState } from "react";
import { Activity, ArrowUpRight, CheckCircle2, CircleAlert, Clock3, ShieldCheck } from "lucide-react";
import { releaseAiReservation } from "@/app/admin/actions";

export type OperationalSummary = {
  milestones: Record<string, number>;
  pendingWebhooks: number;
  uncertain: Array<{ organization_id: string; request_key: string; user_id: string; reserved_credits: number; created_at: string }>;
};
function Reservation({ item }: { item: OperationalSummary["uncertain"][number] }) {
  const [state, action, pending] = useActionState(releaseAiReservation, undefined);
  return <article className="admin-reservation">
    <a className="admin-operation-link" href={`/admin/uzytkownicy/${item.user_id}`}>Otwórz użytkownika <ArrowUpRight size={16} /></a>
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
  const labels: Record<string, string> = { registered: "Założone konta", checkout_opened: "Otwarcie płatności", checkout_completed: "Ukończenie zakupu", first_answer: "Pierwsza odpowiedź AI", guided_start: "Pierwszy start biznesu", paid: "Pierwszy aktywny abonament", canceled: "Pierwsze zakończenie abonamentu", top_up: "Pierwsze zwiększenie limitu" };
  const hasIssues = summary.pendingWebhooks > 0 || summary.uncertain.length > 0;
  return <section className="admin-panel admin-operations" id="operacje" aria-labelledby="operations-title">
    <div className="admin-panel-heading"><div><Activity size={21} /><span><small>AKTYWACJA I NIEZAWODNOŚĆ</small><h2 id="operations-title">Aktywność i sprawy do sprawdzenia</h2></span></div><span className="admin-period"><Clock3 size={14} /> Ostatnie 30 dni</span></div>
    <p className="admin-section-copy">Zobacz, do którego etapu docierają użytkownicy i które operacje wymagają Twojej uwagi.</p>
    <dl className="admin-milestones">{Object.entries(labels).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{(summary.milestones[key] ?? 0).toLocaleString("pl-PL")}</dd></div>)}</dl>
    <p className="admin-metrics-note">Każdy etap liczymy raz na konto, od wdrożenia pomiaru. To niezależne liczby z ostatnich 30 dni, nie lejek konwersji ani suma transakcji.</p>
    <div className="admin-reliability">
      <div className="admin-reliability-heading"><h3><ShieldCheck size={19} /> Niezawodność operacji</h3><span className={`admin-health-badge ${hasIssues ? "needs-attention" : "clear"}`}>{hasIssues ? <CircleAlert size={15} /> : <CheckCircle2 size={15} />}{hasIssues ? "Wymaga uwagi" : "Brak zaległych spraw"}</span></div>
      <div className="admin-health-grid">
        <article className={`admin-health-card ${summary.pendingWebhooks ? "needs-attention" : ""}`}>
          <div><h4>Potwierdzenia Stripe</h4><strong>{summary.pendingWebhooks.toLocaleString("pl-PL")}</strong></div>
          <p>{summary.pendingWebhooks ? "Zdarzenia bez potwierdzenia od ponad 2 minut. Sprawdź błąd endpointu i ponów dostarczenie w Stripe." : "Nie ma zdarzeń oczekujących na potwierdzenie dłużej niż 2 minuty."}</p>
          <span>Wszystkie nierozwiązane zdarzenia, niezależnie od daty. Dostarczenie e-maila nie potwierdza zapisu abonamentu.</span>
        </article>
        <article className={`admin-health-card ${summary.uncertain.length ? "needs-attention" : ""}`}>
          <div><h4>Niepewne próby AI</h4><strong>{summary.uncertain.length}{summary.uncertain.length === 50 ? "+" : ""}</strong></div>
          <p>{summary.uncertain.length ? "Sprawdź logi dostawcy przed zwolnieniem rezerwacji. Lista poniżej obejmuje najstarsze 50 spraw." : "Nie ma niepewnych prób wymagających ręcznego zwolnienia rezerwacji."}</p>
          <span>Rezerwacja limitu chroni przed podwójnym wykonaniem. Nie oznacza pobrania opłaty.</span>
        </article>
      </div>
      {summary.uncertain.length > 0 && <div className="admin-reservations"><h4>Rezerwacje do rozpatrzenia</h4>{summary.uncertain.map(item => <Reservation key={`${item.organization_id}:${item.request_key}`} item={item} />)}</div>}
    </div>
  </section>;
}
