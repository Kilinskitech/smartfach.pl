import type { MetadataRoute } from "next";
import { brandColors } from "@/components/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "SmartFach — asystent biznesu",
    short_name: "SmartFach",
    description:
      "Odkrywanie, uruchamianie i prowadzenie biznesu z pomocą asystenta AI.",
    lang: "pl",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: brandColors.background,
    theme_color: brandColors.navy,
    icons: [
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
