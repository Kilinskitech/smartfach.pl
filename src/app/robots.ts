import type { MetadataRoute } from "next";
import {
  aiCrawlerUserAgents,
  isProductionDeployment,
  privateCrawlerPaths,
  productionOrigin,
} from "../lib/seo";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionDeployment()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...privateCrawlerPaths],
      },
      {
        userAgent: [...aiCrawlerUserAgents],
        allow: "/",
        disallow: [...privateCrawlerPaths],
      },
    ],
    sitemap: `${productionOrigin}/sitemap.xml`,
    host: productionOrigin,
  };
}
