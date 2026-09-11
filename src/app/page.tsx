import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing";

export const metadata: Metadata = {
  title: "SmartFach — zbuduj pierwszy biznes z tego, co już masz",
  description:
    "Wykorzystaj swoją wiedzę, doświadczenie i dostępny czas, aby z pomocą SmartFach wybrać realną usługę, przygotować ofertę i sprawdzić ją na rynku.",
  alternates: { canonical: "/" },
};

export default function Page() {
  return <MarketingHome />;
}
