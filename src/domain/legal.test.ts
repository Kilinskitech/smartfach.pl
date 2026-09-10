import { describe, expect, it } from "vitest";
import { legalDocumentText, privacyDocument, purchaseConsentSchema, termsDocument } from "./legal";
import { legalDocumentVersion, operatorSchema, smartFachOperator } from "./operator";
import { creditPacks, matchesSubscriptionPrice, plans } from "./billing";

describe("warunki zakupu", () => {
  const consent = { termsAccepted: true, earlyServiceRequested: true, legalVersion: legalDocumentVersion };
  it("wymaga obu jawnych oświadczeń i aktualnej wersji", () => {
    expect(purchaseConsentSchema.safeParse(consent).success).toBe(true);
    for (const input of [{}, { ...consent, termsAccepted: false }, { ...consent, earlyServiceRequested: false }, { ...consent, legalVersion: "old" }])
      expect(purchaseConsentSchema.safeParse(input).success).toBe(false);
  });
  it("stosuje dane operatora w obu dokumentach bez zmiany starej kopii", () => {
    const old = legalDocumentText(termsDocument(smartFachOperator));
    const changed = { ...smartFachOperator, name: "Nowa nazwa testowa", email: "test@example.com", phone: "+48 123 456 789" };
    for (const document of [termsDocument(changed), privacyDocument(changed)]) {
      const text = legalDocumentText(document);
      expect(text).toContain(changed.name);
      expect(text).toContain(changed.email);
      expect(text).not.toContain(smartFachOperator.name);
    }
    expect(old).toContain(smartFachOperator.name);
  });
  it("dokumentuje aktualne ceny, limity i uprawnienia", () => {
    const text = legalDocumentText(termsDocument(smartFachOperator));
    for (const plan of Object.values(plans)) {
      expect(text).toContain(plan.price);
    }
    for (const pack of creditPacks) {
      expect(text).toContain(`+${pack.percentage}%`);
      expect(text).toContain(pack.price);
    }
    expect(text).not.toContain("jednostek rozliczeniowych");
    expect(text).toContain("14 dni");
    expect(text).toContain("https://smartfach.pl/odstapienie");
  });
  it("waliduje publiczne dane sprzedawcy", () => {
    expect(operatorSchema.safeParse(smartFachOperator).success).toBe(true);
    expect(operatorSchema.safeParse({ ...smartFachOperator, email: "błędny" }).success).toBe(false);
    expect(operatorSchema.safeParse({ ...smartFachOperator, taxId: "123" }).success).toBe(false);
  });
});

describe("cena Checkout zgodna z ofertą", () => {
  const price = { active: true, currency: "pln", unit_amount: 4900, recurring: { interval: "month", interval_count: 1 } };
  it("akceptuje wyłącznie właściwą miesięczną cenę planu", () => {
    expect(matchesSubscriptionPrice("lite", price)).toBe(true);
    expect(matchesSubscriptionPrice("pro", { ...price, unit_amount: 9900 })).toBe(true);
    for (const invalid of [{ ...price, active: false }, { ...price, currency: "usd" }, { ...price, unit_amount: 49 }, { ...price, unit_amount: 9900 }, { ...price, recurring: null }, { ...price, recurring: { interval: "year", interval_count: 1 } }, { ...price, recurring: { interval: "month", interval_count: 12 } }])
      expect(matchesSubscriptionPrice("lite", invalid)).toBe(false);
  });
});
