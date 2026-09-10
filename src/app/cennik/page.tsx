import type { Metadata } from "next";
import { PricingLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Cennik — SmartFach",
  description: "Porównaj SmartFach Lite i Pro. Jeden abonament pomaga wybrać usługę, zbudować ofertę i regularnie zdobywać klientów.",
  alternates: { canonical: "/cennik" },
};
export default function Page() { return <PricingLanding />; }
