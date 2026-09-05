import type { Metadata } from "next";
import { PathLanding } from "@/components/marketing";

export const metadata: Metadata = {
  title: "SmartFach dla zespołów — wspólna pamięć firmy",
  description: "Twórz wyceny, protokoły i wiadomości oraz pracuj ze wspólną historią klientów i zasadami firmy.",
  alternates: { canonical: "/dla-firm" },
};
export default function Page() { return <PathLanding mode="operate" />; }
