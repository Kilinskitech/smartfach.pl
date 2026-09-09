"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore } from "react";
import {
  AppWindow,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  Monitor,
  MoreVertical,
  MousePointerClick,
  Share2,
  Smartphone,
  SquarePlus,
} from "lucide-react";
import { Dialog } from "./dialog";
import { BrandMark } from "./brand";
import { consumeInstallPrompt, type InstallPromptEvent } from "@/lib/install-prompt";

type InstallPlatform = "ios" | "android" | "desktop";
type InstallPlatformSnapshot = InstallPlatform | "unknown";
type GuideIcon = "browser" | "menu" | "share" | "add";

const InstallContext = createContext<{
  prompt: InstallPromptEvent | null;
  clear: (event: InstallPromptEvent) => void;
  installed: boolean;
}>({ prompt: null, clear: () => {}, installed: false });

const noSubscribe = () => () => {};
const serverFalse = () => false;
const serverUnknown = (): InstallPlatformSnapshot => "unknown";

const guides: Record<InstallPlatform, {
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  steps: Array<{ icon: GuideIcon; title: string; description: string }>;
}> = {
  ios: {
    label: "iPhone / iPad",
    eyebrow: "SAFARI · OKOŁO 20 SEKUND",
    title: "Dodaj SmartFach do ekranu początkowego",
    description: "Apple wymaga krótkiego potwierdzenia w Safari. Po dodaniu SmartFach otwiera się jak zwykła aplikacja.",
    steps: [
      { icon: "browser", title: "Otwórz stronę w Safari", description: "Wejdź na smartfach.pl. Jeśli jesteś w Facebooku lub Instagramie, najpierw wybierz „Otwórz w Safari”." },
      { icon: "share", title: "Naciśnij Udostępnij", description: "Użyj ikony ze strzałką do góry. W nowszym Safari może być ukryta pod przyciskiem Więcej (•••)." },
      { icon: "add", title: "Wybierz „Do ekranu początkowego”", description: "Jeśli nie widzisz tej opcji, przewiń listę i wybierz „Edytuj czynności”, aby ją dodać." },
      { icon: "add", title: "Potwierdź przyciskiem „Dodaj”", description: "Pozostaw włączone „Otwórz jako aplikację”, jeśli iPhone pokaże taką opcję." },
    ],
  },
  android: {
    label: "Android",
    eyebrow: "CHROME · INSTALACJA Z PRZEGLĄDARKI",
    title: "Zainstaluj SmartFach na telefonie",
    description: "Przycisk otwiera okno instalacji, jeśli Chrome je udostępnia. Instalację trzeba jeszcze potwierdzić w tym oknie.",
    steps: [
      { icon: "browser", title: "Otwórz stronę w Chrome", description: "Wejdź na smartfach.pl bezpośrednio w Chrome, nie w przeglądarce Facebooka lub Instagrama." },
      { icon: "menu", title: "Otwórz menu Chrome", description: "Jeśli okno instalacji nie pojawiło się automatycznie, naciśnij trzy kropki (⋮) w prawym górnym rogu." },
      { icon: "add", title: "Wybierz instalację", description: "Naciśnij „Zainstaluj aplikację” lub „Dodaj do ekranu głównego” i potwierdź." },
      { icon: "add", title: "Sprawdź ikonę na telefonie", description: "Jeśli jej nie ma, sprawdź listę aplikacji. Gdy instalacja nie kończy się, otwórz stronę w zwykłej karcie aktualnego Chrome (nie incognito), sprawdź internet i spróbuj z menu. Nadal możesz korzystać ze SmartFach w przeglądarce." },
    ],
  },
  desktop: {
    label: "Komputer",
    eyebrow: "CHROME · EDGE · SAFARI",
    title: "Miej SmartFach pod ręką na komputerze",
    description: "Aplikacja może działać we własnym oknie i być przypięta do paska lub Docka.",
    steps: [
      { icon: "browser", title: "Otwórz smartfach.pl", description: "Użyj aktualnej wersji Chrome, Edge albo Safari na Macu." },
      { icon: "add", title: "Wybierz instalację", description: "W Chrome lub Edge użyj ikony instalacji przy adresie albo opcji w menu. W Safari wybierz Plik → Dodaj do Docka." },
      { icon: "add", title: "Potwierdź", description: "SmartFach pojawi się wśród aplikacji i będzie używać tego samego konta oraz planu." },
    ],
  },
};

