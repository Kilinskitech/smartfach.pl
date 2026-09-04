import type { Metadata } from "next";
import { PathLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "Zbuduj biznes od zera i pracuj nad celem 10 000 zł — SmartFach",
  description: "Znajdź realny kierunek, policz drogę do celu i realizuj kolejne działania z asystentem SmartFach.",
};
export default function Page() { return <PathLanding mode="discover" />; }
