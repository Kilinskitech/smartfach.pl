import { describe, expect, it } from "vitest";
import { exampleDraft, validateDraft, type QuoteDraft } from "./draft";

const freshDraft = (): QuoteDraft => structuredClone(exampleDraft);

describe("demonstracyjny szkic wyceny", () => {
  it("przelicza przykład bez AI", () => {
    const result = validateDraft(freshDraft());
    expect(result.errors).toEqual({});
    expect(result.generalError).toBeNull();
    expect(result.quote).toMatchObject({
      netCents: 80_000,
      vatCents: 18_400,
      grossCents: 98_400,
    });
  });

  it.each(["client", "subject"] as const)("wymaga pola %s", (field) => {
    const draft = freshDraft();
    draft[field] = "  ";
    const result = validateDraft(draft);
    expect(result.quote).toBeNull();
    expect(result.errors[field]).toBeTruthy();
  });

  it.each(["client", "subject"] as const)(
    "ogranicza długość pola %s",
    (field) => {
      const draft = freshDraft();
      draft[field] = "x".repeat(161);
      expect(validateDraft(draft).errors[field]).toBeTruthy();
    },
  );

  it.each([
    ["price", ""],
    ["price", "1,234"],
    ["price", "-5"],
    ["quantity", "0"],
    ["quantity", ""],
    ["quantity", "2 godziny"],
    ["label", " "],
    ["label", "x".repeat(161)],
    ["unit", "??"],
  ] as const)("błędne pole %s (%s) blokuje sumę", (field, value) => {
    const draft = freshDraft();
    draft.lines[0]![field] = value;
    const result = validateDraft(draft);
    expect(result.quote).toBeNull();
    expect(result.errors[`material-${field}`]).toBeTruthy();
    expect(result.generalError).toBeTruthy();
  });

  it("pokazuje jednocześnie błędy ceny i ilości", () => {
    const draft = freshDraft();
    draft.lines[0]!.price = "";
    draft.lines[1]!.quantity = "0";
    expect(Object.keys(validateDraft(draft).errors)).toEqual([
      "material-price",
      "labor-quantity",
    ]);
  });

  it("odrzuca VAT spoza listy demo", () => {
    const draft = freshDraft();
    draft.vatBasisPoints = 900;
    expect(validateDraft(draft).errors.vat).toBeTruthy();
  });

  it("przelicza zmianę ceny i stawki VAT", () => {
    const draft = freshDraft();
    draft.lines[0]!.price = "500,00";
    draft.vatBasisPoints = 800;
    expect(validateDraft(draft).quote?.grossCents).toBe(93_960);
  });

  it("uwzględnia dodatkową pozycję w sumie", () => {
    const draft = freshDraft();
    draft.lines.push({
      id: "extra",
      label: "Materiał demo",
      unit: "m",
      price: "10,50",
      quantity: "2",
      source: "manual",
    });
    expect(validateDraft(draft).quote?.grossCents).toBe(100_983);
  });

  it("przelicza usunięcie pozycji", () => {
    const draft = freshDraft();
    draft.lines = draft.lines.filter((line) => line.id !== "travel");
    expect(validateDraft(draft).quote?.grossCents).toBe(89_790);
  });

  it("odrzuca pustą listę", () => {
    const draft = freshDraft();
    draft.lines = [];
    expect(validateDraft(draft).quote).toBeNull();
  });

  it("odrzuca powtórzony identyfikator", () => {
    const draft = freshDraft();
    draft.lines[1]!.id = "material";
    expect(validateDraft(draft).quote).toBeNull();
  });

  it("odrzuca sumę przekraczającą bezpieczny zakres", () => {
    const draft = freshDraft();
    draft.lines[0]!.price = "9999999999999";
    draft.lines[0]!.quantity = "999";
    expect(validateDraft(draft).quote).toBeNull();
  });

  it("nie zmienia przekazanego szkicu", () => {
    const draft = freshDraft();
    draft.lines[0]!.label = "  Pompa  ";
    const before = structuredClone(draft);
    expect(validateDraft(draft).quote?.lines[0]?.label).toBe("Pompa");
    expect(draft).toEqual(before);
  });
});
