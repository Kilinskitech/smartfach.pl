"use client";
import { useState } from "react";

/** Dwuetapowe, jawne usuwanie pojedynczego rekordu. */
export function DeleteAction({
  label,
  onDelete,
  blocked,
}: {
  label: string;
  onDelete: () => Promise<void>;
  blocked?: string;
}) {
  const [confirm, setConfirm] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <div className="delete-action">
      {blocked ? (
        <p className="form-hint">{blocked}</p>
      ) : confirm ? (
        <>
          <p>
            Usunąć ten wpis? Nie można tego cofnąć. W ustawieniach możesz
            wcześniej pobrać kopię danych.
          </p>
          <div>
            <button
              type="button"
              className="button button-secondary"
              disabled={busy}
              onClick={() => setConfirm(false)}
            >
              Zachowaj wpis
            </button>
            <button
              type="button"
              className="button button-danger"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onDelete();
                } catch (error) {
                  setError(
                    error instanceof Error
                      ? error.message
                      : "Nie udało się usunąć wpisu.",
                  );
                  setBusy(false);
                }
              }}
            >
              {busy ? "Usuwanie…" : "Potwierdź usunięcie"}
            </button>
          </div>
        </>
      ) : (
        <button
          className="text-button danger-link"
          type="button"
          onClick={() => setConfirm(true)}
        >
          {label}
        </button>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
