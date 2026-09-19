import { plans, type PublicPlanId } from "@/domain/billing";

export type MarketingEventName =
  | "sf_select_plan"
  | "sf_sign_up"
  | "sf_begin_checkout"
  | "sf_start_trial";

type MarketingEventParams = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function marketingPlanParams(plan: PublicPlanId) {
  return {
    plan,
    value: plans[plan].monthlyPriceGrosze / 100,
    currency: "PLN",
  } as const;
}

export function trackMarketingEvent(
  event: MarketingEventName,
  params: MarketingEventParams = {},
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

function eventStorageKey(key: string) {
  return `smartfach:marketing:${key}`;
}

function claimEvent(key: string) {
  try {
    const storageKey = eventStorageKey(key);
    if (window.localStorage.getItem(storageKey)) return false;
    window.localStorage.setItem(storageKey, "1");
    return true;
  } catch {
    // Storage can be disabled. The caller's React guard still prevents a duplicate
    // within the current render lifecycle.
    return true;
  }
}

export function trackMarketingEventOnce(
  key: string,
  event: MarketingEventName,
  params: MarketingEventParams = {},
) {
  if (typeof window === "undefined" || !claimEvent(key)) return false;
  trackMarketingEvent(event, params);
  return true;
}

export function trackMarketingEventBeforeNavigation(
  key: string,
  event: MarketingEventName,
  params: MarketingEventParams,
  navigate: () => void,
) {
  if (typeof window === "undefined") return;
  if (!claimEvent(key)) {
    navigate();
    return;
  }

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    navigate();
  };

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event,
    ...params,
    eventCallback: finish,
    eventTimeout: 500,
  });
  window.setTimeout(finish, 550);
}
