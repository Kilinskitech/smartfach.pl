import { describe, expect, it } from "vitest";
import { summarizeTopUps, type TopUpPurchase } from "./top-up-summary";
const billing = { plan: "pro" as const, usedCredits: 600, topUpCredits: 150, periodStartedAt: "2026-09-01T00:00:00.000Z" };
const purchase: TopUpPurchase = { checkoutSessionId: "cs_test_one", organizationId: "org", packId: "mini", grantedCredits: 150, amountGrosze: 1999, createdAt: "2026-09-01T00:00:00Z" };
describe("historia zwiększeń w panelu administratora", () => {
  it("oddziela sumę zakupów, saldo zakupów i łączny dostępny limit", () => {
    expect(summarizeTopUps([purchase, purchase], billing)).toEqual({ count: 1, grantedUsd: 1.5, purchasedGrosze: 1999, remainingExtraUsd: 1, totalAllowanceUsd: 7, remainingAllowanceUsd: 1, totalPercentage: 127 });
  });
  it("liczy historyczne wartości z księgi, nie według dzisiejszych cen pakietów", () => {
    const historical = { ...purchase, checkoutSessionId: "cs_test_two", grantedCredits: 400, amountGrosze: 4999 };
    expect(summarizeTopUps([purchase, historical], billing)).toMatchObject({ count: 2, grantedUsd: 5.5, purchasedGrosze: 6998 });
  });
  it("pokazuje zero zakupów bez wymyślania ich na podstawie obecnego salda", () => {
    expect(summarizeTopUps([], billing)).toMatchObject({ count: 0, grantedUsd: 0, remainingExtraUsd: 1 });
  });
});
