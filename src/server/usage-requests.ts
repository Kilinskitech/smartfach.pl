import "server-only";
import { createHash } from "node:crypto";
import { billingSchema, estimateRequestCredits, settleRequestCredits } from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import type { assistantRequestSchema } from "@/domain/assistant";
import type { z } from "zod";
import type { callAssistant } from "./assistant-service";
type Input = z.infer<typeof assistantRequestSchema>;
type Result = Awaited<ReturnType<typeof callAssistant>>;
export class UsageLimitExceeded extends Error {}
export class UsageRequestError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function requestFingerprint(input: Input) {
  const { idempotencyKey: _key, ...payload } = input;
  void _key;
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
export async function beginUsage(org: string, actor: string, input: Input) {
  if (!input.idempotencyKey) throw new UsageRequestError(400, "missing_request_key", "Odśwież aplikację przed wysłaniem wiadomości.");
  const { data, error } = await createAdminClient().rpc("begin_ai_request", {
    org, actor, request_key: input.idempotencyKey, fingerprint: requestFingerprint(input), minimum_credits: estimateRequestCredits(input.attachments),
  });
  if (error) throw new Error("Nie udało się zarezerwować limitu. Zapytanie AI nie zostało wysłane.");
  if (data?.status === "started") return null;
  if (data?.status === "replay") return { ...data.response, billing: billingSchema.parse(data.billing), workspaceRevision: Number(data.revision) };
  if (data?.status === "limit") throw new UsageLimitExceeded("Limit Twojego planu został wykorzystany lub jest zarezerwowany przez poprzednie zadanie.");
  const messages: Record<string, string> = {
    busy: "Poprzednia odpowiedź jeszcze powstaje. Spróbuj za chwilę.", conflict: "To żądanie ma już inną treść. Odśwież aplikację.",
    rate_limit: "Osiągnięto limit 20 zapytań na godzinę. Spróbuj później.", uncertain: "Poprzednie zapytanie wymaga sprawdzenia. Skontaktuj się z obsługą.",
    failed: "Poprzednia próba zakończyła się błędem. Wyślij wiadomość ponownie.", expired: "Wynik tej próby wygasł. Sprawdź zapisaną rozmowę.",
  };
  throw new UsageRequestError(data?.status === "rate_limit" ? 429 : 409, data?.status ?? "unknown", messages[data?.status] ?? "Nie można rozpocząć zapytania.");
}
export async function finishUsage(org: string, actor: string, input: Input, result: Result) {
  const { data, error } = await createAdminClient().rpc("finish_ai_request", {
    org, actor, request_key: input.idempotencyKey, result,
    charged_credits: settleRequestCredits(input.attachments, result.sources.length > 0, result.usage?.costUsd),
  });
  if (error || !data) throw new Error("Nie zapisano wyniku. Ponów tę samą wiadomość za chwilę; w razie dalszego błędu skontaktuj się z obsługą.");
  return { ...data.response, billing: billingSchema.parse(data.billing), workspaceRevision: Number(data.revision) };
}
export async function failUsage(org: string, actor: string, key: string) {
  const { error } = await createAdminClient().rpc("fail_ai_request", { org, actor, request_key: key });
  if (error) console.error("ai_request_release_failed", { requestKey: key });
  return !error;
}
export async function markUncertainUsage(org: string, actor: string, key: string) {
  const { error } = await createAdminClient().from("ai_requests").update({ state: "uncertain" })
    .eq("organization_id", org).eq("user_id", actor).eq("request_key", key).eq("state", "pending");
  if (error) console.error("ai_request_uncertain_update_failed", { requestKey: key });
}
