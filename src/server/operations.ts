import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
export class OperationBusy extends Error {
  constructor() { super("Poprzednia operacja jeszcze trwa. Spróbuj za chwilę."); }
}
export async function withOperation<T>(resource: string, run: (token: string) => Promise<T>) {
  const admin = createAdminClient();
  const token = crypto.randomUUID();
  const { data, error } = await admin.rpc("claim_operation", { resource, token });
  if (error) throw new Error("Nie można zabezpieczyć operacji w bazie.");
  if (data !== true) throw new OperationBusy();
  try { return await run(token); }
  finally {
    const { error: releaseError } = await admin.from("operation_leases").delete().eq("resource", resource).eq("token", token);
    if (releaseError) console.error("operation_lease_release_failed", { resource });
  }
}
export async function recordMilestone(userId: string, event: "registered" | "checkout_opened" | "checkout_completed" | "first_answer" | "guided_start" | "paid" | "canceled" | "top_up") {
  try {
    const { error } = await createAdminClient().from("product_events").upsert({ user_id: userId, event }, { onConflict: "user_id,event", ignoreDuplicates: true });
    if (error) console.error("product_event_failed", { event, code: error.code });
  } catch { console.error("product_event_failed", { event }); }
}
export async function assertDeploymentIdentity() {
  const environment = process.env.VERCEL_ENV;
  const live = /^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY?.trim() ?? "");
  if (environment !== "production" && environment !== "preview") {
    if (live) throw new Error("Stripe Live wymaga środowiska Production.");
    return;
  }
  const { data, error } = await createAdminClient().from("deployment_identity").select("environment").eq("id", true).maybeSingle();
  if (error || (live && (!data || environment !== "production")) || (data && data.environment !== environment))
    throw new Error("Środowisko aplikacji nie zgadza się z konfiguracją bazy. Skontaktuj się z obsługą.");
}
