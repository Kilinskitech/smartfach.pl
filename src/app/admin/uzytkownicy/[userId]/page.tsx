import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdminUserDetail, type AdminUserDetailSnapshot } from "@/components/admin-user-detail";
import { plans } from "@/domain/billing";
import { workspaceSchema } from "@/domain/workspace";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/server/auth";
import { loadAdminTopUps } from "@/server/admin-top-ups";
import { summarizeTopUps } from "@/domain/top-up-summary";
import { syncSubscription } from "@/server/stripe-subscriptions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profil użytkownika — SmartFach", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
  const parsedId = z.uuid().safeParse((await params).userId);
  if (!parsedId.success) notFound();
  const platformAdmin = await requirePlatformAdmin().catch(() => notFound());
  if (parsedId.data === platformAdmin.userId) notFound();

  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.getUserById(parsedId.data);
  if (authError || !authData.user) notFound();
  const [profileResult, membershipResult, usageResult] = await Promise.all([
    admin.from("user_profiles").select("display_name").eq("user_id", parsedId.data).maybeSingle(),
    admin.from("memberships").select("organization_id").eq("user_id", parsedId.data).eq("status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle(),
    admin.rpc("admin_usage_totals").eq("user_id", parsedId.data),
  ]);
  const organizationId = membershipResult.data?.organization_id ? String(membershipResult.data.organization_id) : "";
  if (!organizationId) notFound();
  const [organizationResult, workspaceResult, subscriptionResult, membershipsResult] = await Promise.all([
    admin.from("organizations").select("name").eq("id", organizationId).maybeSingle(),
    admin.from("workspaces").select("revision, data").eq("organization_id", organizationId).single(),
    admin.from("subscriptions").select("status, cancel_at_period_end, trial_ends_at, current_period_started_at, current_period_ends_at, stripe_subscription_id").eq("organization_id", organizationId).maybeSingle(),
    admin.from("memberships").select("user_id").eq("organization_id", organizationId).eq("status", "active"),
  ]);
  let subscription = subscriptionResult.data;
  let subscriptionSyncWarning: string | undefined;
  const stripeSubscriptionId = subscription?.stripe_subscription_id
    ? String(subscription.stripe_subscription_id)
    : "";
  if (stripeSubscriptionId) {
    try {
      const liveSubscription = await getStripe().subscriptions.retrieve(
        stripeSubscriptionId,
      );
      const storedStateIsStale =
        liveSubscription.status !== String(subscription?.status) ||
        liveSubscription.cancel_at_period_end !==
          Boolean(subscription?.cancel_at_period_end);
      if (storedStateIsStale) {
        await syncSubscription(liveSubscription);
        const refreshed = await admin
          .from("subscriptions")
          .select("status, cancel_at_period_end, trial_ends_at, current_period_started_at, current_period_ends_at, stripe_subscription_id")
          .eq("organization_id", organizationId)
          .maybeSingle();
        if (refreshed.error || !refreshed.data)
          throw new Error("Nie odczytano zsynchronizowanego abonamentu.");
        subscription = refreshed.data;
      }
    } catch (error) {
      console.error("Nie odświeżono statusu Stripe w profilu użytkownika", {
        userId: parsedId.data,
        message: error instanceof Error ? error.message : "unknown",
      });
      subscriptionSyncWarning =
        "Nie udało się teraz potwierdzić statusu bezpośrednio w Stripe. Widok może pokazywać ostatni zapisany stan.";
    }
  }
  const workspace = workspaceSchema.parse({
    ...(workspaceResult.data?.data as object),
    revision: Number(workspaceResult.data?.revision),
  });
  if (usageResult.error) throw new Error("Nie można wczytać pełnego zużycia użytkownika.");
  const usage = usageResult.data?.[0];
  const purchases = await loadAdminTopUps(admin, [organizationId]);
  const topUps = summarizeTopUps(purchases, workspace.billing);
  const snapshot: AdminUserDetailSnapshot = {
    generatedAt: new Date().toISOString(),
    id: parsedId.data,
    email: authData.user.email ?? "Brak adresu e-mail",
    name: String(profileResult.data?.display_name ?? authData.user.user_metadata?.display_name ?? authData.user.email ?? "Użytkownik"),
    company: String(organizationResult.data?.name ?? workspace.company.name),
    plan: `Plan ${plans[workspace.billing.plan].name}`,
    monthlyCostUsd: Number(usage?.period_cost_usd ?? 0),
    monthlyLimitUsd: topUps.totalAllowanceUsd,
    baseLimitUsd: plans[workspace.billing.plan].monthlyCredits / 100,
    chargedLimitUsd: workspace.billing.usedCredits / 100,
    topUps,
    topUpPurchases: purchases.slice(0, 20),
    totalCostUsd: Number(usage?.cost_usd ?? 0),
    totalTokens: Number(usage?.total_tokens ?? 0),
    measuredResponses: Number(usage?.response_count ?? 0),
    subscriptionStatus: String(subscription?.status ?? "incomplete"),
    cancelAtPeriodEnd: Boolean(subscription?.cancel_at_period_end),
    subscriptionEndsAt: subscription?.current_period_ends_at
      ? String(subscription.current_period_ends_at)
      : subscription?.trial_ends_at
        ? String(subscription.trial_ends_at)
        : null,
    stripeConnected: Boolean(subscription?.stripe_subscription_id),
    ...(subscriptionSyncWarning ? { subscriptionSyncWarning } : {}),
    deleteBlockedReason:
      (membershipsResult.data ?? []).some(
        (membership) => String(membership.user_id) !== parsedId.data,
      )
        ? "To konto jest właścicielem zespołu. Usunięcie pozostaje zablokowane do czasu przeniesienia własności albo usunięcia członków."
        : undefined,
    conversations: workspace.conversations.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt,
      hasPendingDocument: Boolean(conversation.pendingDocument),
      messages: conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        ...(message.model ? { model: message.model } : {}),
        ...(message.usage ? { usage: message.usage } : {}),
        sources: message.sources ?? [],
      })),
    })),
  };
  const { error: auditError } = await admin.from("admin_audit_events").insert({
    admin_user_id: platformAdmin.userId,
    target_user_id: parsedId.data,
    action: "view_user_conversations",
    metadata: { conversation_count: snapshot.conversations.length },
  });
  if (auditError) throw new Error("Nie zapisano audytu dostępu do rozmów.");
  return <AdminUserDetail snapshot={snapshot} />;
}
