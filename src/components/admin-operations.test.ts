import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
vi.mock("@/app/admin/actions", () => ({ releaseAiReservation: vi.fn(), resolveWithdrawal: vi.fn(), testSmtpConnection: vi.fn() }));
import { AdminOperations, type OperationalSummary } from "./admin-operations";
import { AdminLegal } from "./admin-legal";

const render = (summary: OperationalSummary) => renderToStaticMarkup(createElement(AdminOperations, { summary }));

describe("panel aktywacji i niezawodności", () => {
  it("pokazuje pusty stan bez sugerowania potwierdzonej sprawności całego systemu", () => {
    const html = render({ milestones: {}, pendingWebhooks: 0, uncertain: [] });
    expect(html).toContain("Brak zaległych spraw");
    expect(html.match(/<dd>0<\/dd>/g)).toHaveLength(9);
    expect(html).toContain("nie lejek konwersji");
    expect(html).not.toContain("Zwolnij rezerwację");
    expect(html).not.toContain("Wszystko działa");
  });
  it("pokazuje liczby etapów i ostrzeżenie dla zaległych webhooków", () => {
    const html = render({ milestones: { registered: 12, first_answer: 4 }, pendingWebhooks: 2, uncertain: [] });
    expect(html).toContain("<dd>12</dd>");
    expect(html).toContain("<dd>4</dd>");
    expect(html).toContain("Wymaga uwagi");
    expect(html).toContain("ponów dostarczenie w Stripe");
    expect(html).toContain("niezależnie od daty");
  });
  it("pozostawia świadome potwierdzenie zwolnienia rezerwacji", () => {
    const html = render({ milestones: {}, pendingWebhooks: 0, uncertain: [{ organization_id: "org", user_id: "user", request_key: "request", reserved_credits: 5, created_at: "2026-09-09T00:00:00Z" }] });
    expect(html).toContain("0.05 USD");
    expect(html).toContain('href="/admin/uzytkownicy/user"');
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("Sprawdziłem logi dostawcy");
    expect(html).toContain("Zwolnij rezerwację");
  });
  it("obsługa umów używa aktualnego maila i nie udaje automatycznego zwrotu", () => {
    const html = renderToStaticMarkup(createElement(AdminLegal, { withdrawals: [], smtpReady: true, contactEmail: "help@example.com" }));
    expect(html).toContain('href="mailto:help@example.com"');
    expect(html).toContain("nie zwraca pieniędzy automatycznie");
    expect(html).toContain("e-mailem nie pojawiają się na tej liście");
    expect(html).toContain("Brak oczekujących zgłoszeń z formularza");
  });
});
