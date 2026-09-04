import type { Metadata } from "next";
import { PathLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Rozwijaj biznes z asystentem AI — SmartFach",
  description: "Od pierwszej oferty po wyceny, protokoły, wiadomości i historię klientów w jednym asystencie AI.",
};
export default function Page() { return <PathLanding mode="launch" />; }
