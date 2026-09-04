import { priceSchema, type PriceItem } from "./workspace";

export function parseCatalogCsv(input: string): Omit<PriceItem, "id">[] {
  if (input.length > 500_000)
    throw new Error("Plik jest za duży. Maksymalnie 500 KB.");
  const source = input.replace(/^\uFEFF/, "").trim();
  if (!source) throw new Error("Wybierz plik CSV lub wklej tabelę.");
  const first = source.split(/\r?\n/)[0] ?? "";
  const delimiter = first.includes(";")
    ? ";"
    : first.includes("\t")
      ? "\t"
      : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  let closedQuote = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"') {
        if (source[i + 1] === '"') {
          value += '"';
          i++;
        } else {
          quoted = false;
          closedQuote = true;
        }
      } else value += ch;
    } else if (ch === '"') {
      if (value.trim() || closedQuote)
        throw new Error("Niepoprawny cudzysłów w CSV.");
      quoted = true;
      value = "";
    } else if (ch === delimiter) {
      row.push(value.trim());
      value = "";
      closedQuote = false;
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && source[i + 1] === "\n") i++;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
      closedQuote = false;
    } else {
      if (closedQuote && ch?.trim())
        throw new Error("Niepoprawny zapis pola w CSV.");
      value += ch;
    }
  }
  if (quoted) throw new Error("Brakuje zamykającego cudzysłowu w CSV.");
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  const header =
    rows
      .shift()
      ?.map((value) => value.toLocaleLowerCase("pl").replace(/\s+/g, "_")) ??
    [];
  const name = header.indexOf("nazwa"),
    unit = header.indexOf("jednostka"),
    price = header.indexOf("cena_netto");
  if (
    name < 0 ||
    unit < 0 ||
    price < 0 ||
    new Set(header).size !== header.length
  )
    throw new Error(
      "Potrzebne są unikalne kolumny: nazwa, jednostka, cena_netto.",
    );
  if (!rows.length || rows.length > 500)
    throw new Error("Import musi zawierać od 1 do 500 pozycji.");
  const seen = new Set<string>();
  return rows.map((row, index) => {
    if (row.length !== header.length)
      throw new Error(
        "Wiersz " +
          (index + 2) +
          ": liczba kolumn nie zgadza się z nagłówkiem.",
      );
    const parsed = priceSchema.safeParse({
      id: "import",
      name: row[name],
      unit: row[unit],
      price: row[price],
    });
    if (!parsed.success)
      throw new Error(
        "Wiersz " +
          (index + 2) +
          ": sprawdź nazwę, jednostkę i cenę netto. Jednostki: szt., godz., usł., m.",
      );
    const key = catalogKey(parsed.data);
    if (seen.has(key))
      throw new Error(
        "Wiersz " +
          (index + 2) +
          ": powtórzona nazwa i jednostka. Rozstrzygnij duplikat przed importem.",
      );
    seen.add(key);
    return {
      name: parsed.data.name,
      unit: parsed.data.unit,
      price: parsed.data.price,
    };
  });
}
export const catalogKey = (item: Pick<PriceItem, "name" | "unit">) =>
  item.name.trim().toLocaleLowerCase("pl") + "|" + item.unit;
