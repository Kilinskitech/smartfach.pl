import type { Metadata } from "next";
import { PathLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Uruchom swój biznes — SmartFach",
  description: "Testuj ofertę, aktualizuj cenę i planuj kolejne działania na podstawie odpowiedzi klientów.",
};
export default function Page() { return <PathLanding mode="launch" />; }
