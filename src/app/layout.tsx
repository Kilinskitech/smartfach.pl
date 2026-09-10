import type { Metadata, Viewport } from "next";
import { brandColors } from "@/components/brand";
import { isProductionDeployment, productionOrigin } from "@/lib/seo";
import "./globals.css";
import { PwaProvider } from "@/components/pwa";

export const metadata: Metadata = {
  metadataBase: new URL(productionOrigin),
  title: "SmartFach — asystent do budowania własnego przychodu",
  description:
    "SmartFach pomaga dopasować usługę do Twoich warunków, przygotować ofertę i przejść do pierwszych działań sprzedażowych.",
  applicationName: "SmartFach",
  manifest: "/manifest.webmanifest",
  robots: isProductionDeployment()
    ? { index: true, follow: true }
    : { index: false, follow: false, noarchive: true },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "SmartFach" },
  icons: { icon: "/icons/192", apple: "/icons/180" },
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
  return (
    <html lang="pl">
      <body><PwaProvider>{children}</PwaProvider></body>
    </html>
  );
}
