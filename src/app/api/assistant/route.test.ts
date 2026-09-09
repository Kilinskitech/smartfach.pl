import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ after: vi.fn() }));
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
import { ProviderOutputError, ProviderRejectedError } from "@/server/provider-errors";
import { readWorkspace } from "@/server/supabase-workspace-repository";
import { fixtureWorkspace } from "@/test/fixtures";
import { readAssistantResponse } from "@/lib/assistant-response";
import { after } from "next/server";

const input = { clientId:null, idempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", messages: [{ role: "user", content: "Pomóż mi przygotować ofertę" }] };
const request = (body:unknown=input) => new Request("https://test.invalid/api/assistant", { method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify(body) });
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(authenticatedContext).mockResolvedValue({ userId:"user", organizationId:"org" } as Awaited<ReturnType<typeof authenticatedContext>>);
  vi.mocked(failUsage).mockResolvedValue(true);
  vi.mocked(beginUsage).mockResolvedValue(null);
  vi.mocked(readWorkspace).mockResolvedValue(fixtureWorkspace());
  vi.mocked(callAssistant).mockResolvedValue({ reply:"Gotowe", sources:[], model:"test", quote:null, report:null });
  vi.mocked(finishUsage).mockResolvedValue({ reply:"Gotowe" });
  vi.spyOn(console,"error").mockImplementation(()=>{});
});
describe("assistant route cost boundary", () => {
  it("answers an exact greeting without model, reservation or charge after access checks", async () => {
    const result = await (await POST(request({ ...input, messages: [{ role: "user", content: "Hej!" }] }))).json();
    expect(result).toMatchObject({ model: "smartfach/system-greeting", billing: fixtureWorkspace().billing });
    expect(requireSubscription).toHaveBeenCalledOnce();
    expect(beginUsage).not.toHaveBeenCalled(); expect(callAssistant).not.toHaveBeenCalled(); expect(finishUsage).not.toHaveBeenCalled();
  });
  it("does not answer greetings to unpaid accounts", async () => {
    vi.mocked(requireSubscription).mockRejectedValue(new SubscriptionRequired());
    expect((await POST(request({ ...input, messages: [{ role: "user", content: "hej" }] }))).status).toBe(402);
  });
  it("starts no reservation when workspace cannot be read", async () => {
    vi.mocked(readWorkspace).mockRejectedValue(new Error("db unavailable"));
    expect((await POST(request())).status).toBe(502);
    expect(beginUsage).not.toHaveBeenCalled(); expect(callAssistant).not.toHaveBeenCalled();
  });
  it("streams preview before settlement but commits result only after settlement", async () => {
    let settle!: () => void;
    vi.mocked(finishUsage).mockImplementation(async () => { await new Promise<void>((resolve) => { settle = resolve; }); return { reply: "Gotowe" }; });
    vi.mocked(callAssistant).mockImplementation(async (_input, _workspace, _fetch, _user, onReply) => {
      onReply?.("Pierwsze słowa");
      return { reply:"Gotowe", sources:[], model:"test", quote:null, report:null };
    });
    const req = request(); req.headers.set("accept", "text/event-stream");
    const response = await POST(req);
    const preview = vi.fn();
    let completed = false;
    const reading = readAssistantResponse(response, preview).then((value) => { completed = true; return value; });
    await vi.waitFor(() => expect(preview).toHaveBeenCalledWith("Pierwsze słowa"));
    expect(completed).toBe(false);
    settle();
    expect(await reading).toMatchObject({ reply: "Gotowe" });
    expect(finishUsage).toHaveBeenCalledOnce();
  });
  it("sends stream errors without committing a partial answer", async () => {
    vi.mocked(callAssistant).mockImplementation(async (_input, _workspace, _fetch, _user, onReply) => {
      onReply?.("Niepełny tekst"); throw new Error("network lost");
    });
    const req = request(); req.headers.set("accept", "text/event-stream");
    expect(await readAssistantResponse(await POST(req), vi.fn())).toMatchObject({ code: "uncertain" });
    expect(finishUsage).not.toHaveBeenCalled(); expect(markUncertainUsage).toHaveBeenCalledOnce();
  });
  it("continues settlement after client disconnect without another model call", async () => {
    let complete!: () => void;
    vi.mocked(callAssistant).mockImplementation(async () => {
      await new Promise<void>((resolve) => { complete = resolve; });
      return { reply:"Gotowe", sources:[], model:"test", quote:null, report:null };
    });
    const req = request(); req.headers.set("accept", "text/event-stream");
    const response = await POST(req);
    await response.body!.cancel();
    complete();
    // Next after retains the work beyond the disconnected response.
    const retainWork = vi.mocked(after).mock.calls[0]![0] as () => Promise<void>;
    await retainWork();
    expect(finishUsage).toHaveBeenCalledOnce(); expect(callAssistant).toHaveBeenCalledOnce();
  });
  it("releases an invalid completed reply without charging or requiring manual review", async () => {
    vi.mocked(callAssistant).mockRejectedValue(new ProviderOutputError("Invalid format"));
    const response = await POST(request());
    expect(await response.json()).toMatchObject({ code: "provider_failed" });
    expect(failUsage).toHaveBeenCalledOnce();
    expect(finishUsage).not.toHaveBeenCalled();
    expect(markUncertainUsage).not.toHaveBeenCalled();
  });
  it("keeps an invalid reply reserved if release cannot be confirmed", async () => {
    vi.mocked(callAssistant).mockRejectedValue(new ProviderOutputError("Invalid format"));
    vi.mocked(failUsage).mockResolvedValue(false);
    expect(await (await POST(request())).json()).toMatchObject({ code: "uncertain" });
    expect(markUncertainUsage).toHaveBeenCalledOnce();
  });
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
