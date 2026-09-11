import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  CircleDollarSign,
  Gauge,
  MessageCircle,
  MessagesSquare,
  UserRound,
} from "lucide-react";
import { BrandMark } from "./brand";
import { AssistantMessage } from "./assistant-message";
import { AdminUserActions } from "./admin-user-actions";
import type { TopUpPurchase, TopUpSummary } from "@/domain/top-up-summary";

export type AdminUserDetailSnapshot = {
  generatedAt: string;
  id: string;
  email: string;
  name: string;
  company: string;
  plan: string;
  monthlyCostUsd: number;
  monthlyLimitUsd: number;
  baseLimitUsd: number;
  chargedLimitUsd: number;
  topUps: TopUpSummary;
  topUpPurchases: TopUpPurchase[];
  totalCostUsd: number;
  totalTokens: number;
  measuredResponses: number;
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  subscriptionEndsAt: string | null;
  stripeConnected: boolean;
  subscriptionSyncWarning?: string;
  deleteBlockedReason?: string;
  conversations: Array<{
    id: string;
    title: string;
    updatedAt: string;
    hasPendingDocument: boolean;
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      model?: string;
      usage?: {
        providerRequestId?: string;
        provider?: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        reasoningTokens: number;
        cachedTokens: number;
        costUsd: number;
      };
      sources: Array<{ title: string; url: string }>;
    }>;
  }>;
};

function usdLabel(value: number, precise = false) {
  const digits = precise && value > 0 && value < 0.01 ? 4 : 2;
  return `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} USD`;
}

