import { after, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applicationUrl } from "@/lib/stripe";
import { emailConfirmationSchema, confirmationDestination } from "@/lib/email-confirmation";
import { assertDeploymentIdentity } from "@/server/operations";
import { releaseEmailConfirmationHoldForUser } from "@/server/stripe-subscriptions";

export async function POST(request: Request) {
  const origin = applicationUrl();
  if (request.headers.get("origin") !== origin)
    return new Response("Niedozwolone pochodzenie żądania.", { status: 403 });
  const redirect = (path: string) => NextResponse.redirect(new URL(path, origin), { status: 303, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  let recovery = false;
  try {
    await assertDeploymentIdentity();
    const form = await request.formData();
    recovery = form.get("type") === "recovery";
    const parsed = emailConfirmationSchema.safeParse(Object.fromEntries(form));
    if (!parsed.success) return redirect("/auth/potwierdz?blad=link");
    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp(parsed.data);
    if (error || !data.user) return redirect(`/auth/potwierdz?blad=link&type=${parsed.data.type}`);
    const userId = data.user.id;
    after(async () => {
      try { await releaseEmailConfirmationHoldForUser(userId); }
      catch { console.error("email_confirmation_hold_release_failed", { userId }); }
    });
    return redirect(confirmationDestination(parsed.data.type));
  } catch {
    return redirect(`/auth/potwierdz?blad=link&type=${recovery ? "recovery" : "signup"}`);
  }
}
