export const productionOrigin = "https://smartfach.pl";

export const publicPaths = [
  "/",
  "/odkryj",
  "/uruchom",
  "/dla-firm",
  "/cennik",
  "/kontakt",
  "/regulamin",
  "/polityka-prywatnosci",
] as const;

export function isProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
}
