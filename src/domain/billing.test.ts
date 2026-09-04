import { describe, expect, it } from "vitest";
import {
  creditAllowance,
  estimateRequestCredits,
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
});
