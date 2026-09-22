import type { Metadata } from "next";
import { MarketingHome } from "@/components/marketing";
import { productionOrigin } from "@/lib/seo";

export const metadata: Metadata = {
  title: "SmartFach — zbudujmy razem Twój wymarzony biznes",
  description:
    "Twój osobisty asystent biznesowy, który pomaga znaleźć pomysł, przygotować ofertę oraz pierwszą wiadomość do klienta.",
  alternates: { canonical: "/" },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${productionOrigin}/#organization`,
      name: "SmartFach",
      url: productionOrigin,
    },
    {
      "@type": "WebSite",
      "@id": `${productionOrigin}/#website`,
      url: productionOrigin,
      name: "SmartFach",
      inLanguage: "pl-PL",
      publisher: { "@id": `${productionOrigin}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${productionOrigin}/#application`,
      name: "SmartFach",
      url: productionOrigin,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Przeglądarka internetowa",
      inLanguage: "pl-PL",
      description:
        "Twój osobisty asystent biznesowy, który pomaga znaleźć pomysł, przygotować ofertę oraz pierwszą wiadomość do klienta.",
      provider: { "@id": `${productionOrigin}/#organization` },
      offers: [
        {
          "@type": "Offer",
          name: "SmartFach Lite",
          price: "49.00",
          priceCurrency: "PLN",
          url: `${productionOrigin}/#cennik`,
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "SmartFach Pro",
          price: "99.00",
          priceCurrency: "PLN",
          url: `${productionOrigin}/#cennik`,
          availability: "https://schema.org/InStock",
        },
      ],
    },
  ],
};

export default function Page() {
  return <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
      }}
    />
    <MarketingHome />
  </>;
}
