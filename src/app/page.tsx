import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing";

export const metadata: Metadata = {
  title: "SmartFach — zbuduj usługę i zdobądź pierwszego klienta",
  description:
    "Osobisty asystent AI, który pomaga wybrać realną usługę, przygotować ofertę i wykonać pierwszy krok do klienta.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <MarketingHome />;
}
