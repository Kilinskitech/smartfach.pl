import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminDashboard, type AdminSnapshot } from "@/components/admin-dashboard";
import { planIdSchema, plans } from "@/domain/billing";
import { workspaceSchema } from "@/domain/workspace";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripeConfigured } from "@/lib/stripe";
import { supabaseAdminConfigured } from "@/lib/supabase/config";
import { requirePlatformAdmin } from "@/server/auth";
import { aiConfigured } from "@/server/assistant-service";
import { getOperator } from "@/server/operator-settings";
import { smtpConfigured } from "@/server/transactional-email";
import { countOverdueContractEmails } from "@/server/contract-delivery";
import { AdminLegal } from "@/components/admin-legal";
import { AdminOperations, type OperationalSummary } from "@/components/admin-operations";
import { loadAdminTopUps } from "@/server/admin-top-ups";
import { summarizeTopUps } from "@/domain/top-up-summary";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Panel właściciela — SmartFach", robots: { index: false, follow: false } };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ usunieto?: string }>;
}) {
  if (!supabaseAdminConfigured()) notFound();
  const platformAdmin = await requirePlatformAdmin().catch(() => notFound());

  const admin = createAdminClient();
  const operational = await admin.rpc("admin_operational_summary");
  if (operational.error) throw new Error("Nie można wczytać stanu operacji. Sprawdź migrację bazy.");
  const pendingEmails = await countOverdueContractEmails();
  const withdrawals = await admin.from("withdrawal_requests").select("id,user_id,email,statement,received_at,email_sent_at,checkout_session_id").is("resolved_at", null).order("received_at");
  if (withdrawals.error) throw new Error("Nie można wczytać zgłoszeń odstąpienia.");
  const { data: authData, error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authError) throw new Error("Nie można wczytać użytkowników.");
  const customerUsers = authData.users.filter(
    (user) => user.id !== platformAdmin.userId,
  );
  const userIds = customerUsers.map((user) => user.id);
  const [profilesResult, membershipsResult, subscriptionsResult, workspacesResult, usageResult, trialCancellationsResult] = await Promise.all([
    userIds.length ? admin.from("user_profiles").select("user_id, display_name").in("user_id", userIds) : Promise.resolve({ data: [] }),
    userIds.length ? admin.from("memberships").select("user_id, organization_id, role, status").in("user_id", userIds).eq("status", "active") : Promise.resolve({ data: [] }),
    admin.from("subscriptions").select("organization_id, plan, status, payment_method_attached, current_period_started_at"),
    admin.from("workspaces").select("organization_id, revision, data"),
    admin.rpc("admin_usage_totals"),
    userIds.length ? admin.from("product_events").select("user_id, occurred_at").eq("event", "trial_canceled").in("user_id", userIds) : Promise.resolve({ data: [] }),
  ]);
  for (const result of [profilesResult, membershipsResult, subscriptionsResult, workspacesResult, usageResult, trialCancellationsResult])
    if ("error" in result && result.error) throw new Error("Nie można wczytać pełnych danych panelu.");
  const profiles = new Map((profilesResult.data ?? []).map((row) => [String(row.user_id), row]));
  const memberships = new Map((membershipsResult.data ?? []).map((row) => [String(row.user_id), row]));
  const topUpPurchases = await loadAdminTopUps(admin, [...memberships.values()].map(row => String(row.organization_id)));
  const subscriptions = new Map((subscriptionsResult.data ?? []).map((row) => [String(row.organization_id), row]));
  const workspaces = new Map((workspacesResult.data ?? []).map((row) => [String(row.organization_id), row]));
  const trialCancellations = new Map((trialCancellationsResult.data ?? []).map((row) => [String(row.user_id), String(row.occurred_at)]));
  const usage = new Map<string, {
    costUsd: number;
    totalTokens: number;
    count: number;
    monthlyCostUsd: number;
  }>();
  for (const row of usageResult.data ?? []) {
    const id = String(row.user_id);
    const current = usage.get(id) ?? {
      costUsd: 0,
      totalTokens: 0,
      count: 0,
      monthlyCostUsd: 0,
    };
    const eventCostUsd = Number(row.cost_usd ?? 0);
    current.costUsd += eventCostUsd;
    current.totalTokens += Number(row.total_tokens ?? 0);
    current.count += Number(row.response_count ?? 0);
    current.monthlyCostUsd += Number(row.period_cost_usd ?? 0);
    usage.set(id, current);
  }

  const users = customerUsers.map((authUser) => {
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
    const userUsage = usage.get(authUser.id);
    const monthlyCostUsd = userUsage?.monthlyCostUsd ?? 0;
    const topUps = summarizeTopUps(topUpPurchases.filter(p => p.organizationId === organizationId), billing);
    return {
      id: authUser.id,
      name: String(profile?.display_name ?? authUser.user_metadata?.display_name ?? ""),
      email: authUser.email ?? "Brak adresu e-mail",
      plan: plans[billing.plan].name,
      status: String(subscription?.status ?? "incomplete"),
      paymentMethodAttached: Boolean(subscription?.payment_method_attached),
      trialCanceledAt: trialCancellations.get(authUser.id) ?? null,
      monthlyCostUsd,
      monthlyLimitUsd: topUps.totalAllowanceUsd,
      topUps,
      totalCostUsd: userUsage?.costUsd ?? 0,
      totalTokens: userUsage?.totalTokens ?? 0,
    };
  });

  const snapshot: AdminSnapshot = {
    generatedAt: new Date().toISOString(),
    integrations: {
      ai: aiConfigured(),
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
  const params = await searchParams;
  const operator = await getOperator();
  return (
    <AdminDashboard
      notice={
        params.usunieto === "1"
          ? "Konto użytkownika, dane firmy i subskrypcja zostały usunięte."
          : undefined
      }
      snapshot={snapshot}
      operator={operator}
      legalPanel={<><AdminOperations summary={{ ...operational.data as OperationalSummary, pendingEmails }} /><AdminLegal contactEmail={operator.email} smtpReady={smtpConfigured()} withdrawals={(withdrawals.data ?? []).map(row => ({ id: String(row.id), userId: row.user_id ? String(row.user_id) : null, email: String(row.email), statement: String(row.statement), receivedAt: String(row.received_at), emailSent: Boolean(row.email_sent_at), orderId: String(row.checkout_session_id) }))} /></>}
    />
  );
}
