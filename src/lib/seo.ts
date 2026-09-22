export const productionOrigin = "https://smartfach.pl";

export const privateCrawlerPaths = [
  "/app",
  "/admin",
  "/api",
  "/auth",
  "/logowanie",
  "/platnosc",
  "/ustaw-haslo",
] as const;

export const aiCrawlerUserAgents = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Google-CloudVertexBot",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "CCBot",
  "DuckAssistBot",
  "MistralAI-User",
  "meta-externalagent",
  "meta-externalfetcher",
] as const;

export const publicPaths = [
  "/",
  "/kontakt",
  "/regulamin",
  "/polityka-prywatnosci",
] as const;

export function isProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
}
