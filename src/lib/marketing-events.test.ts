import { afterEach, describe, expect, it, vi } from "vitest";
import {
  marketingPlanParams,
  trackMarketingEvent,
  trackMarketingEventOnce,
} from "./marketing-events";

function browser() {
  const values = new Map<string, string>();
  const windowMock = {
    dataLayer: [] as Array<Record<string, unknown>>,
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  };
  vi.stubGlobal("window", windowMock);
  return windowMock;
}

afterEach(() => vi.unstubAllGlobals());

describe("marketing dataLayer", () => {
  it("maps plan prices to whole PLN values", () => {
    expect(marketingPlanParams("lite")).toEqual({
      plan: "lite",
      value: 49,
      currency: "PLN",
    });
    expect(marketingPlanParams("pro")).toEqual({
      plan: "pro",
      value: 99,
      currency: "PLN",
    });
  });

  it("pushes only the event and supplied marketing parameters", () => {
    const target = browser();
    trackMarketingEvent("sf_sign_up", { plan: "lite" });
    expect(target.dataLayer).toEqual([{ event: "sf_sign_up", plan: "lite" }]);
  });

  it("deduplicates a completed event across component remounts", () => {
    const target = browser();
    expect(trackMarketingEventOnce("trial:one", "sf_start_trial", marketingPlanParams("pro"))).toBe(true);
    expect(trackMarketingEventOnce("trial:one", "sf_start_trial", marketingPlanParams("pro"))).toBe(false);
    expect(target.dataLayer).toHaveLength(1);
  });
});
