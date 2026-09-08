import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { releaseEmailConfirmationHoldForUser } from "@/server/stripe-subscriptions";
import { assertDeploymentIdentity } from "@/server/operations";

const emailOtpTypes = new Set<EmailOtpType>([
  "email",
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
]);

function safeNextPath(requested: string | null) {
  if (requested === "/app") return "/app";
  if (requested === "/ustaw-haslo") return "/ustaw-haslo";
  if (requested?.startsWith("/platnosc")) return requested;
  return "/app";
}

export async function GET(request: Request) {
  await assertDeploymentIdentity();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeNextPath(url.searchParams.get("next"));
  const supabase = await createClient();
  let verified = false;

  if (tokenHash && type && emailOtpTypes.has(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    verified = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  }

  if (verified) {
    const { data } = await supabase.auth.getUser();
    if (data.user?.id) {
      try {
        await releaseEmailConfirmationHoldForUser(data.user.id);
      } catch (error) {
        console.error("Nie zwolniono blokady odnowienia po potwierdzeniu e-maila", {
          userId: data.user.id,
          message: error instanceof Error ? error.message : "unknown",
        });
      }
    }
    return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/logowanie?blad=potwierdzenie", url.origin));
}
