import type { Metadata } from "next";
import { PricingLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Cennik — SmartFach",
  description: "Porównaj SmartFach Lite i Pro. Ten sam osobisty asystent biznesowy, różne miesięczne limity: 49 zł lub 99 zł miesięcznie.",
  alternates: { canonical: "/cennik" },
};
export default function Page() { return <PricingLanding />; }
