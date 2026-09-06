import type { Metadata } from "next";
import { ContactPage } from "@/components/public-pages";

export const metadata: Metadata = {
  title: "Kontakt — SmartFach",
  description: "Skontaktuj się ze SmartFach w sprawie startu, wyboru planu lub pomocy technicznej.",
  alternates: { canonical: "/kontakt" },
};

export default function Page() {
  return <ContactPage />;
}
