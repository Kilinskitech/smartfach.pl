import type { Metadata } from "next";
import { ContactPage } from "@/components/public-pages";

export const metadata: Metadata = {
  title: "Kontakt — SmartFach",
  description: "Skontaktuj się ze SmartFach w sprawie testów, planu dla firmy lub pomocy technicznej.",
  alternates: { canonical: "/kontakt" },
};

export default function Page() {
  return <ContactPage />;
}
