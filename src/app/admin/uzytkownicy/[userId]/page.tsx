import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { AdminUserDetail, type AdminUserDetailSnapshot } from "@/components/admin-user-detail";
import { creditAllowance, plans } from "@/domain/billing";
import { workspaceSchema } from "@/domain/workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/server/auth";

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
    admin.from("user_profiles").select("display_name, account_type").eq("user_id", parsedId.data).maybeSingle(),
    admin.from("memberships").select("organization_id").eq("user_id", parsedId.data).eq("status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle(),
    admin.from("usage_events").select("cost_usd, total_tokens").eq("user_id", parsedId.data),
  ]);
  const organizationId = membershipResult.data?.organization_id ? String(membershipResult.data.organization_id) : "";
  if (!organizationId) notFound();
  const [organizationResult, workspaceResult, subscriptionResult, membershipsResult] = await Promise.all([
    admin.from("organizations").select("name").eq("id", organizationId).maybeSingle(),
    admin.from("workspaces").select("revision, data").eq("organization_id", organizationId).single(),
    admin.from("subscriptions").select("status, cancel_at_period_end, trial_ends_at, current_period_ends_at, stripe_subscription_id").eq("organization_id", organizationId).maybeSingle(),
    admin.from("memberships").select("user_id").eq("organization_id", organizationId).eq("status", "active"),
  ]);
  const workspace = workspaceSchema.parse({
    ...(workspaceResult.data?.data as object),
    revision: Number(workspaceResult.data?.revision),
  });
  const usageRows = usageResult.data ?? [];
  const accountType = profileResult.data?.account_type;
  const normalizedType = accountType === "discover" || accountType === "launch" ? accountType : "operate";
  const snapshot: AdminUserDetailSnapshot = {
    generatedAt: new Date().toISOString(),
    id: parsedId.data,
    email: authData.user.email ?? "Brak adresu e-mail",
    name: String(profileResult.data?.display_name ?? authData.user.user_metadata?.display_name ?? authData.user.email ?? "Użytkownik"),
    company: String(organizationResult.data?.name ?? workspace.company.name),
    accountType: normalizedType,
    plan: `Plan ${plans[workspace.billing.plan].name}`,
    usedCredits: workspace.billing.usedCredits,
    allowance: creditAllowance(workspace.billing),
    totalCostUsd: usageRows.reduce((sum, row) => sum + Number(row.cost_usd ?? 0), 0),
    totalTokens: usageRows.reduce((sum, row) => sum + Number(row.total_tokens ?? 0), 0),
    measuredResponses: usageRows.length,
    subscriptionStatus: String(subscriptionResult.data?.status ?? "incomplete"),
    cancelAtPeriodEnd: Boolean(subscriptionResult.data?.cancel_at_period_end),
    subscriptionEndsAt: subscriptionResult.data?.current_period_ends_at
      ? String(subscriptionResult.data.current_period_ends_at)
      : subscriptionResult.data?.trial_ends_at
        ? String(subscriptionResult.data.trial_ends_at)
        : null,
    stripeConnected: Boolean(subscriptionResult.data?.stripe_subscription_id),
    deleteBlockedReason:
      (membershipsResult.data ?? []).some(
        (membership) => String(membership.user_id) !== parsedId.data,
      )
        ? "To konto jest właścicielem zespołu. Usunięcie pozostaje zablokowane do czasu przeniesienia własności albo usunięcia członków."
        : undefined,
    conversations: workspace.conversations.toSorted((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      mode: conversation.mode,
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
