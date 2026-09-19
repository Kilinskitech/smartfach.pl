"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { PublicPlanId } from "@/domain/billing";
import {
  marketingPlanParams,
  trackMarketingEvent,
} from "@/lib/marketing-events";

export function TrackedPlanLink({
  plan,
  href,
  className,
  children,
}: {
  plan: PublicPlanId;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() =>
        trackMarketingEvent("sf_select_plan", marketingPlanParams(plan))
      }
    >
      {children}
    </Link>
  );
}
