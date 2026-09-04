"use client";
import { useState } from "react";
import { Check } from "lucide-react";
import { Dialog } from "./dialog";
import {
  reportSchema,
  type Client,
  type VisitReport,
} from "@/domain/workspace";

export function ReportEditor({
  initial,
  clients,
  onSave,
  onClose,
}: {
  initial: VisitReport;
  clients: Client[];
  onSave: (report: VisitReport) => Promise<void>;
  onClose: () => void;
}) {
  const [report, setReport] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog
      title="Protokół po wizycie"
      description="Zapisz tylko to, co rzeczywiście wykonano i zmierzono. Nie dodajemy automatycznie potwierdzeń sprawności ani bezpieczeństwa."
      onClose={onClose}
      busy={busy}
      wide
    >
      <form
        className="panel-form"
        onSubmit={async (event) => {
          event.preventDefault();
          const parsed = reportSchema.safeParse(report);
          if (!parsed.success) {
            setError(
              "Uzupełnij klienta, opis, poprawną datę i wykonane czynności.",
            );
            return;
          }
          setBusy(true);
          try {
            await onSave(parsed.data);
          } catch (error) {
            setError(
              error instanceof Error
                ? error.message
                : "Nie zapisano protokołu.",
            );
            setBusy(false);
          }
        }}
      >
        {clients.length > 0 && (
          <div className="field">
            <label htmlFor="report-client-select">Klient z kartoteki</label>
            <select
              id="report-client-select"
              value={report.clientId}
              onChange={(event) => {
                const client = clients.find(
                  (client) => client.id === event.target.value,
                );
                setReport({
                  ...report,
                  clientId: client?.id ?? "",
                  client: client?.name ?? report.client,
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
        <div className="two-fields">
          <div className="field">
            <label htmlFor="report-client">Klient</label>
            <input
              id="report-client"
              required
              maxLength={160}
              value={report.client}
              onChange={(event) =>
                setReport({
                  ...report,
                  client: event.target.value,
                  clientId: "",
                })
              }
            />
          </div>
          <div className="field">
            <label htmlFor="report-date">Data wizyty</label>
            <input
              id="report-date"
              type="date"
              required
              value={report.date}
              onChange={(event) =>
                setReport({ ...report, date: event.target.value })
              }
            />
          </div>
        </div>
        {!report.clientId && (
          <p className="form-hint">
            Nowy klient wpisany ręcznie zostanie dodany do kartoteki przy
            zapisie protokołu.
          </p>
        )}
        <div className="field">
          <label htmlFor="report-subject">Opis wizyty</label>
          <input
            id="report-subject"
            required
            maxLength={160}
            value={report.subject}
            onChange={(event) =>
              setReport({ ...report, subject: event.target.value })
            }
          />
        </div>
        <div className="field">
          <label htmlFor="report-work">Wykonane czynności</label>
          <textarea
            id="report-work"
            required
            rows={5}
            maxLength={8000}
            value={report.work}
            onChange={(event) =>
              setReport({ ...report, work: event.target.value })
            }
          />
        </div>
        <div className="field">
          <label htmlFor="report-measurements">
            Pomiary i wyniki <span>· opcjonalnie</span>
          </label>
          <textarea
            id="report-measurements"
            rows={3}
            maxLength={4000}
            value={report.measurements}
            onChange={(event) =>
              setReport({ ...report, measurements: event.target.value })
            }
          />
        </div>
        <div className="field">
          <label htmlFor="report-recommendations">
            Zalecenia dla klienta <span>· opcjonalnie</span>
          </label>
          <textarea
            id="report-recommendations"
            rows={3}
            maxLength={4000}
            value={report.recommendations}
            onChange={(event) =>
              setReport({ ...report, recommendations: event.target.value })
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
            type="button"
            className="button button-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Anuluj
          </button>
          <button className="button button-primary" disabled={busy}>
            <Check size={18} />
            {busy ? "Zapisywanie…" : "Zapisz protokół"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
