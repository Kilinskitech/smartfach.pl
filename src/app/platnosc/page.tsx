import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  hasSubscriptionAccess,
  normalizePublicPlan,
  planIdSchema,
} from "@/domain/billing";
import { CheckoutPlans } from "@/components/checkout-plans";
import { isPlatformAdminIdentity } from "@/lib/platform-admin";
import { stripeConfigured } from "@/lib/stripe";
import { supabaseConfigured } from "@/lib/supabase/config";
import { authenticatedContext, EmailConfirmationRequired } from "@/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plan i płatność — SmartFach", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string; anulowano?: string }> }) {
  if (!supabaseConfigured()) redirect("/logowanie");
  const context = await authenticatedContext().catch((error) => {
    if (error instanceof EmailConfirmationRequired)
      redirect("/logowanie?blad=potwierdz-email");
    throw error;
  });
  if (
    isPlatformAdminIdentity({ userId: context.userId, email: context.email })
  )
    redirect("/admin");
  const { data } = await context.supabase
    .from("subscriptions")
    .select("status, plan, trial_ends_at, payment_method_attached, stripe_subscription_id")
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  const params = await searchParams;
  const { data: organization, error: orgError } = await createAdminClient().from("organizations").select("trial_consumed_at").eq("id",context.organizationId).single();
  if (orgError) throw new Error("Nie można sprawdzić uprawnienia do próby.");
  const requested = planIdSchema.safeParse(params.plan);
  const stored = planIdSchema.safeParse(data?.plan);
  const initialPlan = normalizePublicPlan(
    requested.success ? requested.data : stored.success ? stored.data : undefined,
  );
  const currentStatus = data?.status ? String(data.status) : undefined;
  const currentAccessAllowed = currentStatus
    ? hasSubscriptionAccess({
        status: currentStatus,
        paymentMethodAttached: Boolean(data?.payment_method_attached),
        trialEndsAt: data?.trial_ends_at ? String(data.trial_ends_at) : null,
      })
    : false;
  return <CheckoutPlans linkedSubscription={Boolean(data?.stripe_subscription_id)} trialEligible={!organization.trial_consumed_at} initialPlan={initialPlan} currentStatus={currentStatus} currentAccessAllowed={currentAccessAllowed} configured={stripeConfigured()} canceled={params.anulowano === "1"} />;
}
