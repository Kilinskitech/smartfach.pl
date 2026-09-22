import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

vi.mock("./marketing", () => ({ MarketingHeader: () => null, MarketingFooter: () => null }));
vi.mock("./contact-form", () => ({ ContactForm: () => null }));
vi.mock("@/server/operator-settings", () => ({
  getOperator: async () => ({
    name: "Operator testowy", address: "Testowa 1, 00-001 Warszawa",
    taxId: "1234567890", regon: "123456789",
    email: "contact@example.test", phone: "+48 123 456 789",
  }),
}));
import { ContactPage, PrivacyPage, TermsPage } from "./public-pages";

it.each([
  ["kontakt", ContactPage], ["regulamin", TermsPage], ["prywatność", PrivacyPage],
] as const)("%s: publikuje e-mail, ale nie telefon z ustawień", async (_name, page) => {
  const html = renderToStaticMarkup(await page());
  expect(html).toContain("contact@example.test");
  expect(html).not.toContain("123 456 789");
  expect(html).not.toContain("48123456789");
  expect(html).not.toContain('href="tel:');
});
