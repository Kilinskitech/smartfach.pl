import { afterEach, describe, expect, it } from "vitest";
import robots from "../app/robots";
import sitemap from "../app/sitemap";
import { isProductionDeployment, productionOrigin, publicPaths } from "./seo";

const originalVercelEnvironment = process.env.VERCEL_ENV;

afterEach(() => {
  if (originalVercelEnvironment === undefined) delete process.env.VERCEL_ENV;
  else process.env.VERCEL_ENV = originalVercelEnvironment;
});

describe("SEO environments", () => {
  it("blokuje indeksowanie Preview", () => {
    process.env.VERCEL_ENV = "preview";

    expect(isProductionDeployment()).toBe(false);
    expect(robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    expect(sitemap()).toEqual([]);
  });

  it("wystawia sitemapę wyłącznie dla kanonicznej domeny Live", () => {
    process.env.VERCEL_ENV = "production";

    expect(isProductionDeployment()).toBe(true);
    expect(sitemap().map(({ url }) => url)).toEqual(
      publicPaths.map((path) => new URL(path, productionOrigin).toString()),
    );
    expect(robots()).toMatchObject({
      sitemap: "https://smartfach.pl/sitemap.xml",
      host: "https://smartfach.pl",
    });
  });
});
