"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Dialog } from "./dialog";
import {
  clientSchema,
  priceSchema,
  teamMemberSchema,
  type Client,
  type PriceItem,
  type TeamMember,
} from "@/domain/workspace";
import { quoteUnits } from "@/domain/quotes/draft";
import { DeleteAction } from "./delete-action";

type BaseProps<T> = {
  initial: T;
  onSave: (value: T) => Promise<void>;
  onClose: () => void;
  onDelete?: () => Promise<void>;
  deleteBlocked?: string;
};
export function ClientForm({
  initial,
  onSave,
  onClose,
  onDelete,
  deleteBlocked,
}: BaseProps<Client>) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const field = (
    key: keyof Client,
    label: string,
    type = "text",
    limit = 500,
    required = false,
  ) => (
    <div className="field">
      <label htmlFor={"client-" + key}>{label}</label>
      <input
        id={"client-" + key}
        type={type}
        value={value[key]}
        maxLength={limit}
        required={required}
        onChange={(event) => setValue({ ...value, [key]: event.target.value })}
      />
    </div>
  );
  return (
    <Dialog
      title={initial.name ? "Edytuj klienta" : "Nowy klient"}
      description="Na początek wystarczy nazwa. Dane kontaktowe możesz uzupełnić później."
      onClose={onClose}
      busy={busy}
    >
      <form
        className="panel-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const parsed = clientSchema.safeParse(value);
          if (!parsed.success) {
            setError("Sprawdź nazwę i adres e-mail.");
            return;
          }
          setBusy(true);
          try {
            await onSave(parsed.data);
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Nie zapisano klienta.",
            );
            setBusy(false);
          }
        }}
      >
        {field("name", "Imię i nazwisko / nazwa firmy", "text", 160, true)}
        <div className="two-fields">
          {field("phone", "Telefon", "tel", 40)}
          {field("email", "E-mail", "email", 160)}
        </div>
        {field("address", "Adres realizacji")}
        <div className="field">
          <label htmlFor="client-notes">Notatka o kliencie</label>
          <textarea
            id="client-notes"
            rows={3}
            maxLength={3000}
            value={value.notes}
            onChange={(event) =>
              setValue({ ...value, notes: event.target.value })
            }
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="panel-actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Anuluj
          </button>
          <button className="button button-primary" disabled={busy}>
            <Check size={18} />
            {busy ? "Zapisywanie…" : "Zapisz klienta"}
          </button>
        </div>
        {onDelete && (
          <DeleteAction
            label="Usuń klienta"
            onDelete={onDelete}
            blocked={deleteBlocked}
          />
        )}
      </form>
    </Dialog>
  );
}
export function PriceForm({
  initial,
  onSave,
  onClose,
  onDelete,
}: BaseProps<PriceItem>) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog
      title={initial.name ? "Edytuj pozycję" : "Nowa pozycja cennika"}
      description="Podaj własną cenę sprzedaży netto. Nie wpisujemy cen za Ciebie."
      onClose={onClose}
      busy={busy}
    >
      <form
        className="panel-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const parsed = priceSchema.safeParse(value);
          if (!parsed.success) {
            setError(
              "Podaj nazwę, jednostkę i poprawną cenę netto (maks. 2 miejsca po przecinku).",
            );
            return;
          }
          setBusy(true);
          try {
            await onSave(parsed.data);
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Nie zapisano pozycji.",
            );
            setBusy(false);
          }
        }}
      >
        <div className="field">
          <label htmlFor="price-name">Nazwa usługi lub materiału</label>
          <input
            id="price-name"
            value={value.name}
            maxLength={160}
            required
            onChange={(event) =>
              setValue({ ...value, name: event.target.value })
            }
          />
        </div>
        <div className="two-fields">
          <div className="field">
            <label htmlFor="price-value">Cena sprzedaży netto (zł)</label>
            <input
              id="price-value"
              inputMode="decimal"
              required
              value={value.price}
              maxLength={17}
              onChange={(event) =>
                setValue({ ...value, price: event.target.value })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="price-unit">Jednostka</label>
            <select
              id="price-unit"
              value={value.unit}
              onChange={(event) =>
                setValue({
                  ...value,
                  unit: event.target.value as PriceItem["unit"],
                })
              }
            >
              {quoteUnits.map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="form-hint">
          Zmiana cennika nie zmieni wcześniejszych wycen. VAT wybierzesz na
          dokumencie.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="panel-actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Anuluj
          </button>
          <button className="button button-primary" disabled={busy}>
            <Check size={18} />
            {busy ? "Zapisywanie…" : "Zapisz pozycję"}
          </button>
        </div>
        {onDelete && (
          <DeleteAction label="Usuń pozycję z cennika" onDelete={onDelete} />
        )}
      </form>
    </Dialog>
  );
}

const teamRoleOptions: Array<{
  value: TeamMember["role"];
  label: string;
  description: string;
}> = [
  {
    value: "technician",
    label: "Fachowiec",
    description: "Praca u klientów i dokumentacja wizyt",
  },
  {
    value: "office",
    label: "Biuro",
    description: "Kontakt z klientami i obsługa dokumentów",
  },
  {
    value: "manager",
    label: "Kierownik",
    description: "Koordynacja pracy zespołu",
  },
];

export function TeamMemberForm({
  initial,
  onSave,
  onClose,
  onDelete,
}: BaseProps<TeamMember>) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const field = (
    key: "name" | "email" | "phone",
    label: string,
    type = "text",
    required = false,
  ) => (
    <div className="field">
      <label htmlFor={`team-${key}`}>{label}</label>
      <input
        id={`team-${key}`}
        type={type}
        value={value[key]}
        maxLength={key === "phone" ? 40 : 160}
        required={required}
        onChange={(event) => setValue({ ...value, [key]: event.target.value })}
      />
    </div>
  );
  return (
    <Dialog
      title={initial.name ? "Edytuj członka zespołu" : "Dodaj członka zespołu"}
      description="Dodaj osobę do listy firmy. Zaproszenie e-mail i osobny login nie są jeszcze uruchomione."
      onClose={onClose}
      busy={busy}
    >
      <form
        className="panel-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const parsed = teamMemberSchema.safeParse(value);
          if (!parsed.success) {
            setError("Podaj imię i nazwisko oraz sprawdź adres e-mail.");
            return;
          }
          setBusy(true);
          try {
            await onSave(parsed.data);
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Nie zapisano członka zespołu.",
            );
            setBusy(false);
          }
        }}
      >
        {field("name", "Imię i nazwisko", "text", true)}
        <div className="two-fields">
          {field("email", "E-mail", "email")}
          {field("phone", "Telefon", "tel")}
        </div>
        <div className="field">
          <label htmlFor="team-role">Stanowisko</label>
          <select
            id="team-role"
            value={value.role}
            onChange={(event) =>
              setValue({
                ...value,
                role: event.target.value as TeamMember["role"],
              })
            }
          >
            {teamRoleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.description}
              </option>
            ))}
          </select>
        </div>
        <p className="form-hint">
          Stanowisko porządkuje zespół. Uprawnienia kont będą egzekwowane dopiero
          po wdrożeniu logowania i bezpiecznej synchronizacji organizacji.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="panel-actions">
          <button
            className="button button-secondary"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Anuluj
          </button>
          <button className="button button-primary" disabled={busy}>
            <Check size={18} />
            {busy ? "Zapisywanie…" : "Zapisz osobę"}
          </button>
        </div>
        {onDelete && (
          <DeleteAction label="Usuń z zespołu" onDelete={onDelete} />
        )}
      </form>
    </Dialog>
  );
}
