import type { Metadata } from "next";
import { PathLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Znajdź, sprawdzaj i rozwijaj pomysł na biznes — SmartFach",
  description: "Rozwijaj kierunek na podstawie kolejnych testów i przejdź do Uruchom bez zmiany abonamentu.",
};
export default function Page() { return <PathLanding mode="discover" />; }
