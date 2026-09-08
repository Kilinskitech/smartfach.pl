import { z } from "zod";

export const planIdSchema = z.enum(["lite", "pro"]);
export type PlanId = z.infer<typeof planIdSchema>;

export const publicPlanIdSchema = planIdSchema;
export type PublicPlanId = PlanId;
export const publicPlanIds = publicPlanIdSchema.options;

export function normalizePublicPlan(
  requestedPlan: PublicPlanId | undefined,
): PublicPlanId {
  return requestedPlan ?? "pro";
}

export const trialPolicy = {
  durationDays: 3,
  paymentMethodRequired: true,
  convertsToPaidAutomatically: true,
} as const;

export type EmailConfirmationHoldAction = "apply" | "release" | null;

export function emailConfirmationHoldAction(input: {
  subscriptionStatus: string;
  emailConfirmed: boolean;
  managedHold: boolean;
  cancelAtPeriodEnd: boolean;
}): EmailConfirmationHoldAction {
  if (input.subscriptionStatus !== "trialing") return null;
  if (!input.emailConfirmed)
    return input.managedHold && input.cancelAtPeriodEnd ? null : "apply";
  return input.managedHold ? "release" : null;
}

export const plans = {
  lite: {
    name: "Lite",
    price: "49 zł",
    monthlyPriceGrosze: 4900,
    monthlyCredits: 225,
    description: "Spokojny start i najważniejsze działania w miesiącu.",
  },
  pro: {
    name: "Pro",
    price: "99 zł",
    monthlyPriceGrosze: 9900,
    monthlyCredits: 550,
    description: "Regularne budowanie oferty, sprzedaży i przychodu.",
  },
} as const satisfies Record<
  PlanId,
  {
    name: string;
    price: string;
    monthlyPriceGrosze: number;
    monthlyCredits: number;
    description: string;
  }
>;

export const creditPacks = [
  {
    id: "mini",
    percentage: 25,
    price: "19,99 zł",
    unitAmountGrosze: 1_999,
  },
  {
    id: "plus",
    percentage: 50,
    price: "29,99 zł",
    unitAmountGrosze: 2_999,
  },
  {
    id: "max",
    percentage: 100,
    price: "59,99 zł",
    unitAmountGrosze: 5_999,
  },
] as const;

// Stripe wymaga automatycznej aktualizacji nazwy, gdy Checkout zbiera NIP
// dla klienta utworzonego wcześniej przy subskrypcji.
export const stripeExistingCustomerUpdate = { name: "auto" } as const;

export function matchesSubscriptionPrice(plan: PlanId, price: {
  active: boolean; currency: string; unit_amount: number | null;
  recurring?: { interval: string; interval_count: number } | null;
}) {
  return price.active && price.currency === "pln" && price.unit_amount === plans[plan].monthlyPriceGrosze
    && price.recurring?.interval === "month" && price.recurring.interval_count === 1;
}

export const creditPackIdSchema = z.enum(["mini", "plus", "max"]);
export type CreditPackId = z.infer<typeof creditPackIdSchema>;

export function creditPackById(id: CreditPackId) {
  return creditPacks.find((pack) => pack.id === id)!;
}

export function topUpCreditsForPlan(id: CreditPackId, plan: PlanId) {
  const pack = creditPackById(id);
  return Math.ceil((plans[plan].monthlyCredits * pack.percentage) / 100);
}

export const billingSchema = z.object({
  plan: planIdSchema,
  usedCredits: z.number().int().nonnegative(),
  topUpCredits: z.number().int().nonnegative(),
  periodStartedAt: z.string().datetime(),
});

export type Billing = z.infer<typeof billingSchema>;

export function creditAllowance(billing: Billing) {
  return plans[billing.plan].monthlyCredits + billing.topUpCredits;
}

export function remainingCredits(billing: Billing) {
  return Math.max(0, creditAllowance(billing) - billing.usedCredits);
}

export function monthlyUsagePercentage(billing: Billing) {
  return Math.min(
    100,
    Math.max(
      0,
      Math.ceil((billing.usedCredits / plans[billing.plan].monthlyCredits) * 100),
    ),
  );
}

export function remainingTopUpCredits(billing: Billing) {
  const monthlyCredits = plans[billing.plan].monthlyCredits;
  const usedTopUpCredits = Math.max(0, billing.usedCredits - monthlyCredits);
  return Math.max(0, billing.topUpCredits - usedTopUpCredits);
}

export function remainingTopUpPercentage(billing: Billing) {
  return Math.max(
    0,
    Math.ceil(
      (remainingTopUpCredits(billing) / plans[billing.plan].monthlyCredits) *
        100,
    ),
  );
}

export function rollBillingPeriod(billing: Billing, periodStartedAt: string) {
  if (billing.periodStartedAt === periodStartedAt) return billing;
  return {
    ...billing,
    usedCredits: 0,
    topUpCredits: remainingTopUpCredits(billing),
    periodStartedAt,
  };
}

export function estimateRequestCredits(
  attachments: ReadonlyArray<{ kind: "image" }> = [],
) {
  return 1 + attachments.length * 2;
}

export function settleRequestCredits(
  attachments: ReadonlyArray<{ kind: "image" }> = [],
  usedWebSearch = false,
  measuredCostUsd?: number,
) {
  if (
    typeof measuredCostUsd === "number" &&
    Number.isFinite(measuredCostUsd) &&
    measuredCostUsd >= 0
  )
    return Math.max(1, Math.ceil(measuredCostUsd * 100));
  return estimateRequestCredits(attachments) + (usedWebSearch ? 2 : 0);
}
