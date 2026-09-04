import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminDashboard, type AdminSnapshot } from "@/components/admin-dashboard";
import { creditAllowance, planIdSchema, plans } from "@/domain/billing";
import { workspaceSchema } from "@/domain/workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripeConfigured } from "@/lib/stripe";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { platformAdminId } from "@/server/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel właściciela — SmartFach", robots: { index: false, follow: false } };

export default async function Page() {
  if (!supabaseAdminConfigured() || !platformAdminId()) notFound();
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (claims?.claims?.sub !== platformAdminId()) notFound();

  const admin = createAdminClient();
  const { data: authData, error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authError) throw new Error("Nie można wczytać użytkowników.");
  const userIds = authData.users.map((user) => user.id);
  const [profilesResult, membershipsResult, subscriptionsResult, workspacesResult, usageResult] = await Promise.all([
    userIds.length ? admin.from("user_profiles").select("user_id, display_name, account_type").in("user_id", userIds) : Promise.resolve({ data: [] }),
    userIds.length ? admin.from("memberships").select("user_id, organization_id, role, status").in("user_id", userIds).eq("status", "active") : Promise.resolve({ data: [] }),
    admin.from("subscriptions").select("organization_id, plan, status, payment_method_attached"),
    admin.from("workspaces").select("organization_id, revision, data"),
    admin.from("usage_events").select("user_id, cost_usd, total_tokens"),
  ]);
  const profiles = new Map((profilesResult.data ?? []).map((row) => [String(row.user_id), row]));
  const memberships = new Map((membershipsResult.data ?? []).map((row) => [String(row.user_id), row]));
  const subscriptions = new Map((subscriptionsResult.data ?? []).map((row) => [String(row.organization_id), row]));
  const workspaces = new Map((workspacesResult.data ?? []).map((row) => [String(row.organization_id), row]));
  const usage = new Map<string, { costUsd: number; totalTokens: number; count: number }>();
  for (const row of usageResult.data ?? []) {
    const id = String(row.user_id);
    const current = usage.get(id) ?? { costUsd: 0, totalTokens: 0, count: 0 };
    current.costUsd += Number(row.cost_usd ?? 0);
    current.totalTokens += Number(row.total_tokens ?? 0);
    current.count += 1;
    usage.set(id, current);
  }

  const users = authData.users.map((authUser) => {
    const profile = profiles.get(authUser.id);
    const membership = memberships.get(authUser.id);
    const organizationId = membership ? String(membership.organization_id) : "";
    const subscription = subscriptions.get(organizationId);
    const workspaceRow = workspaces.get(organizationId);
    const parsedWorkspace = workspaceSchema.safeParse(
      workspaceRow?.data && typeof workspaceRow.data === "object"
        ? { ...(workspaceRow.data as object), revision: Number(workspaceRow.revision) }
        : null,
    );
    const plan = planIdSchema.safeParse(subscription?.plan);
    const billing = parsedWorkspace.success
      ? parsedWorkspace.data.billing
      : {
          plan: plan.success ? plan.data : ("lite" as const),
          usedCredits: 0,
          topUpCredits: 0,
          periodStartedAt: new Date().toISOString(),
        };
    const accountType = profile?.account_type;
    return {
      id: authUser.id,
      name: String(profile?.display_name ?? authUser.user_metadata?.display_name ?? ""),
      email: authUser.email ?? "Brak adresu e-mail",
      accountType: accountType === "discover" || accountType === "launch" ? accountType : "operate" as const,
      plan: plans[billing.plan].name,
      status: String(subscription?.status ?? "incomplete"),
      paymentMethodAttached: Boolean(subscription?.payment_method_attached),
      usedCredits: billing.usedCredits,
      allowance: creditAllowance(billing),
      costUsd: usage.get(authUser.id)?.costUsd ?? 0,
      totalTokens: usage.get(authUser.id)?.totalTokens ?? 0,
    };
  });

  const snapshot: AdminSnapshot = {
    generatedAt: new Date().toISOString(),
    integrations: {
      ai: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_MODEL),
      webSearch: process.env.OPENROUTER_WEB_SEARCH !== "false",
      auth: true,
      billing: stripeConfigured(),
    },
    totals: {
      users: users.length,
      trialing: users.filter((user) => user.status === "trialing").length,
      paymentMethodAttached: users.filter((user) => user.paymentMethodAttached).length,
      active: users.filter((user) => user.status === "active").length,
      costUsd: [...usage.values()].reduce((sum, item) => sum + item.costUsd, 0),
      totalTokens: [...usage.values()].reduce((sum, item) => sum + item.totalTokens, 0),
      measuredResponses: [...usage.values()].reduce((sum, item) => sum + item.count, 0),
    },
    users,
  };
  return <AdminDashboard snapshot={snapshot} />;
}

