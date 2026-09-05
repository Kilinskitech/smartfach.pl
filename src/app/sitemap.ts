import type { MetadataRoute } from "next";
import { isProductionDeployment, productionOrigin, publicPaths } from "../lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isProductionDeployment()) return [];

  return publicPaths.map((path, index) => ({
    url: new URL(path, productionOrigin).toString(),
    changeFrequency: index === 0 ? "weekly" : "monthly",
    priority: index === 0 ? 1 : 0.7,
  }));
}
