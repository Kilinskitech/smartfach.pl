"use client";

import { useEffect, useRef } from "react";
import type { PublicPlanId } from "@/domain/billing";
import {
  marketingPlanParams,
  trackMarketingEventOnce,
} from "@/lib/marketing-events";

export function StartTrialTracker({
  plan,
  trackingKey,
}: {
  plan: PublicPlanId;
  trackingKey: string;
}) {
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    trackMarketingEventOnce(
      `start-trial:${trackingKey}`,
      "sf_start_trial",
      marketingPlanParams(plan),
    );
  }, [plan, trackingKey]);

  return null;
}
