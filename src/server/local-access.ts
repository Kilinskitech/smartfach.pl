import { limitedJson } from "./request-body";

/** Historyczny adapter używany wyłącznie przez testy regresji. */
export function localAccessAllowed(
  request: Request,
  mode = process.env.NODE_ENV,
): boolean {
  if (mode !== "development") return false;
  const url = new URL(request.url);
  if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) return false;
  // Next może normalizować request.url do localhost mimo wejścia przez 127.0.0.1.
  // Porównujemy Origin z rzeczywistym Host, dopuszczając tylko adresy loopback.
  const host = request.headers.get("host") ?? url.host;
  if (!/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host))
    return false;
  const expectedOrigin = url.protocol + "//" + host;
  const origin = request.headers.get("origin");
  if (request.method !== "GET" && origin !== expectedOrigin) return false;
  if (origin && origin !== expectedOrigin) return false;
  return request.headers.get("sec-fetch-site") === "same-origin";
}
export function localAdminPageAllowed(
  host: string | null,
  mode = process.env.NODE_ENV,
): boolean {
  return (
    mode === "development" &&
    Boolean(host && /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/.test(host))
  );
}
export const localDenied = () =>
  Response.json(
    {
      error:
        "Ta wersja działa tylko lokalnie. Przed publikacją potrzebne są konta i bezpieczna baza.",
    },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
export { limitedJson };
