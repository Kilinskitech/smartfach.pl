import "server-only";
import type { TopUpPurchase } from "@/domain/top-up-summary";
import type { createAdminClient } from "@/lib/supabase/admin";

/** Call only after requirePlatformAdmin; do not expose this ledger through workspace. */
export async function loadAdminTopUps(admin: ReturnType<typeof createAdminClient>, organizationIds: string[]): Promise<TopUpPurchase[]> {
  const ids = [...new Set(organizationIds)].filter(Boolean);
  const purchases: TopUpPurchase[] = [];
  if (!ids.length) return purchases;
  // Fetch every page rather than silently truncating totals at Supabase's row cap.
  for (let from = 0; ; from += 500) {
    const { data, error } = await admin.from("usage_top_ups")
      .select("checkout_session_id,organization_id,pack_id,granted_credits,amount_total_grosze,created_at")
      .in("organization_id", ids).order("created_at", { ascending: false })
      .order("checkout_session_id", { ascending: false }).range(from, from + 499);
    if (error) throw new Error("Nie można wczytać historii zakupów dodatkowego limitu.");
    for (const row of data ?? []) purchases.push({
      checkoutSessionId: String(row.checkout_session_id), organizationId: String(row.organization_id),
      packId: String(row.pack_id), grantedCredits: Number(row.granted_credits),
      amountGrosze: Number(row.amount_total_grosze), createdAt: String(row.created_at),
    });
    if (!data || data.length < 500) break;
  }
  return [...new Map(purchases.map(p => [p.checkoutSessionId, p])).values()];
}
