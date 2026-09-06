import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  normalizePublicPlan,
  planIdSchema,
} from "@/domain/billing";
import { CheckoutPlans } from "@/components/checkout-plans";
import { isPlatformAdminIdentity } from "@/lib/platform-admin";
import { stripeConfigured } from "@/lib/stripe";
import { supabaseConfigured } from "@/lib/supabase/config";
import { authenticatedContext } from "@/server/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Plan i płatność — SmartFach", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ plan?: string; anulowano?: string }> }) {
  if (!supabaseConfigured()) redirect("/logowanie");
  const context = await authenticatedContext();
  if (
    isPlatformAdminIdentity({ userId: context.userId, email: context.email })
  )
    redirect("/admin");
  const { data } = await context.supabase
    .from("subscriptions")
    .select("status, plan")
    .eq("organization_id", context.organizationId)
    .maybeSingle();
  const params = await searchParams;
  const requested = planIdSchema.safeParse(params.plan);
  const stored = planIdSchema.safeParse(data?.plan);
  const initialPlan = normalizePublicPlan(
    requested.success ? requested.data : stored.success ? stored.data : undefined,
  );
  return <CheckoutPlans initialPlan={initialPlan} currentStatus={data?.status ? String(data.status) : undefined} configured={stripeConfigured()} canceled={params.anulowano === "1"} />;
}