export function AdminUserDetail({
  snapshot,
}: {
  snapshot: AdminUserDetailSnapshot;
}) {
  const messageCount = snapshot.conversations.reduce(
    (total, conversation) => total + conversation.messages.length,
    0,
  );

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand">
          <BrandMark size={39} />
          <span>Smart<b>Fach</b><small>PANEL WŁAŚCICIELA</small></span>
        </Link>
        <nav aria-label="Nawigacja panelu administratora">
          <Link href="/admin"><BarChart3 size={18} /> Przegląd</Link>
          <Link className="selected" href={`/admin/uzytkownicy/${snapshot.id}`}><UserRound size={18} /> Profil użytkownika</Link>
        </nav>
        <div className="admin-sidebar-bottom">
          <span><i /> Konto właściciela</span>
          <Link href="/admin"><ArrowLeft size={15} /> Wróć do listy</Link>
        </div>
      </aside>

      <main className="admin-main">
        <Link className="admin-back-link" href="/admin"><ArrowLeft size={16} /> Wszyscy użytkownicy</Link>
        <header className="admin-user-header">
          <span>{snapshot.name.slice(0, 2).toUpperCase()}</span>
          <div>
            <p className="eyebrow">PROFIL UŻYTKOWNIKA</p>
            <h1>{snapshot.name}</h1>
            <p>{snapshot.email} · {snapshot.company || "Konto bez dodatkowych danych"}</p>
          </div>
        </header>

        <section className="admin-metric-grid admin-user-metrics" aria-label="Metryki użytkownika">
          <article><span><UserRound size={20} /></span><small>PROFIL</small><strong className="admin-text-value">Własny przychód</strong><p>Jeden spójny sposób pracy dla każdego użytkownika</p></article>
          <article><span><Gauge size={20} /></span><small>PLAN I TEN MIESIĄC</small><strong className="admin-text-value">{snapshot.plan}</strong><p>{usdLabel(snapshot.monthlyCostUsd)} / {usdLabel(snapshot.monthlyLimitUsd)}</p></article>
          <article><span><MessagesSquare size={20} /></span><small>AKTYWNOŚĆ</small><strong>{snapshot.conversations.length}</strong><p>{messageCount} wiadomości we wszystkich rozmowach</p></article>
          <article><span><CircleDollarSign size={20} /></span><small>KOSZT ŁĄCZNY</small><strong className="admin-cost-value">{usdLabel(snapshot.totalCostUsd, true)}</strong><p>{snapshot.totalTokens.toLocaleString("pl-PL")} tokenów · {snapshot.measuredResponses} zmierzonych odpowiedzi</p></article>
        </section>

        <section className="admin-panel admin-top-ups" aria-labelledby="top-ups-title">
          <div className="admin-panel-heading"><div><Gauge size={20} /><span><small>LIMIT I ZAKUPY</small><h2 id="top-ups-title">Pakiety dodatkowego limitu</h2></span></div></div>
          <dl className="admin-milestones">
            <div><dt>Zakupione pakiety łącznie</dt><dd>{snapshot.topUps.count}</dd></div>
            <div><dt>Przyznane z zakupów łącznie</dt><dd>{usdLabel(snapshot.topUps.grantedUsd)}</dd></div>
            <div><dt>Pozostało z zakupów</dt><dd>{usdLabel(snapshot.topUps.remainingExtraUsd)}</dd></div>
            <div><dt>Łączny limit tego okresu</dt><dd>{snapshot.topUps.totalPercentage}%</dd></div>
          </dl>
          <p className="admin-section-copy">Pula bazowa: {usdLabel(snapshot.baseLimitUsd)}. Łączny limit okresu: {usdLabel(snapshot.monthlyLimitUsd)}. Rozliczone użycie limitu: {usdLabel(snapshot.chargedLimitUsd)}. Pozostało do wykorzystania: {usdLabel(snapshot.topUps.remainingAllowanceUsd)}.</p>
          <p className="admin-metrics-note">Koszt OpenRouter i rozliczone użycie limitu mogą się różnić przez zaokrąglanie każdej odpowiedzi. Najpierw zużywana jest pula planu, potem zakupy. Na kolejny okres przechodzi tylko niewykorzystana część zakupów.</p>
          <h3>Historia przyznanych pakietów</h3>
          <p className="admin-metrics-note">Wartość zarejestrowanych zakupów: {(snapshot.topUps.purchasedGrosze / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}. To historia przyznań, nie raport przychodu po zwrotach. Pokazujemy ostatnie 20; podsumowanie obejmuje wszystkie.</p>
          {snapshot.topUpPurchases.length ? <div className="admin-top-up-history">{snapshot.topUpPurchases.map(p => <article key={p.checkoutSessionId}>
            <div><strong>Pakiet {p.packId}</strong><time dateTime={p.createdAt}>{new Date(p.createdAt).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })}</time></div>
            <div><strong>{usdLabel(p.grantedCredits / 100)} limitu</strong><span>{(p.amountGrosze / 100).toLocaleString("pl-PL", { style: "currency", currency: "PLN" })}</span></div>
            <code>{p.checkoutSessionId}</code>
          </article>)}</div> : <p className="admin-empty-note">Brak potwierdzonych zakupów dodatkowego limitu.</p>}
        </section>

        <section className="admin-panel admin-quality">
          <div className="admin-panel-heading">
            <div><MessageCircle size={20} /><span><small>ROZMOWY UŻYTKOWNIKA</small><h2>Prompty, odpowiedzi i koszt</h2></span></div>
          </div>
          <div className="admin-quality-notice">
            <Gauge size={20} />
            <p>
              <strong>Koszt jest przypisywany do konkretnej odpowiedzi.</strong>
              <span>OpenRouter zwraca go razem z tokenami. Starsze rozmowy, zapisane przed włączeniem pomiaru, mogą nie mieć danych kosztowych.</span>
            </p>
          </div>

          {snapshot.conversations.length === 0 ? (
            <div className="admin-quality-empty">
              <MessageCircle size={26} />
              <h3>Ten użytkownik nie ma jeszcze rozmów</h3>
              <p>Po wysłaniu pierwszego polecenia pojawi się tutaj pełna historia i koszt odpowiedzi.</p>
            </div>
          ) : (
            <div className="admin-conversation-list">
              {snapshot.conversations.map((conversation, index) => (
                <details key={conversation.id} open={index === 0}>
                  <summary>
                    <span className="admin-conversation-icon"><MessageCircle size={18} /></span>
                    <span className="admin-conversation-title">
                      <strong>{conversation.title}</strong>
                      <small>{new Date(conversation.updatedAt).toLocaleString("pl-PL")}</small>
                    </span>
                    <span className="admin-conversation-meta">
                      <i>{conversation.messages.length} wiad.</i>
                      {conversation.hasPendingDocument && <i>Szkic dokumentu</i>}
                    </span>
                  </summary>
                  <div className="admin-message-list">
                    {conversation.messages.length === 0 ? (
                      <p className="admin-empty-thread">Rozmowa nie zawiera jeszcze wiadomości.</p>
                    ) : conversation.messages.map((message) => (
                      <article className={`admin-message ${message.role}`} key={message.id}>
                        <header>
                          <span>{message.role === "user" ? <UserRound size={15} /> : <Bot size={15} />}</span>
                          <strong>{message.role === "user" ? "Użytkownik · prompt" : "SmartFach · odpowiedź"}</strong>
                          {message.model && <code>{message.model}</code>}
                        </header>
                        {message.role === "assistant" ? (
                          <AssistantMessage content={message.content} />
                        ) : (
                          <p>{message.content}</p>
                        )}
                        {message.usage && (
                          <dl className="admin-message-usage">
                            <div><dt>Koszt</dt><dd>{usdLabel(message.usage.costUsd, true)}</dd></div>
                            <div><dt>Wejście</dt><dd>{message.usage.promptTokens.toLocaleString("pl-PL")}</dd></div>
                            <div><dt>Wyjście</dt><dd>{message.usage.completionTokens.toLocaleString("pl-PL")}</dd></div>
                            <div><dt>Łącznie</dt><dd>{message.usage.totalTokens.toLocaleString("pl-PL")} tokenów</dd></div>
                            {message.usage.providerRequestId && <div><dt>ID żądania</dt><dd><code>{message.usage.providerRequestId}</code></dd></div>}
                          </dl>
                        )}
                        {message.sources.length > 0 && (
                          <div className="admin-message-sources">
                            <small>Źródła internetowe</small>
                            {message.sources.map((source) => (
                              <a href={source.url} key={source.url} rel="noreferrer" target="_blank">{source.title}</a>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <AdminUserActions
          cancelAtPeriodEnd={snapshot.cancelAtPeriodEnd}
          deleteBlockedReason={snapshot.deleteBlockedReason}
          email={snapshot.email}
          stripeConnected={snapshot.stripeConnected}
          subscriptionSyncWarning={snapshot.subscriptionSyncWarning}
          subscriptionEndsAt={snapshot.subscriptionEndsAt}
          subscriptionStatus={snapshot.subscriptionStatus}
          userId={snapshot.id}
        />

        <footer className="admin-footer">
          <span>Odczyt: {new Date(snapshot.generatedAt).toLocaleString("pl-PL")}</span>
          <span>Koszty historyczne pozostają przypisane do odpowiedzi</span>
        </footer>
      </main>
    </div>
  );
}
