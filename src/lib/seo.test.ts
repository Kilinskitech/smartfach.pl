import { afterEach, describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { GET as llmsTxt } from "../app/llms.txt/route";
import {
  aiCrawlerUserAgents,
  isProductionDeployment,
  privateCrawlerPaths,
  productionOrigin,
  publicPaths,
} from "./seo";

const originalVercelEnvironment = process.env.VERCEL_ENV;

afterEach(() => {
  if (originalVercelEnvironment === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnvironment;
});

describe("SEO environments", () => {
  it("blokuje indeksowanie Preview", async () => {
    process.env.VERCEL_ENV = "preview";

    expect(isProductionDeployment()).toBe(false);
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    expect(sitemap()).toEqual([]);
    expect((await llmsTxt()).status).toBe(404);
  });

  it("wystawia sitemapę i publiczny opis wyłącznie dla kanonicznej domeny Live", async () => {
    process.env.VERCEL_ENV = "production";

    expect(isProductionDeployment()).toBe(true);
    expect(sitemap().map(({ url }) => url)).toEqual(
      publicPaths.map((path) => new URL(path, productionOrigin).toString()),
    );
    expect(robots()).toMatchObject({
      sitemap: "https://smartfach.pl/sitemap.xml",
      host: "https://smartfach.pl",
    });
    const response = await llmsTxt();
    expect(response.status).toBe(200);
    expect(await response.text()).toContain("https://smartfach.pl/#cennik");
  });

  it("wpuszcza roboty AI tylko do publicznej części serwisu", () => {
    process.env.VERCEL_ENV = "production";

    expect(robots().rules).toContainEqual({
      userAgent: [...aiCrawlerUserAgents],
      allow: "/",
      disallow: [...privateCrawlerPaths],
    });
  });
});
