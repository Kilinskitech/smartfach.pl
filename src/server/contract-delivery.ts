import "server-only";
import { after } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendContractEmail, smtpConfigured } from "./transactional-email";

export async function countOverdueContractEmails() {
  const cutoff = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count, error } = await createAdminClient().from("purchase_contracts")
    .select("checkout_session_id", { count: "exact", head: true })
    .is("email_sent_at", null).not("user_id", "is", null).lt("created_at", cutoff);
  if (error) throw new Error("Nie można sprawdzić kolejki potwierdzeń e-mail.");
  return count ?? 0;
}

/** Existing atomic two-minute lease serializes cron, webhook and success-page delivery. */
export async function deliverContract(sessionId: string): Promise<"sent" | "skipped"> {
  if (!smtpConfigured()) throw new Error("SMTP is not configured");
  const admin = createAdminClient();
  const { data: claimed, error: claimError } = await admin.rpc("claim_contract_delivery", { session_id: sessionId });
  if (claimError) throw new Error("Contract claim failed");
  if (claimed !== true) return "skipped";
  // Retain the claim timestamp after failures: it provides retry backoff and fairness.
  const { data: contract, error } = await admin.from("purchase_contracts")
    .select("body,recipient,acceptance_id,user_id,delivery_claimed_at,email_sent_at")
    .eq("checkout_session_id", sessionId).single();
  if (error || !contract?.delivery_claimed_at) throw new Error("Contract read failed");
  if (contract.email_sent_at || !contract.user_id) return "skipped";
  const claim = String(contract.delivery_claimed_at);
  const { data: acceptance, error: acceptanceError } = await admin.from("purchase_acceptances")
    .select("snapshot").eq("id", contract.acceptance_id).single();
  if (acceptanceError) throw new Error("Contract sender read failed");
  const snapshot = z.object({ operator: z.object({ email: z.email() }) }).parse(acceptance?.snapshot);
  await sendContractEmail({ recipient: contract.recipient, body: contract.body, sessionId, replyTo: snapshot.operator.email });
  const { data: completed, error: markError } = await admin.from("purchase_contracts")
    .update({ email_sent_at: new Date().toISOString(), delivery_claimed_at: null })
    .eq("checkout_session_id", sessionId).eq("delivery_claimed_at", claim).is("email_sent_at", null)
    .select("checkout_session_id").maybeSingle();
  if (markError || !completed) throw new Error("Contract completion failed");
  return "sent";
}

export function scheduleContractDelivery(sessionId: string) {
  try {
    after(async () => {
      try { await deliverContract(sessionId); }
      catch { console.error("contract_delivery_pending", { sessionId }); }
    });
  } catch {
    // Scheduling is best effort, persistence is not. Cron remains responsible.
    console.error("contract_delivery_schedule_failed", { sessionId });
  }
}

export async function retryPendingContracts() {
  if (!smtpConfigured()) throw new Error("SMTP is not configured");
  const cutoff = new Date(Date.now() - 2 * 60_000).toISOString();
  const { data, error } = await createAdminClient().from("purchase_contracts")
    .select("checkout_session_id").is("email_sent_at", null).not("user_id", "is", null)
    .or(`delivery_claimed_at.is.null,delivery_claimed_at.lt.${cutoff}`)
    .order("delivery_claimed_at", { ascending: true, nullsFirst: true })
    .order("created_at", { ascending: true }).order("checkout_session_id", { ascending: true }).limit(5);
  if (error) throw new Error("Contract queue read failed");
  // Five parallel bounded SMTP attempts fit within the cron's 60-second budget.
  const results = await Promise.all((data ?? []).map(async row => {
    try { return await deliverContract(String(row.checkout_session_id)); }
    catch {
      console.error("contract_delivery_retry_failed", { sessionId: row.checkout_session_id });
      return "failed";
    }
  }));
  return { attempted: results.length, sent: results.filter(r => r === "sent").length, failed: results.filter(r => r === "failed").length };
}
