import type { Metadata } from "next";
import { PrivacyPage } from "@/components/public-pages";

export const metadata: Metadata = {
  title: "Polityka prywatności — SmartFach",
  description: "Informacje o przetwarzaniu danych osobowych w SmartFach.",
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function Page() {
  return <PrivacyPage />;
}
