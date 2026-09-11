import type { Metadata } from "next";
import Link from "next/link";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";
import { WithdrawalForm } from "@/components/withdrawal-form";
import { getOperator } from "@/server/operator-settings";
import { authenticatedContext } from "@/server/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Odstąp od umowy — SmartFach", robots: { index: false, follow: false } };
export default async function Page() {
  const operator = await getOperator();
  const context = await authenticatedContext().catch(() => null);
  const records = context ? await context.supabase.from("purchase_contracts").select("checkout_session_id,created_at").eq("user_id", context.userId).order("created_at", { ascending: false }) : null;
  return <div className="marketing-site public-info-site landing-v3 public-v2"><MarketingHeader /><main className="withdrawal-page">
    <p className="eyebrow">TWOJE PRAWA</p><h1>Odstąp od umowy tutaj</h1>
    <p>Wypełnij dane i potwierdź oświadczenie. Konsument ma zasadniczo 14 dni od zawarcia umowy; formularz nie blokuje zgłoszeń po tym terminie, jeżeli przysługuje Ci inne uprawnienie. <Link href="/regulamin#punkt-8">Pełne zasady odstąpienia</Link>.</p>
    <aside className="withdrawal-email-option"><h2>Wolisz napisać e-mail?</h2><p>Wyślij oświadczenie na <a href={`mailto:${operator.email}`}>{operator.email}</a>, podając e-mail konta i zakup, którego dotyczy. Nie musisz podawać przyczyny. Rozliczenie obsługujemy indywidualnie — formularz poniżej nie wykonuje automatycznego zwrotu pieniędzy.</p></aside>
    <WithdrawalForm email={context?.email ?? ""} orders={records?.data?.map(row => ({ id: String(row.checkout_session_id), date: new Date(row.created_at).toLocaleDateString("pl-PL") })) ?? []} />
    <p>Nie masz numeru zamówienia lub nie możesz się zalogować? Oświadczenie wyślesz także na <a href={`mailto:${operator.email}`}>{operator.email}</a>, podając dane pozwalające odnaleźć umowę. <Link href="/polityka-prywatnosci">Informacje o danych osobowych</Link>.</p>
    <p>Jeśli chcesz tylko wyłączyć kolejne odnowienie abonamentu, użyj <Link href="/platnosc">zarządzania płatnościami</Link>.</p>
  </main><MarketingFooter /></div>;
}
