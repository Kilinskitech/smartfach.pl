"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { publicPlanIdSchema } from "@/domain/billing";
import { applicationUrl, getStripe, stripeConfigured } from "@/lib/stripe";
import { isPlatformAdminIdentity } from "@/lib/platform-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { createSubscriptionCheckout } from "@/server/stripe-checkout";
import { releaseEmailConfirmationHoldForUser } from "@/server/stripe-subscriptions";

export type AuthState = { error?: string; success?: string } | undefined;

const credentialsSchema = z.object({
  email: z.email("Podaj poprawny adres e-mail.").trim().max(254),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków.").max(200),
});

const registrationSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(2, "Podaj imię lub nazwę.").max(160),
  plan: publicPlanIdSchema,
  terms: z.literal("accepted", "Zaakceptuj regulamin i politykę prywatności."),
});

function message(error: unknown) {
  if (!(error instanceof Error)) return "Nie udało się wykonać operacji.";
  if (/invalid login credentials/i.test(error.message))
    return "Nieprawidłowy e-mail lub hasło.";
  if (/already registered|already exists/i.test(error.message))
    return "Konto z tym adresem już istnieje. Zaloguj się.";
  if (/rate limit|security purposes/i.test(error.message))
    return "Wiadomość została już niedawno wysłana. Odczekaj chwilę i spróbuj ponownie.";
  return "Nie udało się połączyć z kontem. Spróbuj ponownie.";
}

function confirmationCallback() {
  const callback = new URL("/auth/callback", applicationUrl());
  callback.searchParams.set("next", "/app");
  return callback.toString();
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: message(error) };

  if (
    isPlatformAdminIdentity({
      userId: data.user?.id,
      email: data.user?.email,
    })
  )
    redirect("/admin");

  if (data.user?.id) {
    try {
      await releaseEmailConfirmationHoldForUser(data.user.id);
    } catch (holdError) {
      console.error("Nie zwolniono blokady odnowienia po zalogowaniu", {
        userId: data.user.id,
        message: holdError instanceof Error ? holdError.message : "unknown",
      });
    }
  }

  const requested = String(formData.get("next") ?? "");
  redirect(requested.startsWith("/platnosc") ? requested : "/app");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registrationSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    plan: formData.get("plan"),
    terms: formData.get("terms"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (!stripeConfigured())
    return {
      error: "Płatności są chwilowo niedostępne. Spróbuj ponownie za moment.",
    };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: confirmationCallback(),
      data: {
        display_name: parsed.data.displayName,
        plan: parsed.data.plan,
      },
    },
  });
  if (error) return { error: message(error) };
  if (!data.user?.id || data.user.identities?.length === 0)
    return { error: "Konto z tym adresem już istnieje. Zaloguj się." };

  let checkoutUrl: string;
  try {
    const admin = createAdminClient();
    const { data: membership, error: membershipError } = await admin
      .from("memberships")
      .select("organization_id")
      .eq("user_id", data.user.id)
      .eq("role", "owner")
      .eq("status", "active")
      .maybeSingle();
    if (membershipError || !membership)
      throw new Error("Nie utworzono organizacji użytkownika.");

    const canceled = new URL("/logowanie", applicationUrl());
    canceled.searchParams.set("plan", parsed.data.plan);
    canceled.searchParams.set("anulowano", "1");
    const session = await createSubscriptionCheckout({
      organizationId: String(membership.organization_id),
      userId: data.user.id,
      email: parsed.data.email,
      plan: parsed.data.plan,
      cancelPath: `${canceled.pathname}${canceled.search}`,
      idempotencyKey: `signup-checkout:${data.user.id}:${parsed.data.plan}`,
    });
    checkoutUrl = session.url!;
  } catch (checkoutError) {
    console.error("Nie otwarto Stripe po rejestracji", {
      userId: data.user.id,
      message: checkoutError instanceof Error ? checkoutError.message : "unknown",
    });
    return {
      error:
        "Konto powstało, ale nie udało się otworzyć płatności. Potwierdź e-mail, zaloguj się i spróbuj ponownie.",
    };
  }
  redirect(checkoutUrl);
}

export async function resendConfirmation(
  _: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const sessionId = String(formData.get("sessionId") ?? "");
  if (!/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId))
    return { error: "Nieprawidłowy identyfikator płatności." };

  try {
    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = checkout.metadata?.user_id;
    if (!userId || checkout.status !== "complete")
      return { error: "Nie znaleziono ukończonego formularza płatności." };

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user?.email)
      return { error: "Nie znaleziono konta dla tej płatności." };
    if (data.user.email_confirmed_at)
      return { success: "Adres jest już potwierdzony. Możesz się zalogować." };

    const supabase = await createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: data.user.email,
      options: { emailRedirectTo: confirmationCallback() },
    });
    if (resendError) return { error: message(resendError) };
    return { success: "Wysłaliśmy nową wiadomość. Sprawdź także folder Spam." };
  } catch (error) {
    console.error("Nie wysłano ponownie potwierdzenia", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return { error: "Nie udało się wysłać wiadomości. Spróbuj ponownie za chwilę." };
  }
}
