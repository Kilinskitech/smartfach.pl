import { describe, expect, it } from "vitest";
import {
  calculateQuote,
  formatPln,
  parseMoneyCents,
  parseQuantityHundredths,
  type QuoteLineInput,
} from "./calculate";

const item: QuoteLineInput = {
  id: "material",
  label: "Materiał demo",
  unitNetCents: 43_000,
  quantityHundredths: 100,
  vatBasisPoints: 2300,
};

describe("Jawne odczytywanie cen i ilości", () => {
  it.each([
    ["430", 43000],
    ["430,50", 43050],
    ["430.5", 43050],
    [" 0,01 ", 1],
    ["0", 0],
    ["001,20", 120],
  ])("odczytuje %s bez arytmetyki zmiennoprzecinkowej", (raw, expected) => {
    expect(parseMoneyCents(raw)).toBe(expected);
  });

  it.each([
    "",
    " ",
    "-1",
    "NaN",
    "Infinity",
    "1e3",
    "1,234",
    "1.234",
    "1 200",
    "1,2.3",
    "1,",
    ".5",
    "90071992547409,92",
  ])("odrzuca brakującą lub niejednoznaczną wartość %s", (value) => {
    expect(() => parseMoneyCents(value)).toThrow();
  });

  it("nie zastępuje braku ceny zerem", () => {
    expect(() => parseMoneyCents("")).toThrow();
    expect(parseMoneyCents("0")).toBe(0);
  });

  it("wymaga dodatniej ilości i akceptuje ćwierć godziny", () => {
    expect(() => parseQuantityHundredths("0")).toThrow();
    expect(parseQuantityHundredths("0,25")).toBe(25);
  });
});

describe("Obliczenia wyceny demonstracyjnej", () => {
  it("liczy materiał, dwie godziny i dojazd", () => {
    const result = calculateQuote([
      item,
      { ...item, id: "labor", unitNetCents: 15_000, quantityHundredths: 200 },
      { ...item, id: "travel", unitNetCents: 7_000 },
    ]);
    expect(result).toMatchObject({
      currency: "PLN",
      netCents: 80_000,
      vatCents: 18_400,
      grossCents: 98_400,
    });
  });

  it("zaokrągla pół grosza w górę na pozycji", () => {
    const result = calculateQuote([
      { ...item, unitNetCents: 101, quantityHundredths: 50, vatBasisPoints: 0 },
    ]);
    expect(result.netCents).toBe(51);
  });

  it("zaokrągla VAT na pozycjach, nie dopiero na całym dokumencie", () => {
    const tiny = { ...item, unitNetCents: 10, vatBasisPoints: 500 };
    expect(calculateQuote([tiny, { ...tiny, id: "other" }])).toMatchObject({
      netCents: 20,
      vatCents: 2,
      grossCents: 22,
    });
  });

  it("obsługuje różne jawnie podane stawki VAT", () => {
    const result = calculateQuote([
      { ...item, unitNetCents: 10_000, vatBasisPoints: 800 },
      { ...item, id: "zero", unitNetCents: 5000, vatBasisPoints: 0 },
    ]);
    expect(result).toMatchObject({
      netCents: 15000,
      vatCents: 800,
      grossCents: 15800,
    });
  });

  it("dopuszcza świadomie podaną cenę zero", () => {
    expect(calculateQuote([{ ...item, unitNetCents: 0 }]).grossCents).toBe(0);
  });

  it("nie zmienia danych wejściowych", () => {
    const frozen = Object.freeze({ ...item });
    calculateQuote(Object.freeze([frozen]));
    expect(frozen).toEqual(item);
  });

  it.each([
    { unitNetCents: -1 },
    { unitNetCents: 1.5 },
    { unitNetCents: Number.NaN },
    { unitNetCents: Number.POSITIVE_INFINITY },
    { quantityHundredths: 0 },
    { quantityHundredths: -100 },
    { quantityHundredths: 1.2 },
    { vatBasisPoints: -1 },
    { vatBasisPoints: 10_001 },
    { vatBasisPoints: 23.5 },
    { id: "" },
    { label: " " },
  ])("odrzuca nieprawidłowe dane %j", (override) => {
    expect(() => calculateQuote([{ ...item, ...override }])).toThrow();
  });

  it("wymaga niepustej wyceny i unikalnych pozycji", () => {
    expect(() => calculateQuote([])).toThrow();
    expect(() => calculateQuote([item, item])).toThrow();
  });

  it("odrzuca przepełnienie iloczynu, podatku i sumy", () => {
    const large = {
      ...item,
      unitNetCents: Number.MAX_SAFE_INTEGER,
      vatBasisPoints: 0,
    };
    expect(() =>
      calculateQuote([{ ...large, quantityHundredths: 200 }]),
    ).toThrow();
    expect(() =>
      calculateQuote([{ ...large, vatBasisPoints: 2300 }]),
    ).toThrow();
    expect(() => calculateQuote([large, { ...large, id: "other" }])).toThrow();
  });

  it("brutto jest sumą netto i podatku dla każdej pozycji i całej wyceny", () => {
    const result = calculateQuote(
      Array.from({ length: 50 }, (_, i) => ({
        ...item,
        id: String(i),
        unitNetCents: i * 137 + 1,
        quantityHundredths: i + 1,
        vatBasisPoints: i % 2 === 0 ? 2300 : 800,
      })),
    );
    for (const line of result.lines)
      expect(line.grossCents).toBe(line.netCents + line.vatCents);
    expect(result.grossCents).toBe(result.netCents + result.vatCents);
  });
});

describe("Wyświetlanie kwot", () => {
  it.each([
    [0, "0,00 zł"],
    [1, "0,01 zł"],
    [98400, "984,00 zł"],
  ])("formatuje %i groszy", (value, expected) => {
    expect(formatPln(value)).toBe(expected);
  });
  it("nie traci groszy na granicy bezpiecznych liczb", () => {
    expect(formatPln(Number.MAX_SAFE_INTEGER).replace(/\s/g, "")).toBe(
      "90071992547409,91zł",
    );
  });
});
