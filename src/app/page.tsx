import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing";

export const metadata: Metadata = {
  title: "SmartFach — jeden asystent na każdy etap firmy",
  description:
    "Odkrywaj kierunki, uruchamiaj ofertę i prowadź firmę w jednym abonamencie, bez zaczynania od zera.",
};

export default function Page() {
  return <MarketingHome />;
}
