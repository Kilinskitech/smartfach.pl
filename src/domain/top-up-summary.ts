import { creditAllowance, remainingCredits, remainingTopUpCredits, usageLimitView, type Billing } from "./billing";

export type TopUpPurchase = {
  checkoutSessionId: string;
  organizationId: string;
  packId: string;
  grantedCredits: number;
  amountGrosze: number;
  createdAt: string;
};

export function summarizeTopUps(purchases: TopUpPurchase[], billing: Billing) {
  // A successful Checkout can be observed by the webhook and return page.
  const unique = [...new Map(purchases.map(p => [p.checkoutSessionId, p])).values()];
  return {
    count: unique.length,
    grantedUsd: unique.reduce((sum, p) => sum + p.grantedCredits, 0) / 100,
    purchasedGrosze: unique.reduce((sum, p) => sum + p.amountGrosze, 0),
    remainingExtraUsd: remainingTopUpCredits(billing) / 100,
    totalAllowanceUsd: creditAllowance(billing) / 100,
    remainingAllowanceUsd: remainingCredits(billing) / 100,
    totalPercentage: usageLimitView(billing).totalPercentage,
  };
}
export type TopUpSummary = ReturnType<typeof summarizeTopUps>;
