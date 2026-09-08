import type { MetadataRoute } from "next";
import { brandColors } from "@/components/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/app",
    name: "SmartFach — Twój asystent AI",
    short_name: "SmartFach",
    description:
      "Buduj własną usługę i przychód. Twoje rozmowy, oferta i następny krok zawsze pod ręką.",
    lang: "pl",
    categories: ["productivity", "business"],
    prefer_related_applications: false,
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: brandColors.background,
    theme_color: brandColors.navy,
    icons: [
      { src: "/icons/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
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
