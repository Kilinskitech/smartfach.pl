"use client";
import { useState } from "react";
import { InstallAppCard } from "./pwa";
import {
  Bot,
  Check,
  CreditCard,
  Download,
  Gauge,
  ShieldCheck,
  KeyRound,
  LogOut,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import {
  usageLimitView,
  plans,
} from "@/domain/billing";
import {
  journeySchema,
  type Workspace,
} from "@/domain/workspace";

export function SettingsPanel({
  data,
  available,
  webSearch,
  onOpenBilling,
  onSaveJourney,
}: {
  data: Workspace;
  available: boolean | null;
  webSearch: boolean;
  onOpenBilling: () => void;
  onSaveJourney: (journey: Workspace["journey"]) => Promise<void>;
}) {
  const [journeyBusy, setJourneyBusy] = useState(false);
  const [journeySaved, setJourneySaved] = useState(false);
  const [journeyError, setJourneyError] = useState("");
  const limit = usageLimitView(data.billing);
  const plan = plans[data.billing.plan];
  function exportData() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download =
      "smartfach-kopia-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
  return (
    <div className="settings-grid">
      <section className="settings-card journey-profile-settings">
        <div className="card-heading">
          <SlidersHorizontal size={21} />
          <div>
            <h3>Twój profil działania</h3>
            <p>Stałe informacje, które pomagają dopasować kolejne działania.</p>
          </div>
        </div>
        <form
          className="settings-form journey-settings-form"
          onChange={() => setJourneySaved(false)}
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const parsed = journeySchema.safeParse({
              workStyle: data.journey.workStyle,
              weeklyHours: form.get("weeklyHours"),
              experience: form.get("experience"),
              constraints: form.get("constraints"),
              focus: form.get("focus"),
              goal: form.get("goal"),
              onboardingCompleted: true,
            });
            if (!parsed.success) {
              setJourneyError("Sprawdź wpisane informacje.");
              return;
            }
            setJourneyBusy(true);
            setJourneyError("");
            try {
              await onSaveJourney(parsed.data);
              setJourneySaved(true);
            } catch (error) {
              setJourneyError(error instanceof Error ? error.message : "Nie zapisano preferencji.");
            } finally {
              setJourneyBusy(false);
            }
          }}
        >
          <div className="two-fields">
            <div className="field"><label htmlFor="journey-hours">Ile czasu masz tygodniowo?</label><input id="journey-hours" name="weeklyHours" defaultValue={data.journey.weeklyHours} maxLength={80} placeholder="np. 6 godzin" /></div>
            <div className="field"><label htmlFor="journey-goal">Jaki przychód jest Twoim celem?</label><input id="journey-goal" name="goal" defaultValue={data.journey.goal} maxLength={500} placeholder="np. pierwsze 2 000 zł miesięcznie" /></div>
          </div>
          <div className="field"><label htmlFor="journey-experience">Co już umiesz lub robiłeś wcześniej?</label><textarea id="journey-experience" name="experience" defaultValue={data.journey.experience} maxLength={1200} rows={3} placeholder="Nie muszą to być zawodowe umiejętności." /></div>
          <div className="field"><label htmlFor="journey-constraints">Czego nie chcesz robić albo co Cię ogranicza?</label><textarea id="journey-constraints" name="constraints" defaultValue={data.journey.constraints} maxLength={1200} rows={3} placeholder="np. bez rozmów telefonicznych, bez pokazywania twarzy, mały budżet" /></div>
          <div className="field"><label htmlFor="journey-focus">Nad czym obecnie pracujesz?</label><input id="journey-focus" name="focus" defaultValue={data.journey.focus} maxLength={160} placeholder="Możesz zostawić puste, jeśli dopiero szukasz kierunku" /></div>
          {journeyError && <p className="form-error" role="alert">{journeyError}</p>}
          {journeySaved && <p className="success-note" role="status"><Check size={16} />SmartFach będzie korzystał z tych informacji.</p>}
          <button className="button button-primary" disabled={journeyBusy}><Target size={18} />{journeyBusy ? "Zapisywanie…" : "Zapisz profil"}</button>
        </form>
      </section>
      <div className="settings-side">
        <section className="settings-card settings-usage-card">
          <div className="card-heading">
            <Gauge size={21} />
            <div>
              <h3>Plan {plan.name} i wykorzystanie</h3>
              <p>Łączna pula w tym okresie: {limit.totalPercentage}% limitu planu</p>
            </div>
          </div>
          <div className="settings-usage-value">
            <strong>{limit.usedPercentage}% <small>z {limit.totalPercentage}%</small></strong>
            <span>Wykorzystane · pozostało {limit.remainingPercentage}% limitu planu</span>
          </div>
          <div className="settings-usage-progress" aria-hidden="true">
            <span style={{ width: `${limit.progressPercentage}%` }} />
          </div>
          <p className="form-hint">100% to pula Twojego planu. Zakupy zwiększają ten sam limit. Przy odnowieniu wraca pula planu, a niewykorzystana część zakupów przechodzi dalej.</p>
          <button className="button button-primary" onClick={onOpenBilling}>
            <CreditCard size={17} /> Zwiększ limit
          </button>
        </section>
        <InstallAppCard />
        <section className="settings-card settings-assistant-card">
          <div className="card-heading">
            <Bot size={21} />
            <div>
              <h3>Asystent SmartFach</h3>
              <p>
                {available ? "Asystent jest gotowy" : "Wymaga konfiguracji"}
              </p>
            </div>
          </div>
          <p>
            SmartFach uwzględnia Twoje warunki, pomaga sprawdzać kierunki,
            budować ofertę, szukać sposobów dotarcia i przygotowywać wiadomości.
          </p>
          <p className="form-hint">
            {webSearch
              ? "Internet jest włączony. Asystent uruchamia wyszukiwanie tylko wtedy, gdy pytanie wymaga aktualnych danych, i pokazuje źródła."
              : "Wyszukiwanie internetowe jest wyłączone w konfiguracji serwera."}
          </p>
          <details className="settings-details"><summary>Jak przetwarzana jest rozmowa?</summary><p>Do usługi AI trafia treść wiadomości, zapisane preferencje, dodane zdjęcie oraz kontekst potrzebny do wykonania zadania. Nie wklejaj do rozmowy haseł ani kluczy dostępu. Limit bezpieczeństwa wynosi 20 zapytań na godzinę i konto.</p></details>
        </section>
        <section className="settings-card settings-data-card">
          <div className="card-heading">
            <ShieldCheck size={21} />
            <div>
              <h3>Twoje dane</h3>
              <p>Prywatna przestrzeń w chmurze</p>
            </div>
          </div>
          <p>
            Dane są przypisane do Twojego konta i chronione prywatną sesją.
            Pobierz kopię, jeśli chcesz zachować własny eksport poza SmartFach.
          </p>
          <div className="settings-data-actions">
            <button className="button button-secondary export-button" onClick={exportData}><Download size={18} />Pobierz kopię danych</button>
            <a className="button button-secondary" href="/api/billing/contracts" download><Download size={18} />Pobierz potwierdzenia zamówień</a>
          </div>
          <p className="form-hint">
            Kopia zawiera zapisane ustawienia, rozmowy i pozostałe dane konta.
            Przechowuj ją w bezpiecznym miejscu. Przywracanie kopii z aplikacji
            nie jest jeszcze dostępne.
          </p>
          <p className="form-hint">Chcesz usunąć konto lub skorzystać ze swoich praw? <a href="/kontakt">Napisz do nas</a>. <a href="/regulamin">Regulamin</a> · <a href="/polityka-prywatnosci">Prywatność</a></p>
        </section>
        <section className="settings-card settings-account-card">
          <div className="card-heading">
            <KeyRound size={21} />
            <div><h3>Konto i bezpieczeństwo</h3><p>Abonament, płatności i dostęp do konta</p></div>
          </div>
          <div className="account-actions">
            <a className="button button-secondary" href="/platnosc"><CreditCard size={17} /> Plan i płatność</a>
            <form action="/auth/wyloguj" method="post"><button className="button button-secondary"><LogOut size={17} /> Wyloguj się</button></form>
          </div>
          <div className="settings-billing-support"><strong>Pomoc w sprawie płatności i zwrotów</strong><p>Skontaktuj się z nami e-mailem — sprawdzimy zakup i należne rozliczenie. <a href="/kontakt#rozliczenia">Kontakt w sprawie rozliczeń</a>.</p><a href="/odstapienie">Odstąp od umowy tutaj</a></div>
        </section>
        <div className="next-stage">
          <Check size={19} />
          <span>
            Profil możesz uzupełniać w dowolnym momencie. SmartFach użyje
            najnowszych informacji w kolejnych odpowiedziach.
          </span>
        </div>
      </div>
    </div>
  );
}
