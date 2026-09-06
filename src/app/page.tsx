import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing";

export const metadata: Metadata = {
  title: "SmartFach — od Twoich warunków do pierwszego klienta",
  description:
    "Wybierz zdalny lub lokalny sposób pracy, zbuduj sprzedawalną usługę i zdobywaj klientów z osobistym asystentem AI.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <MarketingHome />;
}
