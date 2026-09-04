import type { Metadata } from "next";
import { TermsPage } from "@/components/public-pages";

export const metadata: Metadata = {
  title: "Regulamin — SmartFach",
  description: "Zasady konta, okresu próbnego i subskrypcji SmartFach.",
};

export default function Page() {
  return <TermsPage />;
}
