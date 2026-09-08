"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { ArrowUpFromLine, CheckCircle2, Download, Smartphone } from "lucide-react";
import { Dialog } from "./dialog";
import { BrandMark } from "./brand";

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
const InstallContext = createContext<{ prompt: InstallPromptEvent | null; clear: () => void; installed: boolean }>({ prompt: null, clear: () => {}, installed: false });
const noSubscribe = () => () => {};
const serverFalse = () => false;
function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}
function subscribeStandalone(notify: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", notify);
  window.addEventListener("appinstalled", notify);
  return () => { media.removeEventListener("change", notify); window.removeEventListener("appinstalled", notify); };
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installationCompleted, setInstallationCompleted] = useState(false);
  const inApp = useSyncExternalStore(subscribeStandalone, standalone, serverFalse);
  useEffect(() => {
    function available(event: Event) { event.preventDefault(); setPrompt(event as InstallPromptEvent); }
    function installed() { setPrompt(null); setInstallationCompleted(true); }
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", installed);
    if ("serviceWorker" in navigator && window.isSecureContext)
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => console.warn("Nie zarejestrowano obsługi ekranu offline."));
    return () => { window.removeEventListener("beforeinstallprompt", available); window.removeEventListener("appinstalled", installed); };
  }, []);
  return <InstallContext.Provider value={{ prompt, clear: () => setPrompt(null), installed: inApp || installationCompleted }}>{children}</InstallContext.Provider>;
}

export function InstallAppButton({ className = "button button-secondary" }: { className?: string }) {
  const { prompt, clear, installed } = useContext(InstallContext);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const isIos = useSyncExternalStore(noSubscribe, () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1), serverFalse);
  const inSocialBrowser = useSyncExternalStore(noSubscribe, () => /FBAN|FBAV|Instagram|TikTok/i.test(navigator.userAgent), serverFalse);
  async function install() {
    if (installed) return;
    setMessage("");
    if (!prompt) { setOpen(true); return; }
    setBusy(true);
    try {
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "dismissed") setMessage("Instalację możesz uruchomić ponownie z menu przeglądarki.");
      else setMessage("Dokończ instalację w oknie przeglądarki. Ikona pojawi się na Twoim urządzeniu.");
    } catch { setOpen(true); }
    finally { clear(); setBusy(false); }
  }
  return <>
    <button type="button" className={className} onClick={() => void install()} disabled={busy || installed}>
      {installed ? <CheckCircle2 size={18} /> : <Download size={18} />}
      {installed ? "Aplikacja jest zainstalowana" : busy ? "Otwieranie instalacji…" : "Zainstaluj aplikację"}
    </button>
    {message && <p className="form-hint" role="status">{message}</p>}
    {open && <Dialog title="SmartFach na Twoim telefonie" description="Dodaj ikonę do ekranu początkowego i wracaj prosto do asystenta." onClose={() => setOpen(false)}>
      <div className="install-instructions">
        {inSocialBrowser && <p className="install-note">Otwórz tę stronę w Safari lub Chrome przez menu przeglądarki Facebooka, Instagrama lub TikToka. Instalacja w tym oknie może być niedostępna.</p>}
        <h3>{isIos ? "Na iPhonie lub iPadzie" : "Na telefonie z Androidem"}</h3>
        <ol>{isIos ? <><li>Otwórz smartfach.pl w Safari.</li><li>Naciśnij <ArrowUpFromLine size={16} /> <strong>Udostępnij</strong> w menu przeglądarki.</li><li>Wybierz <strong>Do ekranu początkowego</strong> i zatwierdź <strong>Dodaj</strong>. Jeśli pojawi się opcja otwierania jako aplikacji, pozostaw ją włączoną.</li></> : <><li>Otwórz smartfach.pl w Chrome.</li><li>Otwórz menu <strong>⋮</strong> w przeglądarce.</li><li>Wybierz <strong>Zainstaluj aplikację</strong> lub <strong>Dodaj do ekranu głównego</strong> i potwierdź.</li></>}</ol>
        <details><summary>{isIos ? "Android i komputer" : "iPhone, iPad i komputer"}</summary><p>iPhone / iPad: Safari → Udostępnij → Do ekranu początkowego. Android: Chrome → menu ⋮ → Zainstaluj aplikację. Komputer: ikona instalacji przy adresie w Chrome lub Edge; w Safari na Macu menu Plik → Dodaj do Docka, jeśli dostępne.</p></details>
        <p className="form-hint">Instalacja jest bez dodatkowej opłaty. Korzystasz z tego samego konta i planu. Asystent wymaga internetu. Nazwy opcji zależą od wersji systemu i przeglądarki.</p>
        <button className="button button-primary" onClick={() => setOpen(false)}>Rozumiem</button>
      </div>
    </Dialog>}
  </>;
}

export function InstallAppCard() {
  return <section className="settings-card install-app-card">
    <div className="card-heading"><Smartphone size={22} /><div><h3>SmartFach zawsze pod ręką</h3><p>Twoja aplikacja na telefon i komputer</p></div></div>
    <div className="install-app-identity"><BrandMark size={62} /><span><strong>SmartFach</strong><small>Twoje rozmowy. Twój następny krok.</small></span></div>
    <p>Dodaj SmartFacha do ekranu początkowego. Otworzysz go jednym dotknięciem, bez szukania karty w przeglądarce.</p>
    <InstallAppButton className="button button-primary" />
    <p className="form-hint">Bez dodatkowej opłaty. To samo konto i plan. Do pracy z AI potrzebujesz internetu.</p>
  </section>;
}
