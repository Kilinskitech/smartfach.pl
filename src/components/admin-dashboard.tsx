import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Database,
  Gauge,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Users,
  XCircle,
} from "lucide-react";
import { BrandMark } from "./brand";
import { OperatorSettingsForm } from "./operator-settings-form";
import type { Operator } from "@/domain/operator";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  paymentMethodAttached: boolean;
  monthlyCostUsd: number;
  monthlyLimitUsd: number;
  totalCostUsd: number;
  totalTokens: number;
};

export type AdminSnapshot = {
  generatedAt: string;
  integrations: { ai: boolean; webSearch: boolean; auth: boolean; billing: boolean };
  totals: {
    users: number;
    trialing: number;
    paymentMethodAttached: number;
    active: number;
    costUsd: number;
    totalTokens: number;
    measuredResponses: number;
  };
  users: AdminUserRow[];
};

const statusLabels: Record<string, string> = {
  active: "Aktywny",
  trialing: "Okres próbny",
  incomplete: "Bez płatności",
  past_due: "Zaległość",
  canceled: "Anulowany",
  unpaid: "Nieopłacony",
};
const usdLabel = (value: number, precise = false) => {
  const digits = precise && value > 0 && value < 0.01 ? 4 : 2;
  return `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })} USD`;
};

function Status({ active, children }: { active: boolean; children: React.ReactNode }) {
  return <span className={active ? "admin-status active" : "admin-status inactive"}>{active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}{children}</span>;
}

