import { describe, expect, it } from "vitest";
import {
  creditAllowance,
  emailConfirmationHoldAction,
  estimateRequestCredits,
  normalizePublicPlan,
  publicPlanIdSchema,
  publicPlanIds,
  remainingCredits,
  settleRequestCredits,
  trialPolicy,
} from "./billing";

const billing = {
  plan: "lite" as const,
  usedCredits: 40,
  topUpCredits: 20,
  periodStartedAt: "2026-09-01T00:00:00.000Z",
};

describe("kredyty SmartFach", () => {
  it("definiuje trzydniowy trial z kartą i automatycznym przejściem na plan", () => {
    expect(trialPolicy).toEqual({
      durationDays: 3,
      paymentMethodRequired: true,
      convertsToPaidAutomatically: true,
    });
  });
  it("łączy pulę planu z dokupionymi kredytami", () => {
    expect(creditAllowance(billing)).toBe(170);
    expect(remainingCredits(billing)).toBe(130);
  });

  it("nie pokazuje ujemnego salda", () => {
    expect(remainingCredits({ ...billing, usedCredits: 999 })).toBe(0);
  });

  it("wycenia tekst, zdjęcie, głos i użycie internetu", () => {
    expect(estimateRequestCredits()).toBe(1);
    expect(
      settleRequestCredits(
        [{ kind: "image" }, { kind: "audio" }],
        true,
      ),
    ).toBe(9);
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
});
