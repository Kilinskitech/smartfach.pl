import type { Metadata } from "next";
import { PricingLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Cennik — SmartFach",
  description: "Porównaj Lite, Pro i Firma. Jeden abonament pomaga od pierwszego pomysłu po codzienną pracę firmy.",
  alternates: { canonical: "/cennik" },
};
export default function Page() { return <PricingLanding />; }
