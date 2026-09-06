"use client";
import { useState } from "react";
import {
  Building2,
  Check,
  CreditCard,
  Download,
  ShieldCheck,
  KeyRound,
  LogOut,
  SlidersHorizontal,
  Target,
} from "lucide-react";
import {
  companySchema,
  journeySchema,
  type Company,
  type Workspace,
} from "@/domain/workspace";

export function SettingsPanel({
  data,
  available,
  webSearch,
  onSave,
  onSaveJourney,
}: {
  data: Workspace;
  available: boolean | null;
  webSearch: boolean;
  onSave: (company: Company) => Promise<void>;
  onSaveJourney: (journey: Workspace["journey"]) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const [journeyBusy, setJourneyBusy] = useState(false);
  const [journeySaved, setJourneySaved] = useState(false);
  const [journeyError, setJourneyError] = useState("");
  const input = (
    name: keyof Company,
    label: string,
    type = "text",
    maxLength = 500,
  ) => (
    <div className="field">
      <label htmlFor={"company-" + name}>{label}</label>
      <input
        id={"company-" + name}
        name={name}
        type={type}
        maxLength={maxLength}
        defaultValue={data.company[name]}
        required={name === "name"}
      />
    </div>
  );
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
      <section className="settings-card account-type-settings">
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
              mode: data.journey.mode,
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
      <section className="settings-card">
        <div className="card-heading">
          <Building2 size={21} />
          <div>
            <h3>Dane do ofert i dokumentów</h3>
            <p>Opcjonalne na początku. Uzupełnij je, gdy będą potrzebne.</p>
          </div>
        </div>
        <form
          className="settings-form"
          onChange={() => setSaved(false)}
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const parsed = companySchema.safeParse(
              Object.fromEntries(form.entries()),
            );
            if (!parsed.success) {
              setError("Sprawdź nazwę firmy i adres e-mail.");
              return;
            }
            setBusy(true);
            setError("");
            try {
              await onSave(parsed.data);
              setSaved(true);
            } catch (error) {
              setError(
                error instanceof Error ? error.message : "Nie zapisano danych.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          {input("name", "Nazwa firmy", "text", 160)}
          {input("address", "Adres firmy")}
          <div className="two-fields">
            {input("taxId", "NIP · opcjonalnie", "text", 30)}
            {input("phone", "Telefon", "tel", 40)}
          </div>
          {input("email", "E-mail", "email", 160)}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {saved && (
            <p className="success-note" role="status">
              <Check size={16} />
              Zapisano dane firmy na Twoim koncie.
            </p>
          )}
          <button className="button button-primary" disabled={busy}>
            <Check size={18} />
            {busy ? "Zapisywanie…" : "Zapisz dane firmy"}
          </button>
        </form>
      </section>
      <div className="settings-side">
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
            preferencje, dodane zdjęcie lub głosówka oraz kontekst potrzebny do
            wykonania zadania. Dane kontaktowe i notatki klientów nie są wysyłane.
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
