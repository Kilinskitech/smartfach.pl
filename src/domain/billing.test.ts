import { describe, expect, it } from "vitest";
import {
  creditAllowance,
  creditPackById,
  emailConfirmationHoldAction,
  hasSubscriptionAccess,
  estimateRequestCredits,
  normalizePublicPlan,
  publicPlanIdSchema,
  publicPlanIds,
  remainingCredits,
  remainingTopUpCredits,
  remainingTopUpPercentage,
  rollBillingPeriod,
  settleRequestCredits,
  trialPolicy,
  monthlyUsagePercentage,
  stripeExistingCustomerUpdate,
  topUpCreditsForPlan,
  trialCancellationRequestedAt,
  usageLimitView,
} from "./billing";

const billing = {
  plan: "lite" as const,
  usedCredits: 40,
  topUpCredits: 20,
  periodStartedAt: "2026-09-01T00:00:00.000Z",
};

describe("kredyty SmartFach", () => {
  it("pokazuje jedną pulę 125% zamiast osobnego zapasu", () => {
    const b = { ...billing, plan: "pro" as const, usedCredits: 550, topUpCredits: topUpCreditsForPlan("mini", "pro") };
    expect(usageLimitView(b)).toMatchObject({ totalPercentage: 125, usedPercentage: 100, remainingPercentage: 25 });
    expect(usageLimitView(b).progressPercentage).toBeCloseTo(79.94, 1);
    expect(usageLimitView({ ...b, usedCredits: 605 })).toMatchObject({ totalPercentage: 125, usedPercentage: 110, remainingPercentage: 15 });
    expect(usageLimitView({ ...b, usedCredits: 900 })).toMatchObject({ usedPercentage: 125, remainingPercentage: 0, progressPercentage: 100 });
  });
  it("przenosi tylko niewykorzystany dodatek przez kolejne miesiące", () => {
    const b = { ...billing, plan: "pro" as const, usedCredits: 605, topUpCredits: topUpCreditsForPlan("mini", "pro") };
    const next = rollBillingPeriod(b, "2026-10-01T00:00:00.000Z");
    expect(next.topUpCredits).toBe(83);
    expect(usageLimitView(next)).toMatchObject({ totalPercentage: 115, usedPercentage: 0 });
    expect(rollBillingPeriod(next, next.periodStartedAt)).toEqual(next);
    expect(rollBillingPeriod(next, "2026-11-01T00:00:00.000Z").topUpCredits).toBe(83);
    expect(rollBillingPeriod({ ...next, usedCredits: 633 }, "2026-11-01T00:00:00.000Z").topUpCredits).toBe(0);
  });
  it("sumuje wiele zakupów i przelicza procent po zmianie planu bez mnożenia wartości", () => {
    const b = { ...billing, plan: "pro" as const, usedCredits: 0, topUpCredits: topUpCreditsForPlan("plus", "pro") * 2 };
    expect(usageLimitView(b).totalPercentage).toBe(200);
    expect(remainingTopUpCredits({ ...b, plan: "lite" })).toBe(550);
    expect(usageLimitView({ ...b, plan: "lite" }).totalPercentage).toBe(344);
  });
  it("definiuje trzydniowy trial z kartą i automatycznym przejściem na plan", () => {
    expect(trialPolicy).toEqual({
      durationDays: 3,
      paymentMethodRequired: true,
      convertsToPaidAutomatically: true,
    });
  });
  it("łączy pulę planu z dokupionymi kredytami", () => {
    expect(creditAllowance(billing)).toBe(245);
    expect(remainingCredits(billing)).toBe(205);
    expect(monthlyUsagePercentage(billing)).toBe(18);
    expect(monthlyUsagePercentage({ ...billing, usedCredits: 1 })).toBe(1);
    expect(remainingTopUpCredits(billing)).toBe(20);
  });

  it("nie pokazuje ujemnego salda", () => {
    expect(remainingCredits({ ...billing, usedCredits: 999 })).toBe(0);
  });

  it("wycenia tekst, zdjęcie i użycie internetu", () => {
    expect(estimateRequestCredits()).toBe(1);
    expect(settleRequestCredits([{ kind: "image" }], true)).toBe(5);
    expect(settleRequestCredits([], false, 0.053)).toBe(6);
    expect(settleRequestCredits([], false, 0)).toBe(1);
  });

  it("ma trzy serwerowo wycenione pakiety dodatkowego limitu", () => {
    expect(creditPackById("mini")).toMatchObject({
      percentage: 25,
      unitAmountGrosze: 1_999,
    });
    expect(creditPackById("max")).toMatchObject({
      percentage: 100,
      unitAmountGrosze: 5_999,
    });
    expect(topUpCreditsForPlan("plus", "lite")).toBe(113);
    expect(topUpCreditsForPlan("plus", "pro")).toBe(275);
  });

  it("pozwala Stripe uzupełnić nazwę istniejącego klienta przy zbieraniu NIP", () => {
    expect(stripeExistingCustomerUpdate).toEqual({ name: "auto" });
  });

  it("zużywa dodatkowy limit dopiero po miesięcznym", () => {
    expect(
      remainingTopUpCredits({
        ...billing,
        usedCredits: 230,
      }),
    ).toBe(15);
    expect(remainingTopUpPercentage({ ...billing, usedCredits: 230 })).toBe(7);
    expect(
      monthlyUsagePercentage({ ...billing, usedCredits: 999 }),
    ).toBe(100);
  });

  it("odnawia miesięczny limit bez przywracania zużytego zwiększenia", () => {
    expect(
      rollBillingPeriod(
        { ...billing, usedCredits: 230 },
        "2026-10-01T00:00:00.000Z",
      ),
    ).toEqual({
      ...billing,
      usedCredits: 0,
      topUpCredits: 15,
      periodStartedAt: "2026-10-01T00:00:00.000Z",
    });
  });

  it("sprzedaje publicznie wyłącznie Lite i Pro", () => {
    expect(publicPlanIds).toEqual(["lite", "pro"]);
    expect(publicPlanIdSchema.safeParse("lite").success).toBe(true);
    expect(publicPlanIdSchema.safeParse("pro").success).toBe(true);
    expect(publicPlanIdSchema.safeParse("firma").success).toBe(false);
    expect(normalizePublicPlan(undefined)).toBe("pro");
  });

  it("zatrzymuje odnowienie trialu do potwierdzenia e-maila", () => {
    expect(
      emailConfirmationHoldAction({
        subscriptionStatus: "trialing",
        emailConfirmed: false,
        managedHold: false,
        cancelAtPeriodEnd: false,
      }),
    ).toBe("apply");
    expect(
      emailConfirmationHoldAction({
        subscriptionStatus: "trialing",
        emailConfirmed: false,
        managedHold: true,
        cancelAtPeriodEnd: true,
      }),
    ).toBeNull();
  });

  it("wpuszcza tylko aktywny abonament albo niewygasły trial z metodą płatności", () => {
    const now = Date.parse("2026-09-08T12:00:00.000Z");
    expect(
      hasSubscriptionAccess({
        status: "trialing",
        paymentMethodAttached: true,
        trialEndsAt: "2026-09-09T12:00:00.000Z",
        now,
      }),
    ).toBe(true);
    expect(
      hasSubscriptionAccess({
        status: "trialing",
        paymentMethodAttached: false,
        trialEndsAt: "2026-09-09T12:00:00.000Z",
        now,
      }),
    ).toBe(false);
    expect(
      hasSubscriptionAccess({
        status: "trialing",
        paymentMethodAttached: true,
        trialEndsAt: "2026-09-08T11:59:59.000Z",
        now,
      }),
    ).toBe(false);
    expect(
      hasSubscriptionAccess({
        status: "active",
        paymentMethodAttached: true,
        now,
      }),
    ).toBe(true);
    expect(
      hasSubscriptionAccess({
        status: "active",
        paymentMethodAttached: false,
        now,
      }),
    ).toBe(false);
  });

  it("usuwa tylko blokadę zarządzaną przez SmartFach", () => {
    expect(
      emailConfirmationHoldAction({
        subscriptionStatus: "trialing",
        emailConfirmed: true,
        managedHold: true,
        cancelAtPeriodEnd: true,
      }),
    ).toBe("release");
    expect(
      emailConfirmationHoldAction({
        subscriptionStatus: "trialing",
        emailConfirmed: true,
        managedHold: false,
        cancelAtPeriodEnd: true,
      }),
    ).toBeNull();
  });

  it("rozpoznaje moment rezygnacji złożonej w trakcie trialu", () => {
    expect(
      trialCancellationRequestedAt({
        canceledAt: 1_788_912_000,
        trialStart: 1_788_825_600,
        trialEnd: 1_789_084_800,
        managedEmailConfirmationHold: false,
      }),
    ).toBe("2026-09-09T00:00:00.000Z");
    expect(
      trialCancellationRequestedAt({
        canceledAt: 1_788_912_000,
        trialStart: 1_788_825_600,
        trialEnd: 1_789_084_800,
        managedEmailConfirmationHold: true,
      }),
    ).toBeNull();
    expect(
      trialCancellationRequestedAt({
        canceledAt: 1_789_171_200,
        trialStart: 1_788_825_600,
        trialEnd: 1_789_084_800,
        managedEmailConfirmationHold: false,
      }),
    ).toBeNull();
  });
});
