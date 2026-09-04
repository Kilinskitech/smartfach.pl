import { describe, it, expect } from "vitest";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";
import { createDocumentPdf } from "./document-pdf";
import { emptyWorkspace, newReport, type WorkDocument } from "./workspace";
import { fixtureDocument, fixtureClient } from "../test/fixtures";
const company = {
  ...emptyWorkspace.company,
  name: "Żółć — serwis urządzeń",
  address: "ul. Łąkowa 12, Poznań",
};
async function render(doc: WorkDocument, name: string) {
  const bytes = await createDocumentPdf(
    doc,
    company,
    await readFile("public/fonts/NotoSans-Regular.ttf"),
  );
  if (process.env.SMARTFACH_PDF_QA === "true") {
    await mkdir("tmp/pdf-qa", { recursive: true });
    await writeFile("tmp/pdf-qa/" + name + ".pdf", bytes);
  }
  return PDFDocument.load(bytes);
}
describe("rzeczywisty generator PDF", () => {
  it("tworzy polską wycenę na jednej stronie", async () => {
    const pdf = await render(fixtureDocument(), "quote");
    expect(pdf.getPageCount()).toBe(1);
    expect(pdf.getTitle()).toBe("Przegląd i wymiana części");
  });
  it("łamie długi protokół na strony", async () => {
    const base = fixtureDocument();
    const doc: WorkDocument = {
      id: base.id,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
      kind: "report",
      report: {
        ...newReport(fixtureClient),
        subject: "Szczegółowy protokół",
        work: "Czyszczenie wymiennika i kontrola połączeń. ".repeat(160),
        measurements: "Pomiar wpisany przez wykonawcę.",
        recommendations: "Zachować dostęp do urządzenia.",
      },
    };
    const pdf = await render(doc, "report-long");
    expect(pdf.getPageCount()).toBeGreaterThan(1);
  });
  it("łamie długą tabelę z polskimi opisami", async () => {
    const doc = fixtureDocument();
    if (doc.kind !== "quote") throw Error();
    doc.draft.lines = Array.from({ length: 40 }, (_, i) => ({
      ...doc.draft.lines[0]!,
      id: "line-" + i,
      label:
        "Pozycja " +
        (i + 1) +
        " — Przegląd i czyszczenie jednostki zewnętrznej z kontrolą połączeń",
    }));
    expect((await render(doc, "quote-long")).getPageCount()).toBeGreaterThan(2);
  });
  it("blokuje nieobsługiwane znaki zamiast produkować uszkodzoną treść", async () => {
    const doc = fixtureDocument();
    if (doc.kind !== "quote") throw Error();
    doc.draft.subject = "Naprawa 🔥";
    await expect(render(doc, "invalid")).rejects.toThrow("nieobsługiwany znak");
  });
});
