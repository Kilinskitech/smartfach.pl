import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { brandColors } from "@/components/brand";
import { isProductionDeployment, productionOrigin } from "@/lib/seo";
import "./globals.css";

const googleTagManagerId = "GTM-PFXJK7VB";

export const metadata: Metadata = {
  metadataBase: new URL(productionOrigin),
  title: "SmartFach — asystent do budowania własnego przychodu",
  description:
    "SmartFach pomaga dopasować usługę do Twoich warunków, przygotować ofertę i przejść do pierwszych działań sprzedażowych.",
  applicationName: "SmartFach",
  robots: isProductionDeployment()
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: brandColors.navy,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const enableGoogleTagManager = isProductionDeployment();

  return (
    <html lang="pl">
      <head>
        {enableGoogleTagManager ? <Script
          id="google-tag-manager"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${googleTagManagerId}');`,
          }}
        /> : null}
      </head>
      <body>
        {enableGoogleTagManager ? <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript> : null}
        {children}
      </body>
    </html>
  );
}
