import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const m = vi.hoisted(() => ({ identity: vi.fn(), retry: vi.fn(), cancellations: vi.fn() }));
vi.mock("@/server/operations", () => ({ assertDeploymentIdentity: m.identity }));
vi.mock("@/server/contract-delivery", () => ({ retryPendingContracts: m.retry }));
vi.mock("@/server/cancellation-delivery", () => ({ retryPendingCancellationEmails: m.cancellations }));
import { GET } from "./route";
const request = (auth?: string) => new Request("https://test.invalid/api/maintenance/contract-emails", { headers: auth ? { authorization: auth } : {} });
beforeEach(() => { vi.resetAllMocks(); m.cancellations.mockResolvedValue({ attempted: 0, sent: 0, failed: 0 }); vi.stubEnv("CRON_SECRET", "synthetic-test-secret"); vi.spyOn(console, "error").mockImplementation(() => {}); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
describe("contract email cron", () => {
  it("rejects unauthenticated and incorrect secrets before accessing data", async () => {
    for (const auth of [undefined, "Bearer wrong", "Bearer synthetic-test-secrex"]) expect((await GET(request(auth))).status).toBe(401);
    expect(m.identity).not.toHaveBeenCalled(); expect(m.retry).not.toHaveBeenCalled(); expect(m.cancellations).not.toHaveBeenCalled();
  });
  it("fails closed when the cron secret is missing", async () => {
    vi.stubEnv("CRON_SECRET", ""); expect((await GET(request("Bearer "))).status).toBe(401);
  });
  it("blocks the wrong deployment before sending mail", async () => {
    m.identity.mockRejectedValue(new Error("wrong database"));
    expect((await GET(request("Bearer synthetic-test-secret"))).status).toBe(503); expect(m.retry).not.toHaveBeenCalled();
  });
  it("reports completed and failed attempts accurately", async () => {
    m.retry.mockResolvedValue({ attempted: 2, sent: 2, failed: 0 });
    expect((await GET(request("Bearer synthetic-test-secret"))).status).toBe(200);
    m.retry.mockResolvedValue({ attempted: 2, sent: 1, failed: 1 });
    expect((await GET(request("Bearer synthetic-test-secret"))).status).toBe(503);
  });
  it("reports cancellation failures and processes that queue even if contracts fail", async () => {
    m.retry.mockResolvedValue({ attempted: 0, sent: 0, failed: 0 });
    m.cancellations.mockResolvedValue({ attempted: 1, sent: 0, failed: 1 });
    expect((await GET(request("Bearer synthetic-test-secret"))).status).toBe(503);
    m.retry.mockRejectedValue(new Error("contract DB down"));
    expect((await GET(request("Bearer synthetic-test-secret"))).status).toBe(503);
    expect(m.cancellations).toHaveBeenCalledTimes(2);
  });
});