export function AdminDashboard({ snapshot, notice, operator, legalPanel }: { snapshot: AdminSnapshot; notice?: string; operator: Operator; legalPanel?: React.ReactNode }) {
  const metrics = [
    { label: "Wszyscy użytkownicy", value: snapshot.totals.users, note: "Konta w Supabase Auth", icon: Users },
    { label: "Na 3-dniowej próbie", value: snapshot.totals.trialing, note: "Status trialing ze Stripe", icon: Clock3 },
    { label: "Karta podpięta", value: snapshot.totals.paymentMethodAttached, note: "Bez danych karty w SmartFach", icon: CreditCard },
    { label: "Aktywnie płacący", value: snapshot.totals.active, note: "Status active ze Stripe", icon: CircleDollarSign },
  ];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="admin-brand"><BrandMark size={39} /><span>Smart<b>Fach</b><small>PANEL WŁAŚCICIELA</small></span></Link>
        <nav aria-label="Sekcje panelu administratora"><a className="selected" href="#przeglad"><BarChart3 size={18} /> Przegląd</a><a href="#uzytkownicy"><Users size={18} /> Użytkownicy</a><a href="#zuzycie"><Gauge size={18} /> Zużycie</a><a href="#bezpieczenstwo"><ShieldCheck size={18} /> Bezpieczeństwo</a></nav>
        <a href="#dane-sprzedawcy">Dane sprzedawcy</a>
        <a href="#obsluga-umow">Obsługa umów</a>
        <div className="admin-sidebar-bottom"><span><i /> Konto właściciela</span><Link href="/">Wróć na stronę <ArrowRight size={15} /></Link><form action="/auth/wyloguj" method="post"><button type="submit"><LogOut size={16} /> Wyloguj się</button></form></div>
      </aside>
      <main className="admin-main">
        <header className="admin-header" id="przeglad"><div><p className="eyebrow">CENTRUM WŁAŚCICIELA</p><h1>Przegląd SmartFach</h1><p>Użytkownicy, triale, płatności i koszt AI. Treść rozmów jest wyłącznie w profilu konkretnego użytkownika.</p></div><Link href="/admin" className="admin-refresh"><RefreshCw size={17} /> Odśwież dane</Link></header>
        {notice && <p className="admin-operation-notice" role="status"><CheckCircle2 size={17} /> {notice}</p>}
        <section className="admin-metric-grid" aria-label="Najważniejsze metryki">{metrics.map(({ label, value, note, icon: Icon }) => <article key={label}><span><Icon size={20} /></span><small>{label}</small><strong>{value}</strong><p>{note}</p></article>)}</section>
        <section className="admin-grid" id="zuzycie">
          <article className="admin-panel admin-usage-panel"><div className="admin-panel-heading"><div><Activity size={20} /><span><small>RZECZYWISTE UŻYCIE</small><h2>Koszt OpenRouter</h2></span></div></div><div className="admin-cost-strip"><span><CircleDollarSign size={18} /><small>KOSZT ŁĄCZNY</small><strong>{usdLabel(snapshot.totals.costUsd, true)}</strong></span><span><small>TOKENY</small><strong>{snapshot.totals.totalTokens.toLocaleString("pl-PL")}</strong></span><span><small>ODPOWIEDZI</small><strong>{snapshot.totals.measuredResponses}</strong></span></div><p className="admin-panel-footnote">Koszt pochodzi z pola usage zwróconego przez OpenRouter dla każdego żądania i jest przypisany do użytkownika.</p></article>
          <article className="admin-panel"><div className="admin-panel-heading"><div><Database size={20} /><span><small>INTEGRACJE</small><h2>Gotowość systemu</h2></span></div></div><div className="admin-readiness"><div><span>Asystent AI</span><Status active={snapshot.integrations.ai}>{snapshot.integrations.ai ? "Połączony" : "Brak konfiguracji"}</Status></div><div><span>Wyszukiwanie internetowe</span><Status active={snapshot.integrations.webSearch}>{snapshot.integrations.webSearch ? "Włączone" : "Wyłączone"}</Status></div><div><span>Konta i organizacje</span><Status active={snapshot.integrations.auth}>{snapshot.integrations.auth ? "Supabase" : "Brak Supabase"}</Status></div><div><span>Subskrypcje i karty</span><Status active={snapshot.integrations.billing}>{snapshot.integrations.billing ? "Stripe" : "Brak Stripe"}</Status></div></div></article>
        </section>
        <section className="admin-panel admin-users" id="uzytkownicy"><div className="admin-panel-heading"><div><Users size={20} /><span><small>BAZA KLIENTÓW SAAS</small><h2>Użytkownicy i subskrypcje</h2></span></div></div><div className="admin-table-head"><span>Użytkownik</span><span>Plan</span><span>Status</span><span>Karta</span><span>Ten miesiąc</span><span>Łącznie</span></div>{snapshot.users.length === 0 ? <div className="admin-quality-empty"><Users size={25} /><h3>Nie ma jeszcze użytkowników</h3><p>Pierwsze prawdziwe konto pojawi się po rejestracji przez Supabase.</p></div> : snapshot.users.map((user) => <Link prefetch={false} className="admin-user-row" href={`/admin/uzytkownicy/${user.id}`} key={user.id}><span className="admin-user-identity"><i>{(user.name || user.email).slice(0,2).toUpperCase()}</i><span><strong>{user.name || user.email}</strong><small>{user.email} · buduje własny przychód</small></span></span><strong>{user.plan}</strong><span><Status active={["active","trialing"].includes(user.status)}>{statusLabels[user.status] ?? user.status}</Status></span><span>{user.paymentMethodAttached ? "Podpięta" : "Brak"}</span><span className="admin-user-usage"><span>{usdLabel(user.monthlyCostUsd)} / {usdLabel(user.monthlyLimitUsd)}</span></span><span className="admin-user-total-cost"><span>{usdLabel(user.totalCostUsd, true)}</span><ArrowRight size={15} /></span></Link>)}</section>
        <section className="admin-privacy" id="bezpieczenstwo"><div><ShieldCheck size={24} /></div><section><p className="eyebrow">JEDEN ADMINISTRATOR</p><h2>Brak zbędnego systemu ról.</h2><p>Dostęp ma wyłącznie konto wskazane w chronionej konfiguracji serwera. Odczyty rozmów i działania na kontach tworzą wpisy audytowe.</p></section><ul><li><CheckCircle2 size={15} /> użytkownik → rozmowy → wiadomości</li><li><CheckCircle2 size={15} /> koszt OpenRouter per użytkownik</li><li><CheckCircle2 size={15} /> jawne potwierdzanie operacji krytycznych</li></ul></section>
        <OperatorSettingsForm operator={operator} />
        {legalPanel}
        <footer className="admin-footer"><span>Odczyt: {new Date(snapshot.generatedAt).toLocaleString("pl-PL")}</span><a href="#uzytkownicy">Przejdź do użytkowników <ArrowRight size={14} /></a></footer>
      </main>
    </div>
  );
}
