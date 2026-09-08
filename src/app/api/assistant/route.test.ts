import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/server/auth", () => ({ AuthenticationRequired: class extends Error {}, SubscriptionRequired: class extends Error {}, authenticatedContext: vi.fn(), requireSubscription: vi.fn() }));
vi.mock("@/server/assistant-service", () => ({ aiConfigured: () => true, publicAiConfiguration: () => ({}), callAssistant: vi.fn() }));
vi.mock("@/server/supabase-workspace-repository", () => ({ readWorkspace: vi.fn() }));
vi.mock("@/server/operations", () => ({ assertDeploymentIdentity: vi.fn(), recordMilestone: vi.fn() }));
vi.mock("@/server/usage-requests", () => ({
  UsageLimitExceeded: class extends Error {},
  UsageRequestError: class extends Error { constructor(public status:number, public code:string, text:string) { super(text); } },
  beginUsage: vi.fn(), finishUsage: vi.fn(), failUsage: vi.fn(), markUncertainUsage: vi.fn(),
}));
import { POST } from "./route";
import { authenticatedContext, requireSubscription, AuthenticationRequired, SubscriptionRequired } from "@/server/auth";
import { callAssistant } from "@/server/assistant-service";
import { beginUsage, finishUsage, failUsage, markUncertainUsage, UsageRequestError } from "@/server/usage-requests";
import { ProviderRejectedError } from "@/server/provider-errors";

const input = { clientId:null, idempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", messages: [{ role: "user", content: "Pomóż mi przygotować ofertę" }] };
const request = (body:unknown=input) => new Request("https://test.invalid/api/assistant", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(body) });
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(authenticatedContext).mockResolvedValue({ userId:"user", organizationId:"org" } as Awaited<ReturnType<typeof authenticatedContext>>);
  vi.mocked(failUsage).mockResolvedValue(true);
  vi.mocked(beginUsage).mockResolvedValue(null);
  vi.mocked(callAssistant).mockResolvedValue({ reply:"Gotowe", sources:[], model:"test", quote:null, report:null });
  vi.mocked(finishUsage).mockResolvedValue({ reply:"Gotowe" });
  vi.spyOn(console,"error").mockImplementation(()=>{});
});
describe("assistant route cost boundary", () => {
  it("requires a stable key before dispatch",async()=>{
    const r=await POST(request({messages:input.messages})); expect(r.status).toBe(400); expect(callAssistant).not.toHaveBeenCalled();
  });
  it("refuses anonymous users",async()=>{
    vi.mocked(authenticatedContext).mockRejectedValue(new AuthenticationRequired());
    expect((await POST(request())).status).toBe(401); expect(beginUsage).not.toHaveBeenCalled(); expect(callAssistant).not.toHaveBeenCalled();
  });
  it("requires verified payment entitlement even for replay",async()=>{
    vi.mocked(requireSubscription).mockRejectedValue(new SubscriptionRequired());
    expect((await POST(request())).status).toBe(402); expect(beginUsage).not.toHaveBeenCalled(); expect(callAssistant).not.toHaveBeenCalled();
  });
  it("replays without invoking or charging AI again",async()=>{
    vi.mocked(beginUsage).mockResolvedValue({reply:"Saved"});
    expect(await (await POST(request())).json()).toMatchObject({reply:"Saved"});
    expect(callAssistant).not.toHaveBeenCalled(); expect(finishUsage).not.toHaveBeenCalled();
  });
  it("does not dispatch when the database reservation is busy",async()=>{
    vi.mocked(beginUsage).mockRejectedValue(new UsageRequestError(409,"busy","busy"));
    expect((await POST(request())).status).toBe(409); expect(callAssistant).not.toHaveBeenCalled();
  });
  it("returns success only after atomic settlement",async()=>{
    expect((await POST(request())).status).toBe(200);
    expect(callAssistant).toHaveBeenCalledTimes(1); expect(finishUsage).toHaveBeenCalledTimes(1); expect(failUsage).not.toHaveBeenCalled();
  });
  it("retains the receipt on ambiguous database errors",async()=>{
    vi.mocked(finishUsage).mockRejectedValue(new Error("Database timeout"));
    expect((await POST(request())).status).toBe(502); expect(failUsage).not.toHaveBeenCalled();
  });
  it("releases definitive provider rejections",async()=>{
    vi.mocked(callAssistant).mockRejectedValue(new ProviderRejectedError("Rejected"));
    const r=await POST(request()); expect(await r.json()).toMatchObject({code:"provider_failed"});
    expect(failUsage).toHaveBeenCalledTimes(1); expect(finishUsage).not.toHaveBeenCalled();
  });
  it("preserves uncertain provider timeouts for review",async()=>{
    vi.mocked(callAssistant).mockRejectedValue(new DOMException("timeout","TimeoutError"));
    const r=await POST(request()); expect(await r.json()).toMatchObject({code:"uncertain"});
    expect(failUsage).not.toHaveBeenCalled(); expect(markUncertainUsage).toHaveBeenCalledTimes(1);
  });
});
