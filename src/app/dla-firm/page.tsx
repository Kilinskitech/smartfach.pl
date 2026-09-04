import type { Metadata } from "next";
import { PathLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Prowadź i rozwijaj firmę — SmartFach",
  description: "Twórz wyceny, protokoły i wiadomości oraz zachowuj historię pracy przy właściwym kliencie.",
};
export default function Page() { return <PathLanding mode="operate" />; }
