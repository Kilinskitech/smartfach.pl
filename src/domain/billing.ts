import { z } from "zod";

export const planIdSchema = z.enum(["lite", "pro", "firma"]);
export type PlanId = z.infer<typeof planIdSchema>;

export const trialPolicy = {
  durationDays: 3,
  paymentMethodRequired: true,
  convertsToPaidAutomatically: true,
} as const;

export const plans = {
  lite: {
    name: "Lite",
    price: "49 zł",
    monthlyCredits: 150,
    description: "Dla jednej osoby, która chce zacząć i działać regularnie.",
  },
  pro: {
    name: "Pro",
    price: "99 zł",
    monthlyCredits: 500,
    description: "Dla osoby intensywnie rozwijającej lub prowadzącej biznes.",
  },
  firma: {
    name: "Firma",
    price: "299 zł",
    monthlyCredits: 1_600,
    description: "Wspólna pula dla właściciela i pierwszych trzech członków.",
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
