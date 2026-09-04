import {
  calculateQuote,
  parseMoneyCents,
  parseQuantityHundredths,
} from "./calculate";

export const vatRates = [2300, 800, 500, 0] as const;
export const quoteUnits = ["szt.", "godz.", "usł.", "m"] as const;

export type DraftLine = {
  id: string;
  label: string;
  unit: string;
  price: string;
  quantity: string;
  source: "command-demo" | "rate-demo" | "manual" | "catalog" | "user-input";
};

export type QuoteDraft = {
  client: string;
  clientId?: string;
  subject: string;
  vatBasisPoints: number;
  lines: DraftLine[];
};

export const exampleDraft: QuoteDraft = {
  client: "Jan Kowalski",
  subject: "Wymiana pompy obiegowej",
  vatBasisPoints: 2300,
  lines: [
    {
      id: "material",
      label: "Pompa obiegowa",
      unit: "szt.",
      price: "430,00",
      quantity: "1",
      source: "command-demo",
    },
    {
      id: "labor",
      label: "Robocizna",
      unit: "godz.",
      price: "150,00",
      quantity: "2",
      source: "rate-demo",
    },
    {
      id: "travel",
      label: "Dojazd",
      unit: "usł.",
      price: "70,00",
      quantity: "1",
      source: "rate-demo",
    },
  ],
};

export function validateDraft(draft: QuoteDraft) {
  const errors: Record<string, string> = {};
  if (!draft.client.trim() || draft.client.length > 160)
    errors.client = "Podaj klienta (maks. 160 znaków).";
  if (!draft.subject.trim() || draft.subject.length > 160)
    errors.subject = "Podaj opis wyceny (maks. 160 znaków).";
  if (!vatRates.some((rate) => rate === draft.vatBasisPoints))
    errors.vat = "Wybierz stawkę VAT z listy.";

  const inputs = draft.lines.map((line) => {
    let unitNetCents = 0;
    let quantityHundredths = 0;
    if (!line.label.trim() || line.label.length > 160)
      errors[`${line.id}-label`] = "Podaj nazwę pozycji (maks. 160 znaków).";
    if (!quoteUnits.some((unit) => unit === line.unit))
      errors[`${line.id}-unit`] = "Wybierz jednostkę z listy.";
    try {
      unitNetCents = parseMoneyCents(line.price);
    } catch {
      errors[`${line.id}-price`] =
        "Podaj cenę netto, np. 430,00. Maks. 2 miejsca po przecinku.";
    }
    try {
      quantityHundredths = parseQuantityHundredths(line.quantity);
    } catch {
      errors[`${line.id}-quantity`] =
        "Podaj ilość większą od zera. Maks. 2 miejsca po przecinku.";
    }
    return {
      id: line.id,
      label: line.label.trim(),
      unitNetCents,
      quantityHundredths,
      vatBasisPoints: draft.vatBasisPoints,
    };
  });

  // Nie podstawiamy zera za błędne pole ani nie zostawiamy nieaktualnej sumy.
  if (Object.keys(errors).length)
    return {
      quote: null,
      errors,
      generalError: "Popraw zaznaczone pola, aby przeliczyć wycenę.",
    };
  try {
    return { quote: calculateQuote(inputs), errors, generalError: null };
  } catch (error) {
    return {
      quote: null,
      errors,
      generalError:
        error instanceof Error ? error.message : "Nie można obliczyć wyceny.",
    };
  }
}
