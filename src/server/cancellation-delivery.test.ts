import type Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const m = vi.hoisted(() => ({ from: vi.fn(), rpc: vi.fn(), send: vi.fn(), after: vi.fn(), retrieve: vi.fn(), getUser: vi.fn() }));
vi.mock("next/server", () => ({ after: m.after }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: () => ({ from: m.from, rpc: m.rpc, auth: { admin: { getUserById: m.getUser } } }) }));
vi.mock("@/lib/stripe", () => ({ getStripe: () => ({ subscriptions: { retrieve: m.retrieve } }), planForStripePriceId: () => "lite" }));
vi.mock("./transactional-email", () => ({ sendCancellationEmail: m.send, smtpConfigured: () => true }));
vi.mock("./operator-settings", () => ({ getOperator: async () => ({ email: "support@example.test" }) }));
import { deliverCancellationEmail, queueCancellationEmail, retryPendingCancellationEmails } from "./cancellation-delivery";

const snapshot = {
  id: "sub_synthetic", status: "trialing", canceled_at: 1000, cancel_at: 2000, cancel_at_period_end: true,
  trial_start: 500, trial_end: 2000, metadata: { user_id: "user", organization_id: "org", plan: "lite" },
  items: { data: [{ current_period_end: 2000, price: { id: "price_synthetic" } }] },
} as unknown as Stripe.Subscription;
const id = "sub_synthetic-1000";
let sent: string | null, suppressed: string | null, claim: string | null;
let saveFails: boolean, markFails: boolean;
beforeEach(() => {
  vi.resetAllMocks(); sent = suppressed = claim = null; saveFails = markFails = false;
  m.send.mockResolvedValue(undefined); m.retrieve.mockResolvedValue(snapshot);
  m.getUser.mockResolvedValue({ data: { user: { email: "buyer@example.test" } }, error: null });
  m.rpc.mockImplementation(async () => {
    if (sent || suppressed || (claim && Date.parse(claim) > Date.now() - 120_000)) return { data: false, error: null };
    claim = new Date().toISOString(); return { data: true, error: null };
  });
  m.from.mockImplementation(() => {
    let operation = "read", list = false, update: Record<string, string> = {};
    const q: Record<string, ReturnType<typeof vi.fn>> = {};
    for (const method of ["select", "eq", "is", "or", "order", "maybeSingle"]) q[method] = vi.fn().mockImplementation(() => q);
    q.upsert = vi.fn().mockImplementation(() => { operation = "save"; return q; });
    q.update = vi.fn().mockImplementation(value => { operation = "mark"; update = value; return q; });
    q.limit = vi.fn().mockImplementation(() => { list = true; return q; });
    q.then = vi.fn().mockImplementation((resolve: (value: unknown) => unknown) => {
      let result: unknown;
      if (operation === "save") result = { error: saveFails ? {} : null };
      else if (operation === "mark") {
        if (!markFails) { sent = update.email_sent_at ?? null; suppressed = update.suppressed_at ?? null; }
        result = { data: markFails ? null : { id }, error: markFails ? {} : null };
      } else if (list) result = { data: [{ id }], error: null };
      else result = { data: { id, user_id: "user", organization_id: "org", subscription_id: snapshot.id, delivery_claimed_at: claim, email_sent_at: sent, suppressed_at: suppressed }, error: null };
      return Promise.resolve(result).then(resolve);
    });
    return q;
  });
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe("cancellation outbox", () => {
  it("persists before background delivery, never blocking a webhook on SMTP", async () => {
    await queueCancellationEmail(snapshot, snapshot);
    expect(m.from).toHaveBeenCalledWith("subscription_cancellation_emails");
    expect(m.after).toHaveBeenCalledTimes(1); expect(m.send).not.toHaveBeenCalled();
  });
  it("rejects failed persistence and preserves pending mail when scheduling fails", async () => {
    saveFails = true;
    await expect(queueCancellationEmail(snapshot, snapshot)).rejects.toThrow("persistence");
    expect(m.after).not.toHaveBeenCalled();
    saveFails = false; m.after.mockImplementation(() => { throw new Error("request ended"); });
    await expect(queueCancellationEmail(snapshot, snapshot)).resolves.toBeUndefined();
  });
  it("ignores out-of-order cancellation events and resumed subscriptions", async () => {
    await queueCancellationEmail({ ...snapshot, canceled_at: 1500 }, snapshot);
    await queueCancellationEmail({ ...snapshot, canceled_at: null, cancel_at: null, cancel_at_period_end: false }, snapshot);
    expect(m.from).not.toHaveBeenCalled();
  });
  it("serializes deliveries and skips sent confirmations", async () => {
    expect(await Promise.all([deliverCancellationEmail(id), deliverCancellationEmail(id)])).toEqual(["sent", "skipped"]);
    expect(await deliverCancellationEmail(id)).toBe("skipped");
    expect(m.send).toHaveBeenCalledTimes(1);
    expect(m.send).toHaveBeenCalledWith(expect.objectContaining({ recipient: "buyer@example.test", messageId: id }));
  });
  it("retries SMTP failure after backoff", async () => {
    m.send.mockRejectedValueOnce(new Error("SMTP down"));
    expect(await retryPendingCancellationEmails()).toEqual({ attempted: 1, sent: 0, failed: 1 });
    expect(sent).toBeNull(); expect(claim).not.toBeNull();
    claim = new Date(Date.now() - 180_000).toISOString();
    expect(await retryPendingCancellationEmails()).toEqual({ attempted: 1, sent: 1, failed: 0 });
  });
  it("suppresses an unsent confirmation after resumption", async () => {
    m.retrieve.mockResolvedValue({ ...snapshot, cancel_at: null, canceled_at: null, cancel_at_period_end: false });
    expect(await deliverCancellationEmail(id)).toBe("skipped");
    expect(suppressed).not.toBeNull(); expect(m.send).not.toHaveBeenCalled();
  });
  it.each(["user_id", "organization_id"])("refuses to send to a mismatched %s", async field => {
    m.retrieve.mockResolvedValue({ ...snapshot, metadata: { ...snapshot.metadata, [field]: "other" } });
    await expect(deliverCancellationEmail(id)).rejects.toThrow("ownership");
    expect(m.send).not.toHaveBeenCalled();
  });
  it("does not acknowledge failed delivery bookkeeping", async () => {
    markFails = true;
    await expect(deliverCancellationEmail(id)).rejects.toThrow("completion");
    expect(sent).toBeNull();
  });
});
