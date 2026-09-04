import type { Metadata } from "next";
import { PricingLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Cennik — SmartFach",
  description: "Porównaj Lite, Pro i Firma. Każdy abonament obejmuje Odkryj, Uruchom i Prowadź.",
};
export default function Page() { return <PricingLanding />; }
