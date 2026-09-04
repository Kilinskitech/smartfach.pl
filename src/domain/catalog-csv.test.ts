import { describe, it, expect } from "vitest";
import { parseCatalogCsv } from "./catalog-csv";

describe("import własnego cennika CSV", () => {
  it("czyta BOM, polskie znaki, CRLF i przecinek dziesiętny", () => {
    expect(
      parseCatalogCsv(
        "\uFEFFnazwa;jednostka;cena_netto\r\nPrzegląd;usł.;430,50",
      ),
    ).toEqual([{ name: "Przegląd", unit: "usł.", price: "430,50" }]);
  });
  it("czyta cytowane separatory i cudzysłowy", () => {
    expect(
      parseCatalogCsv(
        'nazwa,jednostka,cena_netto\n"Montaż, model ""A""",szt.,100.25',
      )[0]?.name,
    ).toBe('Montaż, model "A"');
  });
  it("czyta tabelę oddzieloną tabulatorami i inną kolejność kolumn", () => {
    expect(
      parseCatalogCsv("cena netto\tjednostka\tnazwa\n150\tgodz.\tRobocizna")[0]
        ?.price,
    ).toBe("150");
  });
  it.each([
    "",
    "nazwa;jednostka;cena_netto",
    'nazwa;jednostka;cena_netto\n"Brak;szt.;1',
    'nazwa;jednostka;cena_netto\n"Błąd"tekst;szt.;1',
    "nazwa;jednostka;cena_netto\nBłąd;szt.;-10",
    "nazwa;jednostka;cena_netto\nBłąd;szt.;1,999",
    "nazwa;jednostka;cena_netto\nBłąd;kg;1",
    "nazwa;jednostka;cena_netto\nBłąd;szt.",
    "nazwa;jednostka;cena_netto\nSerwis;szt.;1\nserwis;szt.;2",
    "nazwa;nazwa;cena_netto\nSerwis;szt.;1",
  ])("odrzuca nieprawidłowy plik: %s", (input) =>
    expect(() => parseCatalogCsv(input)).toThrow(),
  );
  it("ogranicza wielkość importu", () =>
    expect(() => parseCatalogCsv("a".repeat(500_001))).toThrow());
});
