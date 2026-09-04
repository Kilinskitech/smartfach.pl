"use client";
import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  Compass,
  CreditCard,
  Download,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Rocket,
  LogOut,
} from "lucide-react";
import {
  companySchema,
  type Company,
  type JourneyMode,
  type Workspace,
} from "@/domain/workspace";

const accountTypes = [
  {
    id: "discover",
    label: "Odkryj",
    description: "Szukam kierunku lub pomysłu na biznes",
    icon: Compass,
  },
  {
    id: "launch",
    label: "Uruchom",
    description: "Mam pomysł i chcę zdobyć pierwszych klientów",
    icon: Rocket,
  },
  {
    id: "operate",
    label: "Prowadź",
    description: "Mam klientów lub zespół i obsługuję zlecenia",
    icon: BriefcaseBusiness,
  },
] as const;

export function SettingsPanel({
  data,
  available,
  webSearch,
  onSave,
  onChangeAccountType,
}: {
  data: Workspace;
  available: boolean | null;
  webSearch: boolean;
  onSave: (company: Company) => Promise<void>;
  onChangeAccountType: (mode: JourneyMode) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState(false);
  const [accountTypeBusy, setAccountTypeBusy] = useState(false);
  const [accountTypeNotice, setAccountTypeNotice] = useState("");
  const [accountTypeError, setAccountTypeError] = useState("");
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
          <Compass size={21} />
          <div>
            <h3>Typ konta</h3>
            <p>Dopasowuje asystenta i funkcje do obecnej sytuacji.</p>
          </div>
        </div>
        <div className="account-type-grid" role="group" aria-label="Typ konta SmartFach">
          {accountTypes.map(({ id, label, description, icon: Icon }) => (
            <button
              key={id}
              className={data.journey.mode === id ? "selected" : ""}
              aria-pressed={data.journey.mode === id}
              disabled={accountTypeBusy}
              onClick={async () => {
                if (data.journey.mode === id) return;
                setAccountTypeBusy(true);
                setAccountTypeNotice("");
                setAccountTypeError("");
                try {
                  await onChangeAccountType(id);
                  setAccountTypeNotice(`Typ konta zmieniono na ${label}.`);
                } catch (error) {
                  setAccountTypeError(
                    error instanceof Error ? error.message : "Nie zmieniono typu konta.",
                  );
                } finally {
                  setAccountTypeBusy(false);
                }
              }}
            >
              <span><Icon size={20} /></span>
              <strong>{label}</strong>
              <small>{description}</small>
              {data.journey.mode === id && <Check size={17} />}
            </button>
          ))}
        </div>
        <p className="form-hint account-type-note">
          Typ konta nie jest przełącznikiem codziennej pracy. Zmieniasz go tutaj,
          kiedy zmienia się etap Twojej działalności. Plan, limit i zapisane dane pozostają bez zmian.
        </p>
        {accountTypeNotice && <p className="success-note" role="status"><Check size={16} />{accountTypeNotice}</p>}
        {accountTypeError && <p className="form-error" role="alert">{accountTypeError}</p>}
      </section>
      <section className="settings-card">
        <div className="card-heading">
          <Building2 size={21} />
          <div>
            <h3>Dane Twojej firmy</h3>
            <p>Pojawią się na pobieranych dokumentach.</p>
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
            SmartFach odpowiada na pytania oraz przygotowuje szkice wycen,
            protokołów i wiadomości do klientów.
          </p>
          <p className="form-hint">
            {webSearch
              ? "Internet jest włączony. Asystent uruchamia wyszukiwanie tylko wtedy, gdy pytanie wymaga aktualnych danych, i pokazuje źródła."
              : "Wyszukiwanie internetowe jest wyłączone w konfiguracji serwera."}
          </p>
          <p className="form-hint">
            Przy rozmowie do usługi AI trafia treść wiadomości, dodane zdjęcie
            lub głosówka, nazwa firmy, same nazwy klientów, maksymalnie 100
            pozycji cennika oraz historia jednoznacznie wskazanego klienta.
            Dane kontaktowe i notatki klienta nie są wysyłane.
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
            Dane są przypisane do Twojej organizacji i chronione sesją konta.
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
            Kopia zawiera dane klientów i dokumenty. Przechowuj ją w bezpiecznym
            miejscu. Przywracanie kopii z aplikacji nie jest jeszcze dostępne.
          </p>
        </section>
        <div className="next-stage">
          <ArrowRight size={19} />
          <span>
            Podstawowe konto i płatności są podłączone. Zaproszenia pracowników
            wymagają jeszcze uruchomienia przed sprzedażą planu Firma.
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
