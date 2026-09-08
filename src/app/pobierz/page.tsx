import type { Metadata } from "next";
import Link from "next/link";
import { Check, Smartphone } from "lucide-react";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";
import { InstallAppCard } from "@/components/pwa";

export const metadata: Metadata = { title: "Pobierz aplikację na telefon — SmartFach", description: "Dodaj SmartFacha do ekranu początkowego na iPhonie, Androidzie lub komputerze. To samo konto, rozmowy i abonament.", alternates: { canonical: "/pobierz" } };
export default function Page() {
  return <div className="marketing-site public-info-site"><MarketingHeader /><main>
    <section className="public-info-hero install-hero"><div>
      <p className="marketing-kicker"><Smartphone size={16} /> SMARTFACH NA TELEFONIE</p>
      <h1>Twój następny krok.<br />Jedno dotknięcie od Ciebie.</h1>
      <p>Wracaj do oferty, pomysłów i rozmów tak wygodnie jak do zwykłej aplikacji. Zainstaluj SmartFacha prosto ze strony.</p>
      <ul className="install-benefits"><li><Check size={17} /> iPhone, Android i komputer</li><li><Check size={17} /> Te same rozmowy i ten sam plan</li><li><Check size={17} /> Instalacja bez dodatkowych opłat</li></ul>
      <Link className="text-link" href="/app">Mam konto — otwórz SmartFacha →</Link>
    </div><InstallAppCard /></section>
    <section className="public-info-content install-platforms"><article><h2>iPhone i iPad</h2><p>Otwórz stronę w Safari, naciśnij Udostępnij i wybierz „Do ekranu początkowego”. Zatwierdź dodanie ikony.</p></article><article><h2>Android</h2><p>W Chrome naciśnij przycisk instalacji. Możesz też otworzyć menu przeglądarki i wybrać „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”.</p></article><article><h2>Twoje konto zostaje z Tobą</h2><p>Po instalacji zaloguj się tym samym adresem. Rozmowy i abonament są przypisane do konta. Asystent wymaga internetu; odinstalowanie aplikacji nie anuluje abonamentu.</p></article></section>
  </main><MarketingFooter /></div>;
}
