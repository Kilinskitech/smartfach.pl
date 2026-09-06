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
    monthlyCredits: 150,
    description: "Spokojny start i najważniejsze działania w miesiącu.",
  },
  pro: {
    name: "Pro",
    price: "99 zł",
    monthlyCredits: 500,
    description: "Regularne budowanie oferty, sprzedaży i przychodu.",
  },
} as const satisfies Record<
  PlanId,
  {
    name: string;
    price: string;
    monthlyCredits: number;
    description: string;
  }
>;

export const creditPacks = [
  { id: "mini", credits: 100, price: "19,99 zł" },
  { id: "plus", credits: 300, price: "49,99 zł" },
  { id: "max", credits: 1_000, price: "129,99 zł" },
] as const;

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

export function estimateRequestCredits(
  attachments: ReadonlyArray<{ kind: "image" | "audio" }> = [],
) {
  return attachments.reduce(
    (total, attachment) => total + (attachment.kind === "image" ? 2 : 4),
    1,
  );
}

export function settleRequestCredits(
  attachments: ReadonlyArray<{ kind: "image" | "audio" }> = [],
  usedWebSearch = false,
) {
  return estimateRequestCredits(attachments) + (usedWebSearch ? 2 : 0);
}
