import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only",()=>({}));
const m=vi.hoisted(()=>({from:vi.fn(),rpc:vi.fn(),retrieve:vi.fn(),sync:vi.fn(),contract:vi.fn(),grant:vi.fn(),operation:vi.fn()}));
vi.mock("@/lib/stripe",()=>({getStripe:()=>({webhooks:new Stripe("sk_test_synthetic").webhooks,subscriptions:{retrieve:m.retrieve}})}));
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:()=>({from:m.from,rpc:m.rpc})}));
vi.mock("@/server/stripe-subscriptions",()=>({syncSubscription:m.sync}));
vi.mock("@/server/purchase-legal",()=>({confirmPurchaseContract:m.contract}));
vi.mock("@/server/stripe-top-ups",()=>({grantUsageTopUpFromSession:m.grant}));
vi.mock("@/server/operations",()=>({assertDeploymentIdentity:vi.fn(),recordMilestone:vi.fn(),withOperation:m.operation,OperationBusy:class extends Error{}}));
import { POST } from "./route";
import { OperationBusy } from "@/server/operations";
const secret="whsec_synthetic_never_real";
const event={id:"evt_test",type:"checkout.session.completed",livemode:false,data:{object:{subscription:"sub_test",metadata:{organization_id:"org",user_id:"user",plan:"lite"}}}};
function request(value:unknown=event,valid=true){
  const payload=JSON.stringify(value);
  const signature=new Stripe("sk_test_synthetic").webhooks.generateTestHeaderString({payload,secret:valid?secret:"wrong"});
  return new Request("https://test.invalid/api/stripe/webhook",{method:"POST",body:payload,headers:{"stripe-signature":signature}});
}
let processed=false;
beforeEach(()=>{
  vi.resetAllMocks();vi.stubEnv("STRIPE_WEBHOOK_SECRET",secret);vi.stubEnv("STRIPE_SECRET_KEY","sk_test_synthetic");processed=false;
  m.operation.mockImplementation(async(_key:string,run:(token:string)=>unknown)=>run("lease"));
  m.from.mockImplementation(()=>{
    const query={select:vi.fn(),eq:vi.fn(),maybeSingle:vi.fn(),upsert:vi.fn(),then:vi.fn()};
    for(const method of ["select","eq","maybeSingle","upsert"] as const) query[method].mockReturnValue(query);
    query.then.mockImplementation((resolve:(r:unknown)=>unknown)=>Promise.resolve({data:{processed_at:processed?"done":null},error:null}).then(resolve));
    return query;
  });
  m.rpc.mockResolvedValue({data:true,error:null});m.retrieve.mockResolvedValue({id:"sub_test"});m.sync.mockResolvedValue({trial_end:123});
  vi.spyOn(console,"error").mockImplementation(()=>{});
});
afterEach(()=>{vi.unstubAllEnvs();vi.restoreAllMocks();});
describe("signed Stripe webhook",()=>{
  it("rejects invalid signatures before touching data",async()=>{
    expect((await POST(request(event,false))).status).toBe(400);expect(m.from).not.toHaveBeenCalled();
  });
  it("rejects a Live event on a Sandbox installation",async()=>{
    expect((await POST(request({...event,livemode:true}))).status).toBe(400);expect(m.from).not.toHaveBeenCalled();
  });
  it("acknowledges an already processed event without side effects",async()=>{
    processed=true;expect((await POST(request())).status).toBe(200);expect(m.sync).not.toHaveBeenCalled();expect(m.contract).not.toHaveBeenCalled();
  });
  it("marks completion only after subscription and durable contract persistence have succeeded",async()=>{
    expect((await POST(request())).status).toBe(200);
    expect(m.sync).toHaveBeenCalledTimes(1);expect(m.contract).toHaveBeenCalledTimes(1);
    expect(m.rpc).toHaveBeenCalledWith("complete_stripe_event",{event_id:"evt_test",lease_token:"lease"});
  });
  it("does not acknowledge a failed subscription update",async()=>{
    m.sync.mockRejectedValue(new Error("DB failed"));expect((await POST(request())).status).toBe(500);expect(m.rpc).not.toHaveBeenCalled();
  });
  it("keeps failed contract persistence retryable",async()=>{
    m.contract.mockRejectedValue(new Error("outbox unavailable"));expect((await POST(request())).status).toBe(500);expect(m.rpc).not.toHaveBeenCalled();
  });
  it("keeps a busy purchase operation retryable",async()=>{
    m.operation.mockRejectedValue(new OperationBusy());expect((await POST(request())).status).toBe(503);expect(m.rpc).not.toHaveBeenCalled();
  });
  it("rejects an expired fencing token instead of falsely acknowledging",async()=>{
    m.rpc.mockResolvedValue({data:false,error:null});expect((await POST(request())).status).toBe(500);
  });
  it("only grants top-ups after payment, not while payment is pending",async()=>{
    const topUp={...event,data:{object:{metadata:{purchase_type:"usage_top_up",user_id:"user"},payment_status:"unpaid"}}};
    expect((await POST(request(topUp))).status).toBe(200);expect(m.grant).not.toHaveBeenCalled();
    topUp.data.object.payment_status="paid";expect((await POST(request(topUp))).status).toBe(200);expect(m.grant).toHaveBeenCalledTimes(1);
  });
});
