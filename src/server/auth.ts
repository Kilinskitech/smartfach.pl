import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export class AuthenticationRequired extends Error {}
export class SubscriptionRequired extends Error {}

export async function authenticatedContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = typeof data?.claims?.sub === "string" ? data.claims.sub : null;
  if (error || !userId) throw new AuthenticationRequired("Zaloguj się ponownie.");

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
  return data;
}

export function platformAdminId() {
  return process.env.PLATFORM_ADMIN_USER_ID?.trim() ?? "";
}

