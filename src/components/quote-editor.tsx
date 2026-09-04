"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import { formatPln } from "@/domain/quotes/calculate";
import {
  vatRates,
  quoteUnits,
  validateDraft,
  type DraftLine,
  type QuoteDraft,
} from "@/domain/quotes/draft";
import type { Client, PriceItem } from "@/domain/workspace";

type Props = {
  initialDraft: QuoteDraft;
  onClose: () => void;
  onApply: (draft: QuoteDraft) => void | Promise<void>;
  clients?: Client[];
  catalog?: PriceItem[];
  title?: string;
};

export function QuoteEditor({
  initialDraft,
  onClose,
  onApply,
  clients = [],
  catalog = [],
  title = "Edytuj wycenę",
}: Props) {
  const [draft, setDraft] = useState(initialDraft);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const validation = useMemo(() => validateDraft(draft), [draft]);

  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      element?.close();
      document.body.style.overflow = previousOverflow;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus();
    };
  }, []);

  function updateLine(
    id: string,
    field: "label" | "price" | "quantity" | "unit",
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((line) =>
        line.id === id
          ? {
              ...line,
              [field]: value,
              source: field === "price" ? "manual" : line.source,
            }
          : line,
      ),
    }));
  }

  function addLine() {
    const line: DraftLine = {
      id: crypto.randomUUID(),
      label: "",
      unit: "szt.",
      price: "",
      quantity: "1",
      source: "manual",
    };
    setDraft((current) => ({ ...current, lines: [...current.lines, line] }));
    requestAnimationFrame(() =>
      document.getElementById(`${line.id}-label`)?.focus(),
    );
  }

  function errorFor(id: string) {
    return showErrors && validation.errors[id] ? (
      <p className="field-error" id={`${id}-error`}>
        {validation.errors[id]}
      </p>
    ) : null;
  }

  function accessibility(id: string) {
    return {
      "aria-invalid": showErrors && Boolean(validation.errors[id]),
      "aria-describedby":
        showErrors && validation.errors[id] ? `${id}-error` : undefined,
    };
  }

  return (
    <dialog
      ref={dialog}
      className="editor-dialog"
      aria-labelledby="editor-title"
      aria-describedby="editor-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          if (!saving) onClose();
        }
      }}
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setShowErrors(true);
          if (!validation.quote || saving) return;
          setSaving(true);
          setSaveError("");
          try {
            await onApply(draft);
          } catch (error) {
            setSaveError(
              error instanceof Error ? error.message : "Nie zapisano wyceny.",
            );
            setSaving(false);
          }
        }}
        noValidate
      >
        <div className="editor-header">
          <div>
            <p className="eyebrow">TWÓJ DOKUMENT</p>
            <h2 id="editor-title">{title}</h2>
          </div>
          <button
            type="button"
            className="close-button"
            aria-label="Zamknij bez zmian"
            disabled={saving}
            onClick={onClose}
          >
            <X size={23} aria-hidden="true" />
          </button>
        </div>
        <div className="editor-content">
          <p id="editor-description" className="editor-intro">
            Wybierz własne pozycje lub wpisz je ręcznie. Sumy przeliczą się
            automatycznie. Szkic zapisze się na Twoim koncie.
          </p>
          {clients.length > 0 && (
            <div className="field client-picker">
              <label htmlFor="saved-client">Klient z kartoteki</label>
              <select
                id="saved-client"
                value={draft.clientId ?? ""}
                onChange={(event) => {
                  const client = clients.find(
                    (item) => item.id === event.target.value,
                  );
                  setDraft({
                    ...draft,
                    clientId: client?.id ?? "",
                    client: client?.name ?? draft.client,
                  });
                }}
              >
                <option value="">Wpisz klienta ręcznie</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                    {client.address ? " · " + client.address : ""}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="client-fields">
            <div className="field">
              <label htmlFor="client">Klient</label>
              <input
                id="client"
                maxLength={160}
                value={draft.client}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    client: event.target.value,
                    clientId: "",
                  })
                }
                {...accessibility("client")}
              />
              {errorFor("client")}
            </div>
            <div className="field">
              <label htmlFor="subject">Opis wyceny</label>
              <input
                id="subject"
                maxLength={160}
                value={draft.subject}
                onChange={(event) =>
                  setDraft({ ...draft, subject: event.target.value })
                }
                {...accessibility("subject")}
              />
              {errorFor("subject")}
            </div>
          </div>
          {!draft.clientId && (
            <p className="form-hint">
              Nowy klient wpisany ręcznie zostanie dodany do kartoteki przy
              zapisie wyceny.
            </p>
          )}
          <div className="editor-line-list">
            {draft.lines.map((line, index) => (
              <fieldset className="editor-line" key={line.id}>
                <legend>Pozycja {index + 1}</legend>
                <div className="editor-line-heading">
                  <div className="field">
                    <label htmlFor={`${line.id}-label`}>Nazwa pozycji</label>
                    <input
                      id={`${line.id}-label`}
                      maxLength={160}
                      value={line.label}
                      onChange={(event) =>
                        updateLine(line.id, "label", event.target.value)
                      }
                      {...accessibility(`${line.id}-label`)}
                    />
                    {errorFor(`${line.id}-label`)}
                  </div>
                  <button
                    type="button"
                    className="remove-button"
                    disabled={draft.lines.length === 1}
                    aria-label={`Usuń pozycję ${index + 1}`}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        lines: draft.lines.filter(
                          (item) => item.id !== line.id,
                        ),
                      })
                    }
                  >
                    <Trash2 size={19} aria-hidden="true" />
                  </button>
                </div>
                <div className="line-fields">
                  <div className="field">
                    <label htmlFor={`${line.id}-price`}>
                      Cena netto / jedn.
                    </label>
                    <div className="input-wrap">
                      <input
                        id={`${line.id}-price`}
                        inputMode="decimal"
                        autoComplete="off"
                        maxLength={17}
                        value={line.price}
                        onChange={(event) =>
                          updateLine(line.id, "price", event.target.value)
                        }
                        {...accessibility(`${line.id}-price`)}
                      />
                      <span>zł</span>
                    </div>
                    {errorFor(`${line.id}-price`)}
                  </div>
                  <div className="field">
                    <label htmlFor={`${line.id}-quantity`}>Ilość</label>
                    <input
                      id={`${line.id}-quantity`}
                      inputMode="decimal"
                      autoComplete="off"
                      maxLength={17}
                      value={line.quantity}
                      onChange={(event) =>
                        updateLine(line.id, "quantity", event.target.value)
                      }
                      {...accessibility(`${line.id}-quantity`)}
                    />
                    {errorFor(`${line.id}-quantity`)}
                  </div>
                  <div className="field">
                    <label htmlFor={`${line.id}-unit`}>Jednostka</label>
                    <select
                      id={`${line.id}-unit`}
                      value={line.unit}
                      onChange={(event) =>
                        updateLine(line.id, "unit", event.target.value)
                      }
                      {...accessibility(`${line.id}-unit`)}
                    >
                      {quoteUnits.map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>
                    {errorFor(`${line.id}-unit`)}
                  </div>
                </div>
              </fieldset>
            ))}
          </div>
          {catalog.length > 0 && (
            <div className="field catalog-picker">
              <label htmlFor="catalog-item">Dodaj z Twojego cennika</label>
              <select
                id="catalog-item"
                value=""
                disabled={draft.lines.length >= 100}
                onChange={(event) => {
                  const item = catalog.find(
                    (item) => item.id === event.target.value,
                  );
                  if (!item) return;
                  const line: DraftLine = {
                    id: crypto.randomUUID(),
                    label: item.name,
                    unit: item.unit,
                    price: item.price,
                    quantity: "1",
                    source: "catalog",
                  };
                  setDraft({
                    ...draft,
                    lines:
                      draft.lines.length === 1 &&
                      !draft.lines[0]?.label &&
                      !draft.lines[0]?.price
                        ? [line]
                        : [...draft.lines, line],
                  });
                }}
              >
                <option value="">Wybierz pozycję…</option>
                {catalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.price} zł / {item.unit}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            className="add-line-button"
            disabled={draft.lines.length >= 100}
            onClick={addLine}
          >
            <Plus size={18} aria-hidden="true" />
            Dodaj pozycję ręcznie
          </button>
          <div className="vat-row">
            <div className="field">
              <label htmlFor="vat">Stawka VAT</label>
              <select
                id="vat"
                value={draft.vatBasisPoints}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    vatBasisPoints: Number(event.target.value),
                  })
                }
                {...accessibility("vat")}
              >
                <option value={-1}>Wybierz…</option>
                {vatRates.map((rate) => (
                  <option key={rate} value={rate}>
                    {rate / 100}%
                  </option>
                ))}
              </select>
              {errorFor("vat")}
            </div>
            <p>
              Wybierasz stawkę dla całej wyceny. Aplikacja nie ustala jej za
              Ciebie; bez kosztów własnych nie liczy marży.
            </p>
          </div>
        </div>
        <div className="editor-bottom">
          <div className="editor-total" aria-live="polite" aria-atomic="true">
            <span>Razem brutto</span>
            <strong>
              {validation.quote ? formatPln(validation.quote.grossCents) : "—"}
            </strong>
            {showErrors && validation.generalError && (
              <p className="field-error">{validation.generalError}</p>
            )}
            {saveError && (
              <p className="field-error" role="alert">
                {saveError}
              </p>
            )}
          </div>
          <div className="editor-bottom-actions">
            <button
              type="button"
              className="button button-secondary"
              disabled={saving}
              onClick={onClose}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >
              <Check size={19} aria-hidden="true" />
              {saving ? "Zapisywanie…" : "Zapisz wycenę"}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