function standalone() {
  return window.matchMedia("(display-mode: standalone)").matches
    || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

function subscribeStandalone(notify: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", notify);
  window.addEventListener("appinstalled", notify);
  return () => {
    media.removeEventListener("change", notify);
    window.removeEventListener("appinstalled", notify);
  };
}

function devicePlatform(): InstallPlatformSnapshot {
  const userAgent = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}

function socialBrowser() {
  return /FBAN|FBAV|Instagram|TikTok/i.test(navigator.userAgent);
}

function iosOutsideSafari() {
  if (devicePlatform() !== "ios") return false;
  return /CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent) || socialBrowser();
}

function GuideStepIcon({ icon }: { icon: GuideIcon }) {
  if (icon === "menu") return <MoreVertical size={20} />;
  if (icon === "share") return <Share2 size={20} />;
  if (icon === "add") return <SquarePlus size={20} />;
  return <AppWindow size={20} />;
}

function PlatformIcon({ platform, size = 20 }: { platform: InstallPlatform; size?: number }) {
  return platform === "desktop" ? <Monitor size={size} /> : <Smartphone size={size} />;
}

function InstallSteps({ platform }: { platform: InstallPlatform }) {
  return <div className="install-step-list">
    {guides[platform].steps.map((step, index) => <article className="install-step" key={`${platform}-${step.title}`}>
      <span className="install-step-number">{index + 1}</span>
      <span className="install-step-icon"><GuideStepIcon icon={step.icon} /></span>
      <div><strong>{step.title}</strong><p>{step.description}</p></div>
    </article>)}
  </div>;
}

function BrowserNotice({ platform, inSocialBrowser, outsideSafari }: {
  platform: InstallPlatform;
  inSocialBrowser: boolean;
  outsideSafari: boolean;
}) {
  if (!inSocialBrowser && !outsideSafari) return null;
  const target = platform === "ios" ? "Safari" : "Chrome";
  return <div className="install-browser-notice">
    <ExternalLink size={20} />
    <div><strong>Najpierw otwórz stronę w {target}</strong><p>Użyj menu obecnej przeglądarki i wybierz „Otwórz w {target}”. Dopiero tam system pokaże opcję dodania aplikacji.</p></div>
  </div>;
}

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [installationCompleted, setInstallationCompleted] = useState(false);
  const inApp = useSyncExternalStore(subscribeStandalone, standalone, serverFalse);

  useEffect(() => {
    function available(event: Event) {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    }
    function installed() {
      setPrompt(null);
      setInstallationCompleted(true);
    }
    window.addEventListener("beforeinstallprompt", available);
    window.addEventListener("appinstalled", installed);
    if ("serviceWorker" in navigator && window.isSecureContext) {
      navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => console.warn("Nie zarejestrowano obsługi ekranu offline."));
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", available);
      window.removeEventListener("appinstalled", installed);
    };
  }, []);

  return <InstallContext.Provider value={{ prompt, clear: (used) => setPrompt((current) => current === used ? null : current), installed: inApp || installationCompleted }}>
    {children}
  </InstallContext.Provider>;
}

