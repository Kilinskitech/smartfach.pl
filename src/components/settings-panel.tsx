"use client";
import { useState } from "react";
import { InstallAppCard } from "./pwa";
import {
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
  monthlyUsagePercentage,
  plans,
  remainingTopUpCredits,
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
  const usagePercentage = monthlyUsagePercentage(data.billing);
  const plan = plans[data.billing.plan];
  const hasExtraLimit = remainingTopUpCredits(data.billing) > 0;
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
            <h3>Jak chcesz działać</h3>
            <p>Te informacje pomagają odrzucić pomysły, które do Ciebie nie pasują.</p>
          </div>
        </div>
        <form
          className="settings-form journey-settings-form"
          onChange={() => setJourneySaved(false)}
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const parsed = journeySchema.safeParse({
              workStyle: form.get("workStyle"),
              weeklyHours: form.get("weeklyHours"),
              experience: form.get("experience"),
              constraints: form.get("constraints"),
              focus: form.get("focus"),
              goal: form.get("goal"),
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
          <div className="field">
            <label htmlFor="journey-work-style">Gdzie wolisz pracować?</label>
            <select id="journey-work-style" name="workStyle" defaultValue={data.journey.workStyle}>
              <option value="open">Jeszcze nie wiem / bez znaczenia</option>
              <option value="remote">Zdalnie</option>
              <option value="local">Lokalnie</option>
              <option value="hybrid">Częściowo zdalnie i lokalnie</option>
            </select>
          </div>
          <div className="two-fields">
            <div className="field"><label htmlFor="journey-hours">Ile czasu masz tygodniowo?</label><input id="journey-hours" name="weeklyHours" defaultValue={data.journey.weeklyHours} maxLength={80} placeholder="np. 6 godzin" /></div>
            <div className="field"><label htmlFor="journey-goal">Jaki przychód jest Twoim celem?</label><input id="journey-goal" name="goal" defaultValue={data.journey.goal} maxLength={500} placeholder="np. pierwsze 2 000 zł miesięcznie" /></div>
          </div>
          <div className="field"><label htmlFor="journey-experience">Co już umiesz lub robiłeś wcześniej?</label><textarea id="journey-experience" name="experience" defaultValue={data.journey.experience} maxLength={1200} rows={3} placeholder="Nie muszą to być zawodowe umiejętności." /></div>
          <div className="field"><label htmlFor="journey-constraints">Czego nie chcesz robić albo co Cię ogranicza?</label><textarea id="journey-constraints" name="constraints" defaultValue={data.journey.constraints} maxLength={1200} rows={3} placeholder="np. bez rozmów telefonicznych, bez pokazywania twarzy, mały budżet" /></div>
          <div className="field"><label htmlFor="journey-focus">Nad czym obecnie pracujesz?</label><input id="journey-focus" name="focus" defaultValue={data.journey.focus} maxLength={160} placeholder="Możesz zostawić puste, jeśli dopiero szukasz kierunku" /></div>
          {journeyError && <p className="form-error" role="alert">{journeyError}</p>}
          {journeySaved && <p className="success-note" role="status"><Check size={16} />SmartFach będzie korzystał z tych informacji.</p>}
          <button className="button button-primary" disabled={journeyBusy}><Target size={18} />{journeyBusy ? "Zapisywanie…" : "Zapisz moje warunki"}</button>
        </form>
      </section>
      <div className="settings-side">
        <InstallAppCard />
        <section className="settings-card settings-usage-card">
          <div className="card-heading">
            <Gauge size={21} />
            <div>
              <h3>Plan {plan.name} i wykorzystanie</h3>
              <p>{usagePercentage}% miesięcznego limitu wykorzystane</p>
            </div>
          </div>
          <div className="settings-usage-value">
            <strong>{usagePercentage}%</strong>
            <span>{hasExtraLimit ? "Dodatkowy zapas jest aktywny" : "Limit odnowi się w kolejnym okresie"}</span>
          </div>
          <div className="settings-usage-progress" aria-hidden="true">
            <span style={{ width: `${usagePercentage}%` }} />
          </div>
          <button className="button button-primary" onClick={onOpenBilling}>
            <CreditCard size={17} /> Zwiększ limit
          </button>
        </section>
        <section className="settings-card">
          <div className="card-heading">
            <KeyRound size={21} />
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
          <p className="form-hint">
            Przy rozmowie do usługi AI trafia treść wiadomości, zapisane
            preferencje, dodane zdjęcie oraz kontekst potrzebny do
            wykonania zadania.
          </p>
          <p className="form-hint">
            Nie wklejaj klucza do czatu ani do danych firmy. Włączenie API
            oznacza płatne zapytania do dostawcy, a wyszukiwanie internetowe może
            doliczać osobny koszt. Limit bezpieczeństwa: 20 zapytań na godzinę i konto.
          </p>
        </section>
        <section className="settings-card">
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
          <button
            className="button button-secondary export-button"
            onClick={exportData}
          >
            <Download size={18} />
            Pobierz kopię danych
          </button>
          <p className="form-hint">
            Kopia zawiera zapisane ustawienia, rozmowy i pozostałe dane konta.
            Przechowuj ją w bezpiecznym miejscu. Przywracanie kopii z aplikacji
            nie jest jeszcze dostępne.
          </p>
          <a className="button button-secondary" href="/api/billing/contracts" download><Download size={18} />Pobierz potwierdzenia zamówień</a>
          <p><a href="/odstapienie">Odstąp od umowy tutaj</a></p>
          <p className="form-hint">Chcesz usunąć konto lub skorzystać ze swoich praw? <a href="/kontakt">Napisz do nas</a>. <a href="/regulamin">Regulamin</a> · <a href="/polityka-prywatnosci">Prywatność</a></p>
        </section>
        <div className="next-stage">
          <Check size={19} />
          <span>
            Preferencje możesz zmieniać w dowolnym momencie. SmartFach użyje
            najnowszych informacji przy kolejnych odpowiedziach.
          </span>
        </div>
        <div className="account-actions">
          <a className="button button-secondary" href="/platnosc"><CreditCard size={17} /> Plan i płatność</a>
          <form action="/auth/wyloguj" method="post"><button className="button button-secondary"><LogOut size={17} /> Wyloguj się</button></form>
        </div>
      </div>
    </div>
  );
}
