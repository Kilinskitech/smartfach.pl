import type { Metadata } from "next";
import Link from "next/link";
import { Check, ShieldCheck, Smartphone } from "lucide-react";
import { MarketingHeader, MarketingFooter } from "@/components/marketing";
import { InstallAppCard, InstallPlatformGuide } from "@/components/pwa";

export const metadata: Metadata = {
  title: "Pobierz aplikację na telefon — SmartFach",
  description: "Dodaj SmartFacha do ekranu początkowego na iPhonie, Androidzie lub komputerze. To samo konto, rozmowy i abonament.",
  alternates: { canonical: "/pobierz" },
};

export default function Page() {
  return <div className="marketing-site public-info-site"><MarketingHeader /><main>
    <section className="public-info-hero install-hero"><div>
      <p className="marketing-kicker"><Smartphone size={16} /> SMARTFACH NA TWOIM URZĄDZENIU</p>
      <h1>Wracaj do działania.<br />Jednym dotknięciem.</h1>
      <p>Dodaj SmartFacha do ekranu początkowego i otwieraj go jak zwykłą aplikację — bez sklepu i bez dodatkowej opłaty.</p>
      <ul className="install-benefits"><li><Check size={17} /> iPhone, Android i komputer</li><li><Check size={17} /> Te same rozmowy i ten sam plan</li><li><Check size={17} /> Bez pobierania ze sklepu</li></ul>
      <Link className="text-link" href="/app">Mam konto — otwórz SmartFacha →</Link>
    </div><InstallAppCard /></section>

    <section className="public-info-content install-guide-section">
      <div className="section-intro install-section-intro"><p className="marketing-kicker">PROSTA INSTALACJA</p><h2>Wybierz swoje urządzenie</h2><p>Na Androidzie kompatybilna przeglądarka może otworzyć instalację jednym kliknięciem. Na iPhonie wykonaj kilka krótkich kroków wymaganych przez Apple.</p></div>
      <InstallPlatformGuide />
      <div className="install-account-note"><ShieldCheck size={24} /><div><strong>Twoje konto i abonament pozostają bez zmian</strong><p>Po instalacji zaloguj się tym samym adresem e-mail. Rozmowy i plan są przypisane do konta. Odinstalowanie ikony nie anuluje abonamentu.</p></div></div>
    </section>
  </main><MarketingFooter /></div>;
}