export function InstallAppButton({ className = "button button-secondary" }: { className?: string }) {
  const { prompt, clear, installed } = useContext(InstallContext);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const detectedPlatform = useSyncExternalStore(noSubscribe, devicePlatform, serverUnknown);
  const inSocialBrowser = useSyncExternalStore(noSubscribe, socialBrowser, serverFalse);
  const outsideSafari = useSyncExternalStore(noSubscribe, iosOutsideSafari, serverFalse);
  const platform: InstallPlatform = detectedPlatform === "unknown" ? "desktop" : detectedPlatform;

  async function install() {
    if (installed || busy) return;
    setMessage("");
    if (!prompt) {
      setOpen(true);
      return;
    }
    setBusy(true);
    if (!consumeInstallPrompt(prompt)) {
      setBusy(false);
      setOpen(true);
      return;
    }
    clear(prompt);
    try {
      // Keep this call inside the click gesture, before awaiting other work.
      await prompt.prompt();
      const result = await prompt.userChoice;
      if (result.outcome === "dismissed") {
        setMessage("Instalacja została zamknięta. Możesz uruchomić ją ponownie z menu przeglądarki.");
      } else {
        setMessage("Wybór został potwierdzony w przeglądarce. Sprawdź, czy ikona pojawiła się na telefonie. Jeśli nie — skorzystaj z instrukcji poniżej.");
      }
      setOpen(true);
    } catch {
      setMessage("Przeglądarka nie otworzyła instalacji. Możesz dodać aplikację z jej menu — instrukcja poniżej.");
      setOpen(true);
    } finally {
      setBusy(false);
    }
  }

  const buttonLabel = installed
    ? "Aplikacja jest zainstalowana"
    : busy
      ? "Otwieranie instalacji…"
      : prompt
        ? "Zainstaluj aplikację"
        : platform === "ios"
          ? "Dodaj na iPhone’a lub iPada"
          : platform === "android"
            ? "Zainstaluj na Androidzie"
            : "Zainstaluj aplikację";

  return <>
    <button type="button" className={className} onClick={() => void install()} disabled={busy || installed}>
      {installed ? <CheckCircle2 size={18} /> : prompt ? <MousePointerClick size={18} /> : <Download size={18} />}
      {buttonLabel}
    </button>
    {message && <p className="form-hint install-button-message" role="status">{message}</p>}
    {open && <Dialog
      title={installed ? "SmartFach jest zainstalowany" : guides[platform].title}
      description={installed ? "Otwórz SmartFach przez ikonę na swoim urządzeniu." : guides[platform].description}
      onClose={() => setOpen(false)}
    >
      <div className="install-instructions">
        {message && !installed && <p className="checkout-notice" role="status">{message}</p>}
        {prompt && !installed && <button type="button" className="button button-primary" onClick={() => void install()} disabled={busy}>{busy ? "Otwieranie instalacji…" : "Otwórz okno instalacji"}</button>}
        <BrowserNotice platform={platform} inSocialBrowser={inSocialBrowser} outsideSafari={outsideSafari} />
        <div className="install-dialog-platform">
          <span><PlatformIcon platform={platform} size={23} /></span>
          <div><small>{guides[platform].eyebrow}</small><strong>{guides[platform].label}</strong></div>
        </div>
        <InstallSteps platform={platform} />
        <div className="install-complete-note"><CheckCircle2 size={19} /><span><strong>To samo konto, plan i rozmowy.</strong> Aplikacja może poprosić o ponowne zalogowanie. Nie zakładaj drugiego konta.</span></div>
        <button className="button button-primary" onClick={() => setOpen(false)}>Gotowe</button>
      </div>
    </Dialog>}
  </>;
}

export function InstallPlatformGuide() {
  const detectedPlatform = useSyncExternalStore(noSubscribe, devicePlatform, serverUnknown);
  const inSocialBrowser = useSyncExternalStore(noSubscribe, socialBrowser, serverFalse);
  const outsideSafari = useSyncExternalStore(noSubscribe, iosOutsideSafari, serverFalse);
  const [selected, setSelected] = useState<InstallPlatform | null>(null);
  const active: InstallPlatform = selected
    ?? (detectedPlatform === "unknown" ? "ios" : detectedPlatform);
  const guide = guides[active];

  return <div className="install-guide">
    <div className="install-guide-tabs" role="tablist" aria-label="Wybierz urządzenie">
      {(Object.keys(guides) as InstallPlatform[]).map((platform) => <button
        key={platform}
        type="button"
        role="tab"
        aria-selected={active === platform}
        className={active === platform ? "active" : ""}
        onClick={() => setSelected(platform)}
      >
        <PlatformIcon platform={platform} size={18} />{guides[platform].label}
      </button>)}
    </div>
    <div className="install-guide-panel" role="tabpanel">
      <div className="install-guide-heading">
        <span className="install-guide-device"><PlatformIcon platform={active} size={25} /></span>
        <div><small>{guide.eyebrow}</small><h2>{guide.title}</h2><p>{guide.description}</p></div>
      </div>
      <BrowserNotice platform={active} inSocialBrowser={inSocialBrowser} outsideSafari={outsideSafari} />
      <InstallSteps platform={active} />
      <div className="install-guide-finish"><Check size={18} /><span>Gotowe — ikona SmartFach będzie dostępna razem z innymi aplikacjami.</span></div>
    </div>
  </div>;
}

export function InstallAppCard() {
  return <section className="settings-card install-app-card">
    <div className="card-heading"><Smartphone size={22} /><div><h3>SmartFach zawsze pod ręką</h3><p>Twoja aplikacja na telefon i komputer</p></div></div>
    <div className="install-app-identity"><BrandMark size={62} /><span><strong>SmartFach</strong><small>Twoje rozmowy. Twój następny krok.</small></span></div>
    <p>Dodaj SmartFacha do ekranu początkowego. Otworzysz go jednym dotknięciem, bez szukania karty w przeglądarce.</p>
    <InstallAppButton className="button button-primary" />
    <div className="install-app-points"><span><Check size={15} /> Bez dodatkowej opłaty</span><span><Check size={15} /> To samo konto i plan</span></div>
    <p className="form-hint">Asystent AI wymaga połączenia z internetem.</p>
  </section>;
}
