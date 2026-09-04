"use client";
import { useState } from "react";
import { Upload, Check } from "lucide-react";
import { Dialog } from "./dialog";
import { parseCatalogCsv, catalogKey } from "@/domain/catalog-csv";
import type { PriceItem } from "@/domain/workspace";
export function CatalogImport({
  catalog,
  onSave,
  onClose,
}: {
  catalog: PriceItem[];
  onSave: (items: PriceItem[]) => Promise<void>;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<Omit<PriceItem, "id">[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const existing = new Set(catalog.map(catalogKey));
  const fresh =
    preview?.filter((item) => !existing.has(catalogKey(item))) ?? [];
  return (
    <Dialog
      title="Import cennika"
      description="Wczytaj CSV wyeksportowany z Excela albo wklej tabelę. Najpierw zobaczysz podgląd — niczego nie nadpisujemy."
      onClose={onClose}
      busy={busy}
      wide
    >
      <div className="panel-form">
        <label className="upload-button">
          <Upload size={18} />
          Wybierz plik CSV
          <input
            type="file"
            accept=".csv,text/csv"
            aria-label="Wybierz plik CSV"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 500_000) {
                setError("Maksymalny rozmiar pliku to 500 KB.");
                return;
              }
              try {
                setText(await file.text());
                setPreview(null);
                setError("");
              } catch {
                setError("Nie można odczytać pliku.");
              }
            }}
          />
        </label>
        <div className="field">
          <label htmlFor="csv-content">Treść CSV</label>
          <textarea
            id="csv-content"
            rows={6}
            maxLength={500000}
            placeholder="nazwa;jednostka;cena_netto"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setPreview(null);
              setError("");
            }}
          />
        </div>
        <p className="form-hint">
          Kolumny: nazwa, jednostka, cena_netto. Jednostki: szt., godz., usł.,
          m. Przy cenach z przecinkiem użyj średnika lub tabulatora między
          kolumnami. Pliki XLSX nie są jeszcze obsługiwane.
        </p>
        <button
          className="button button-secondary"
          onClick={() => {
            try {
              setPreview(parseCatalogCsv(text));
              setError("");
            } catch (error) {
              setPreview(null);
              setError(error instanceof Error ? error.message : "Błędny CSV.");
            }
          }}
        >
          Sprawdź import
        </button>
        {preview && (
          <div className="import-preview">
            <p>
              <strong>Nowe pozycje: {fresh.length}</strong>
              {preview.length !== fresh.length &&
                " · Już w cenniku (pominięte): " +
                  (preview.length - fresh.length)}
            </p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nazwa</th>
                    <th>Jednostka</th>
                    <th>Netto</th>
                  </tr>
                </thead>
                <tbody>
                  {fresh.slice(0, 12).map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.unit}</td>
                      <td>{item.price} zł</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {fresh.length > 12 && (
              <p>Podgląd pierwszych 12 z {fresh.length} nowych pozycji.</p>
            )}
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="panel-actions">
          <button
            className="button button-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Anuluj
          </button>
          <button
            className="button button-primary"
            disabled={busy || !fresh.length}
            onClick={async () => {
              setBusy(true);
              try {
                await onSave(
                  fresh.map((item) => ({ ...item, id: crypto.randomUUID() })),
                );
              } catch (error) {
                setError(
                  error instanceof Error
                    ? error.message
                    : "Nie zapisano importu.",
                );
                setBusy(false);
              }
            }}
          >
            <Check size={18} />
            {busy ? "Importowanie…" : "Dodaj do cennika"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
