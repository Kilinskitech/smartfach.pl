import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isPlatformAdminIdentity } from "@/lib/platform-admin";
import { createClient } from "@/lib/supabase/server";
import { hasSubscriptionAccess } from "@/domain/billing";

export class AuthenticationRequired extends Error {}
export class EmailConfirmationRequired extends AuthenticationRequired {}
export class SubscriptionRequired extends Error {}

export async function authenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (error || !userId) throw new AuthenticationRequired("Zaloguj się ponownie.");

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user || userData.user.id !== userId)
    throw new AuthenticationRequired("Zaloguj się ponownie.");
  if (!userData.user.email_confirmed_at)
    throw new EmailConfirmationRequired(
      "Potwierdź adres e-mail przed uruchomieniem SmartFach.",
    );

  const { data: membership, error: membershipError } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (membershipError || !membership)
    throw new AuthenticationRequired("Konto nie ma aktywnej organizacji.");

  return {
    supabase,
    userId,
    email: userData.user.email ?? email,
    organizationId: String(membership.organization_id),
    organizationRole: String(membership.role),
  };
}

export async function requireSubscription(
  supabase: SupabaseClient,
  organizationId: string,
) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, plan, trial_ends_at, payment_method_attached")
    .eq("organization_id", organizationId)
    .maybeSingle();
  if (error) throw new Error("Nie można sprawdzić abonamentu.");
  if (!data || !["trialing", "active"].includes(String(data.status)))
    throw new SubscriptionRequired("Wybierz plan, aby korzystać ze SmartFach.");
  if (!data.payment_method_attached)
    throw new SubscriptionRequired(
      "Dokończ podpinanie metody płatności, aby korzystać ze SmartFach.",
    );
  if (
    !hasSubscriptionAccess({
      status: String(data.status),
      paymentMethodAttached: Boolean(data.payment_method_attached),
      trialEndsAt: data.trial_ends_at ? String(data.trial_ends_at) : null,
    })
  )
    throw new SubscriptionRequired(
      "Okres próbny wygasł. Sprawdź status płatności, aby kontynuować.",
    );
  return data;
}

export async function requirePlatformAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;
  if (
    error ||
    !userId ||
    !isPlatformAdminIdentity({ userId, email })
  )
    throw new AuthenticationRequired("Brak dostępu do panelu administratora.");
  return { supabase, userId, email };
}
