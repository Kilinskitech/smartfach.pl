import "server-only";
import { billingSchema, plans, type PlanId } from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";

export class UsageLimitExceeded extends Error {}

export async function chargeWorkspaceUsage(input: {
  organizationId: string;
  userId: string;
  idempotencyKey: string;
  credits: number;
  plan: PlanId;
  providerRequestId?: string;
}) {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("charge_usage_credits", {
    target_organization_id: input.organizationId,
    target_user_id: input.userId,
    target_idempotency_key: input.idempotencyKey,
    target_charged_credits: input.credits,
    target_monthly_credits: plans[input.plan].monthlyCredits,
    target_provider_request_id: input.providerRequestId ?? null,
  });
  if (error?.message.includes("Limit planu został wykorzystany"))
    throw new UsageLimitExceeded("Limit Twojego planu został wykorzystany.");
  if (error) {
    console.error("Nie zapisano rozliczenia użycia AI", {
      code: error.code,
      idempotencyKey: input.idempotencyKey,
    });
    throw new Error("Nie udało się bezpiecznie rozliczyć użycia AI.");
  }
  if (!Array.isArray(data) || !data[0])
    throw new Error("Baza nie zwróciła rozliczenia użycia AI.");
  const row = data[0] as { revision: number; billing: unknown };
  return {
    revision: Number(row.revision),
    billing: billingSchema.parse(row.billing),
  };
}
