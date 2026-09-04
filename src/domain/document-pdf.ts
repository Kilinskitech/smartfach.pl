import { PDFDocument, rgb, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import {
  documentSchema,
  companySchema,
  documentTitle,
  documentClient,
  type WorkDocument,
  type Company,
} from "./workspace";
import { validateDraft } from "./quotes/draft";
import { formatPln } from "./quotes/calculate";

/** PDF powstaje z zatwierdzonych przez użytkownika danych, bez żądań do AI. */
export async function createDocumentPdf(
  input: WorkDocument,
  companyInput: Company,
  fontBytes: Uint8Array,
): Promise<Uint8Array> {
  const doc = documentSchema.parse(input);
  const company = companySchema.parse(companyInput);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const characterSet = new Set(font.getCharacterSet());
  const ink = rgb(0.09, 0.17, 0.23),
    muted = rgb(0.35, 0.42, 0.46),
    line = rgb(0.86, 0.89, 0.89),
    accent = rgb(1, 0.61, 0.33);
  const width = 595.28,
    height = 841.89,
    margin = 44,
    usable = width - 2 * margin;
  let page!: PDFPage;
  let y = 0;
  const normalize = (text: string) =>
    text
      .replace(/\r\n?/g, "\n")
      .replace(/\t/g, "  ")
      .replace(/\u00a0/g, " ");
  function safe(text: string) {
    const normalized = normalize(text);
    if (
      [...normalized].some(
        (char) => char !== "\n" && !characterSet.has(char.codePointAt(0)!),
      )
    )
      throw new Error(
        "PDF zawiera nieobsługiwany znak. Usuń emoji lub znaki specjalne i spróbuj ponownie.",
      );
    return normalized;
  }
  function wrap(text: string, size: number, maxWidth: number) {
    const lines: string[] = [];
    for (const paragraph of safe(text).split("\n")) {
      if (!paragraph) {
        lines.push("");
        continue;
      }
      let current = "";
      for (const word of paragraph.split(/\s+/)) {
        const candidate = current ? current + " " + word : word;
        if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
          current = candidate;
          continue;
        }
        if (current) {
          lines.push(current);
          current = "";
        }
        for (const char of word) {
          if (font.widthOfTextAtSize(current + char, size) > maxWidth) {
            lines.push(current);
            current = char;
          } else current += char;
        }
      }
      if (current) lines.push(current);
    }
    return lines;
  }
  function newPage() {
    page = pdf.addPage([width, height]);
    page.drawRectangle({ x: 0, y: height - 8, width, height: 8, color: ink });
    page.drawRectangle({
      x: margin,
      y: height - 64,
      width: 6,
      height: 25,
      color: accent,
    });
    page.drawText("SmartFach", {
      x: margin + 16,
      y: height - 56,
      font,
      size: 19,
      color: ink,
    });
    page.drawText(doc.kind === "quote" ? "WYCENA" : "PROTOKÓŁ WIZYTY", {
      x: width - margin - 145,
      y: height - 54,
      font,
      size: 11,
      color: muted,
    });
    y = height - 96;
  }
  function ensure(space: number) {
    if (y - space < 65) {
      newPage();
      return true;
    }
    return false;
  }
  function text(text: string, size = 10, color = ink, maxWidth = usable) {
    for (const row of wrap(text, size, maxWidth)) {
      ensure(size * 1.5);
      if (row)
        page.drawText(row, { x: margin, y: y - size, font, size, color });
      y -= size * 1.5;
    }
  }
  function section(title: string, content: string) {
    if (!content.trim()) return;
    ensure(62);
    y -= 12;
    text(title, 11, ink);
    y -= 5;
    text(content, 10, muted);
    y -= 7;
  }
  newPage();
  text(company.name || "Dane firmy nie zostały uzupełnione", 12);
  const details = [
    company.address,
    company.taxId ? "NIP: " + company.taxId : "",
    [company.phone, company.email].filter(Boolean).join(" | "),
  ].filter(Boolean);
  for (const detail of details) text(detail, 9, muted);
  y -= 20;
  text(documentTitle(doc), 19);
  y -= 10;
  text("Klient: " + documentClient(doc), 11);
  text(
    "Data dokumentu: " +
      new Date(doc.updatedAt).toLocaleDateString("pl-PL") +
      "  |  Nr roboczy: " +
      doc.id.slice(0, 8).toUpperCase(),
    9,
    muted,
  );
  y -= 20;
  if (doc.kind === "quote") {
    const quote = validateDraft(doc.draft).quote;
    if (!quote)
      throw new Error("Nie można wygenerować PDF z nieprawidłowej wyceny.");
    const positions = [margin, margin + 226, margin + 305, margin + 406],
      columnWidths = [214, 67, 89, usable - 406];
    const tableHead = () => {
      ensure(35);
      page.drawRectangle({
        x: margin,
        y: y - 26,
        width: usable,
        height: 26,
        color: rgb(0.94, 0.96, 0.95),
      });
      ["Pozycja", "Ilość", "Cena netto", "Wartość netto"].forEach((label, i) =>
        page.drawText(label, {
          x: positions[i]! + 6,
          y: y - 17,
          font,
          size: 8,
          color: muted,
        }),
      );
      y -= 34;
    };
    tableHead();
    quote.lines.forEach((item, index) => {
      const original = doc.draft.lines[index]!;
      const cells = [
        item.label,
        original.quantity + " " + original.unit,
        formatPln(item.unitNetCents),
        formatPln(item.netCents),
      ];
      const wrapped = cells.map((value, i) =>
        wrap(value, 9, columnWidths[i]! - 6),
      );
      const rowHeight =
        Math.max(...wrapped.map((rows) => rows.length)) * 14 + 19;
      if (ensure(rowHeight)) tableHead();
      wrapped.forEach((rows, i) =>
        rows.forEach((row, j) =>
          page.drawText(row, {
            x: positions[i]! + 6,
            y: y - 10 - j * 14,
            font,
            size: 9,
            color: ink,
          }),
        ),
      );
      y -= rowHeight;
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.6,
        color: line,
      });
      y -= 8;
    });
    ensure(132);
    y -= 9;
    text("Razem netto: " + formatPln(quote.netCents), 11);
    text(
      "VAT (" +
        doc.draft.vatBasisPoints / 100 +
        "%): " +
        formatPln(quote.vatCents),
      11,
    );
    y -= 8;
    page.drawRectangle({
      x: margin,
      y: y - 44,
      width: usable,
      height: 44,
      color: rgb(0.94, 0.96, 0.95),
    });
    page.drawText("Razem brutto: " + formatPln(quote.grossCents), {
      x: margin + 14,
      y: y - 29,
      font,
      size: 17,
      color: ink,
    });
    y -= 64;
    text(
      "Ceny sprzedaży netto. Stawka VAT została wskazana przez użytkownika.",
      8,
      muted,
    );
  } else {
    text(
      "Data wizyty: " + doc.report.date.split("-").reverse().join("."),
      10,
      muted,
    );
    section("WYKONANE CZYNNOŚCI", doc.report.work);
    section("POMIARY I WYNIKI", doc.report.measurements);
    section("ZALECENIA", doc.report.recommendations);
    y -= 14;
    text(
      "Dokument opisuje informacje wprowadzone przez wykonawcę. Nie zastępuje wymaganego odbioru, pomiarów ani podpisu.",
      8,
      muted,
    );
  }
  pdf.getPages().forEach((page, index) => {
    page.drawLine({
      start: { x: margin, y: 47 },
      end: { x: width - margin, y: 47 },
      thickness: 0.6,
      color: line,
    });
    page.drawText("SmartFach - dokument wymaga weryfikacji użytkownika", {
      x: margin,
      y: 31,
      font,
      size: 8,
      color: muted,
    });
    page.drawText(String(index + 1) + " / " + pdf.getPageCount(), {
      x: width - margin - 35,
      y: 31,
      font,
      size: 8,
      color: muted,
    });
  });
  pdf.setTitle(documentTitle(doc));
  pdf.setAuthor(company.name || "SmartFach");
  pdf.setCreator("SmartFach");
  return pdf.save();
}
