import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing";

export const metadata: Metadata = {
  title: "SmartFach — asystent AI od pomysłu po prowadzenie firmy",
  description:
    "Ustal cel 10 000 zł miesięcznie, wybieraj kolejne działania, zdobywaj klientów i prowadź firmę z jednym asystentem AI.",
};

export default function Page() {
  return <MarketingHome />;
}
