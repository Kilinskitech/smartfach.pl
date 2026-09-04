"use client";
import { useState } from "react";
import {
  Download,
  PencilLine,
  FileText,
  Check,
  Copy,
  CalendarDays,
  UserRound,
  Hash,
} from "lucide-react";
import { Dialog } from "./dialog";
import { DeleteAction } from "./delete-action";
import {
  documentTitle,
  documentClient,
  type WorkDocument,
  type Company,
} from "@/domain/workspace";
import { formatPln } from "@/domain/quotes/calculate";
import { validateDraft } from "@/domain/quotes/draft";
const sources = {
  "command-demo": "Przykład",
  "rate-demo": "Przykład",
  manual: "Wpisano ręcznie",
  catalog: "Twój cennik",
  "user-input": "Cena z wiadomości",
};
export function DocumentViewer({
  document: doc,
  company,
  onEdit,
  onClose,
  onDelete,
}: {
  document: WorkDocument;
  company: Company;
  onEdit: () => void;
  onClose: () => void;
  onDelete: () => Promise<void>;
}) {
  const [reviewed, setReviewed] = useState(false),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [error, setError] = useState("");
  const quote = doc.kind === "quote" ? validateDraft(doc.draft).quote : null;
  const reference =
    (doc.kind === "quote" ? "WY" : "PR") +
    "-" +
    doc.createdAt.slice(0, 10).replaceAll("-", "") +
    "-" +
    doc.id.slice(0, 6).toUpperCase();
  async function download() {
    if (!reviewed || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/fonts/NotoSans-Regular.ttf");
      if (!response.ok) throw new Error("Nie udało się wczytać fontu PDF.");
      const { createDocumentPdf } = await import("@/domain/document-pdf");
      const bytes = await createDocumentPdf(
        doc,
        company,
        new Uint8Array(await response.arrayBuffer()),
      );
      const blob = new Blob([new Uint8Array(bytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download =
        (doc.kind === "quote" ? "wycena-" : "protokol-") +
        doc.id.slice(0, 8) +
        ".pdf";
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setNotice(
        "Plik PDF jest przygotowany. Pobieranie rozpoczęło się w przeglądarce.",
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Nie udało się przygotować PDF.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={doc.kind === "quote" ? "Twoja wycena" : "Protokół wizyty"}
      description="Zapisano na Twoim koncie. Dokument nie został wysłany klientowi."
      onClose={onClose}
      busy={busy}
      wide
    >
      <div className="document-view">
        <div className="document-heading">
          <span className="tag">
            <FileText size={14} />
            Dokument zapisany
          </span>
          <h3>{documentTitle(doc)}</h3>
          <div className="document-meta">
            <span>
              <UserRound size={14} />
              {documentClient(doc)}
            </span>
            <span>
              <CalendarDays size={14} />
              {new Date(doc.createdAt).toLocaleDateString("pl-PL")}
            </span>
            <span>
              <Hash size={14} />
              {reference}
            </span>
          </div>
        </div>
        {quote && doc.kind === "quote" ? (
          <>
            <div className="document-total">
              <span>Razem brutto</span>
              <strong>{formatPln(quote.grossCents)}</strong>
            </div>
            <ul className="document-lines">
              {quote.lines.map((line, index) => (
                <li key={line.id}>
                  <div>
                    <strong>{line.label}</strong>
                    <span>
                      {doc.draft.lines[index]?.quantity}{" "}
                      {doc.draft.lines[index]?.unit} ×{" "}
                      {formatPln(line.unitNetCents)}
                    </span>
                    <small>{sources[doc.draft.lines[index]!.source]}</small>
                  </div>
                  <b>{formatPln(line.netCents)}</b>
                </li>
              ))}
            </ul>
            <dl className="document-totals">
              <div>
                <dt>Razem netto</dt>
                <dd>{formatPln(quote.netCents)}</dd>
              </div>
              <div>
                <dt>VAT ({doc.draft.vatBasisPoints / 100}%)</dt>
                <dd>{formatPln(quote.vatCents)}</dd>
              </div>
            </dl>
          </>
        ) : doc.kind === "report" ? (
          <div className="report-preview">
            <p className="form-hint">
              Data wizyty: {doc.report.date.split("-").reverse().join(".")}
            </p>
            <h4>Wykonane czynności</h4>
            <p>{doc.report.work}</p>
            {doc.report.measurements && (
              <>
                <h4>Pomiary i wyniki</h4>
                <p>{doc.report.measurements}</p>
              </>
            )}
            {doc.report.recommendations && (
              <>
                <h4>Zalecenia</h4>
                <p>{doc.report.recommendations}</p>
              </>
            )}
          </div>
        ) : null}
        {!company.name && (
          <p className="inline-notice">
            Dane firmy nie są jeszcze uzupełnione. PDF będzie oznaczony jako
            dokument bez danych wykonawcy.
          </p>
        )}
        <div className="document-review-step">
          <span>OSTATNI KROK</span>
          <strong>Sprawdź dokument przed pobraniem</strong>
          <label className="review-checkbox">
            <input
              type="checkbox"
              checked={reviewed}
              onChange={(event) => setReviewed(event.target.checked)}
            />
            <span>
              Sprawdziłem treść
              {doc.kind === "quote"
                ? ", ceny i stawkę VAT"
                : ", wykonane czynności i podane wyniki"}
              .
            </span>
          </label>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="success-note" role="status">
            <Check size={16} />
            {notice}
          </p>
        )}
        <div className="document-buttons">
          <button
            className="button button-secondary"
            disabled={busy}
            onClick={onEdit}
          >
            <PencilLine size={18} />
            Edytuj
          </button>
          <button
            className="button button-primary"
            disabled={!reviewed || busy}
            onClick={download}
          >
            <Download size={18} />
            {busy ? "Przygotowywanie…" : "Pobierz PDF"}
          </button>
        </div>
        <button
          className="text-button copy-document"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                "Dzień dobry, przesyłam " +
                  (doc.kind === "quote" ? "wycenę" : "protokół") +
                  " dotyczący: " +
                  documentTitle(doc) +
                  ". W razie pytań proszę o kontakt.",
              );
              setNotice(
                "Skopiowano tekst wiadomości. Dołącz pobrany PDF — nic nie zostało wysłane.",
              );
            } catch {
              setError("Przeglądarka nie pozwoliła skopiować tekstu.");
            }
          }}
        >
          <Copy size={16} />
          Skopiuj tekst wiadomości do klienta
        </button>
        {!busy && <DeleteAction label="Usuń dokument" onDelete={onDelete} />}
      </div>
    </Dialog>
  );
}
