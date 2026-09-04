/**
 * Demonstrator: ceny sprzedaży netto, ilości z dokładnością 0,01 i jawny VAT.
 * Zaokrąglenie połowy w górę osobno dla wartości netto i VAT każdej pozycji.
 * Nie wybiera stawki VAT, nie oblicza marży/rabatów i nie zna polityki firmy.
 */
export type QuoteLineInput = {
  id: string;
  label: string;
  unitNetCents: number;
  quantityHundredths: number;
  vatBasisPoints: number;
};

export type CalculatedLine = QuoteLineInput & {
  netCents: number;
  vatCents: number;
  grossCents: number;
};

export type CalculatedQuote = {
  currency: "PLN";
  lines: CalculatedLine[];
  netCents: number;
  vatCents: number;
  grossCents: number;
};

function safeInteger(value: number, label: string, minimum = 0): void {
  if (!Number.isSafeInteger(value) || value < minimum) {
    throw new Error(
      `${label}: wymagana nieujemna liczba całkowita w dozwolonym zakresie.`,
    );
  }
}

function toSafeNumber(value: bigint): number {
  if (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Wartość przekracza obsługiwany zakres obliczeń.");
  }
  return Number(value);
}

function roundHalfUp(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

function parseHundredths(value: string): number {
  const normalized = value.trim();
  // Bez wykładników, separatorów tysięcy ani cichego obcinania trzeciej cyfry.
  if (!/^\d{1,14}([,.]\d{1,2})?$/.test(normalized)) {
    throw new Error("Wpisz liczbę z maksymalnie 2 cyframi po przecinku.");
  }
  const [whole = "0", fraction = ""] = normalized.replace(",", ".").split(".");
  return toSafeNumber(BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0")));
}

export function parseMoneyCents(value: string): number {
  return parseHundredths(value);
}

export function parseQuantityHundredths(value: string): number {
  const quantity = parseHundredths(value);
  if (quantity === 0) throw new Error("Ilość musi być większa od zera.");
  return quantity;
}

export function formatPln(cents: number): string {
  safeInteger(cents, "Kwota");
  const integer = BigInt(cents);
  const whole = new Intl.NumberFormat("pl-PL").format(integer / 100n);
  const fraction = String(integer % 100n).padStart(2, "0");
  return `${whole},${fraction} zł`;
}

export function calculateQuote(
  inputs: readonly QuoteLineInput[],
): CalculatedQuote {
  if (inputs.length === 0) throw new Error("Dodaj co najmniej jedną pozycję.");
  const ids = new Set<string>();

  const lines = inputs.map((input): CalculatedLine => {
    if (!input.id.trim() || !input.label.trim() || ids.has(input.id)) {
      throw new Error("Pozycja wymaga nazwy i unikalnego identyfikatora.");
    }
    ids.add(input.id);
    safeInteger(input.unitNetCents, "Cena");
    safeInteger(input.quantityHundredths, "Ilość", 1);
    safeInteger(input.vatBasisPoints, "VAT");
    if (input.vatBasisPoints > 10_000)
      throw new Error("VAT poza obsługiwanym zakresem.");

    const net = roundHalfUp(
      BigInt(input.unitNetCents) * BigInt(input.quantityHundredths),
      100n,
    );
    const vat = roundHalfUp(net * BigInt(input.vatBasisPoints), 10_000n);
    return {
      ...input,
      netCents: toSafeNumber(net),
      vatCents: toSafeNumber(vat),
      grossCents: toSafeNumber(net + vat),
    };
  });

  const sum = (field: "netCents" | "vatCents" | "grossCents") =>
    toSafeNumber(
      lines.reduce((total, line) => total + BigInt(line[field]), 0n),
    );

  return {
    currency: "PLN",
    lines,
    netCents: sum("netCents"),
    vatCents: sum("vatCents"),
    grossCents: sum("grossCents"),
  };
}
