import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseConfigured, supabasePublicConfig } from "./config";

const protectedPrefixes = ["/app", "/platnosc", "/admin"];

export async function updateSession(request: NextRequest) {
  if (!supabaseConfigured()) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const { url, key } = supabasePublicConfig();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(cacheHeaders).forEach(([header, value]) =>
          response.headers.set(header, value),
        );
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && !userId) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/logowanie";
    destination.searchParams.set("dalej", request.nextUrl.pathname);
    return NextResponse.redirect(destination);
  }

  if (request.nextUrl.pathname.startsWith("/admin") && userId) {
    const allowedId = process.env.PLATFORM_ADMIN_USER_ID?.trim();
    if (!allowedId || userId !== allowedId) {
      const destination = request.nextUrl.clone();
      destination.pathname = "/app";
      destination.search = "";
      return NextResponse.redirect(destination);
    }
  }

  return response;
}

