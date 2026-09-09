import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const m = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn(), send: vi.fn(), after: vi.fn(), smtp: vi.fn() }));
vi.mock("next/server", () => ({ after: m.after }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: m.from, rpc: m.rpc, auth: { admin: { getUserById: async () => ({ data: { user: { email: "buyer@example.test" } }, error: null }) } } }) }));
vi.mock("./transactional-email", () => ({ sendContractEmail: m.send, smtpConfigured: m.smtp }));
import { deliverContract, retryPendingContracts } from "./contract-delivery";
import { confirmPurchaseContract } from "./purchase-legal";
import type Stripe from "stripe";

const snapshot = { offer: "Pro", terms: "terms", privacy: "privacy", termsAcknowledgement: "accepted", earlyServiceRequest: "requested", operator: { email: "support@example.test" } };
const session = { id: "cs_test_abc", status: "complete", mode: "payment", payment_status: "paid", livemode: false, metadata: { legal_acceptance_id: "acceptance", user_id: "user" } } as unknown as Stripe.Checkout.Session;
let sent: string | null, claim: string | null, persisted: boolean, saveFails: boolean, markFails: boolean;
let pending: Array<{ checkout_session_id: string }>;
beforeEach(() => {
  vi.resetAllMocks(); sent = null; claim = null; persisted = false; saveFails = false; markFails = false; pending = [];
  m.smtp.mockReturnValue(true); m.send.mockResolvedValue(undefined);
  m.rpc.mockImplementation(async () => {
    if (sent || (claim && Date.parse(claim) > Date.now() - 120_000)) return { data: false, error: null };
    claim = new Date().toISOString(); return { data: true, error: null };
  });
  m.from.mockImplementation((table: string) => {
    let operation = "read", list = false;
    const q: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const key of ["select", "eq", "single", "maybeSingle", "is", "not", "or", "order"]) q[key] = vi.fn().mockImplementation(() => q);
    q.limit = vi.fn().mockImplementation(() => { list = true; return q; });
    q.upsert = vi.fn().mockImplementation(() => { operation = "save"; return q; });
    q.update = vi.fn().mockImplementation(() => { operation = "mark"; return q; });
    q.then = vi.fn().mockImplementation((resolve: (value: unknown) => unknown) => {
      let result: unknown;
      if (table === "purchase_acceptances") result = { data: { id: "acceptance", user_id: "user", snapshot, accepted_at: "today", document_hash: "hash", document_version: "v1" }, error: null };
      else if (operation === "save") { persisted = !saveFails; result = { error: saveFails ? {} : null }; }
      else if (operation === "mark") { if (!markFails) sent = "sent"; result = { data: markFails ? null : { checkout_session_id: session.id }, error: markFails ? {} : null }; }
      else if (list) result = { data: pending, error: null };
      else result = { data: { body: "immutable contract", recipient: "buyer@example.test", acceptance_id: "acceptance", user_id: "user", delivery_claimed_at: claim, email_sent_at: sent }, error: null };
      return Promise.resolve(result).then(resolve);
    });
    return q;
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => { vi.restoreAllMocks(); });

describe("durable contract outbox", () => {
  it("returns after persistence, without waiting for SMTP", async () => {
    m.send.mockImplementation(() => new Promise(() => {}));
    await confirmPurchaseContract(session);
    expect(persisted).toBe(true); expect(m.after).toHaveBeenCalledTimes(1); expect(m.send).not.toHaveBeenCalled();
  });
  it("does not enqueue if persistence fails", async () => {
    saveFails = true;
    await expect(confirmPurchaseContract(session)).rejects.toThrow("Nie zapisano");
    expect(m.after).not.toHaveBeenCalled();
  });
  it("keeps the durable row when scheduling fails", async () => {
    m.after.mockImplementation(() => { throw new Error("request ended"); });
    await expect(confirmPurchaseContract(session)).resolves.toBeUndefined(); expect(persisted).toBe(true);
  });
  it("records background failure without rejecting an acknowledged purchase", async () => {
    m.send.mockRejectedValue(new Error("SMTP down"));
    await confirmPurchaseContract(session);
    const callback = m.after.mock.calls[0]?.[0] as (() => Promise<void>) | undefined;
    expect(callback).toBeTypeOf("function");
    await expect(callback!()).resolves.toBeUndefined();
    expect(sent).toBeNull(); expect(claim).not.toBeNull();
  });
  it("retries an expired failed delivery using the stored copy", async () => {
    claim = new Date(Date.now() - 180_000).toISOString(); pending = [{ checkout_session_id: session.id }];
    expect(await retryPendingContracts()).toEqual({ attempted: 1, sent: 1, failed: 0 });
    expect(m.send).toHaveBeenCalledWith({ recipient: "buyer@example.test", body: "immutable contract", sessionId: session.id, replyTo: "support@example.test" });
  });
  it("does not send concurrently or send already completed messages again", async () => {
    expect(await Promise.all([deliverContract(session.id), deliverContract(session.id)])).toEqual(["sent", "skipped"]);
    expect(await deliverContract(session.id)).toBe("skipped"); expect(m.send).toHaveBeenCalledTimes(1);
  });
  it("does not mark SMTP failures as delivered and leaves backoff intact", async () => {
    pending = [{ checkout_session_id: session.id }]; m.send.mockRejectedValue(new Error("SMTP down"));
    expect(await retryPendingContracts()).toEqual({ attempted: 1, sent: 0, failed: 1 });
    expect(sent).toBeNull(); expect(claim).not.toBeNull();
  });
  it("surfaces an unsuccessful delivery marker so the queue can recover", async () => {
    markFails = true;
    await expect(deliverContract(session.id)).rejects.toThrow("completion"); expect(sent).toBeNull();
  });
});
