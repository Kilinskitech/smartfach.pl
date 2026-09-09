import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only",()=>({}));
vi.mock("next/server", () => ({ after: vi.fn() }));
const mocks = vi.hoisted(()=>({from:vi.fn(), create:vi.fn(), retrieve:vi.fn(), expire:vi.fn(), price:vi.fn(), acceptance:vi.fn()}));
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:()=>({from:mocks.from})}));
vi.mock("@/lib/stripe",()=>({applicationUrl:()=>"https://test.invalid", stripePriceId:()=>"price_test",getStripe:()=>({prices:{retrieve:mocks.price},checkout:{sessions:{create:mocks.create,retrieve:mocks.retrieve,expire:mocks.expire}}})}));
vi.mock("./purchase-legal",()=>({recordPurchaseAcceptance:mocks.acceptance}));
vi.mock("./operations",()=>({assertDeploymentIdentity:vi.fn(),recordMilestone:vi.fn(),withOperation:async(_key:string,run:()=>unknown)=>run()}));
import { createSubscriptionCheckout } from "./stripe-checkout";

let records:Record<string,Record<string,unknown>|null>;
const input = {organizationId:"org",userId:"user",email:"test@example.invalid",plan:"lite" as const,cancelPath:"/logowanie",idempotencyKey:"ignored-client-key"};
beforeEach(()=>{
  vi.resetAllMocks();
  records={organizations:{owner_user_id:"user",trial_consumed_at:null},subscriptions:null,checkout_attempts:null};
  mocks.from.mockImplementation((table:string)=>{
    let change:Record<string,unknown>|undefined;
    const query={select:vi.fn(),eq:vi.fn(),single:vi.fn(),maybeSingle:vi.fn(),upsert:vi.fn(),update:vi.fn(),then:vi.fn()};
    for(const method of ["select","eq","single","maybeSingle"] as const)query[method].mockReturnValue(query);
    query.upsert.mockImplementation((data:Record<string,unknown>)=>{change=data;return query;});
    query.update.mockImplementation((data:Record<string,unknown>)=>{change={...records[table],...data};return query;});
    query.then.mockImplementation((resolve:(value:unknown)=>unknown)=>{if(change)records[table]=change;return Promise.resolve({data:records[table],error:null}).then(resolve);});
    return query;
  });
  mocks.price.mockResolvedValue({id:"price_test",active:true,currency:"pln",unit_amount:4900,recurring:{interval:"month",interval_count:1}});
  mocks.acceptance.mockResolvedValue("acceptance_test");
  mocks.create.mockResolvedValue({id:"cs_test_one",url:"https://checkout.stripe.com/test",status:"open"});
});
describe("one trial and recoverable checkout creation",()=>{
  it("rejects a wrong price without creating a purchase", async () => {
    mocks.price.mockResolvedValue({ id: "price_wrong", active: true, currency: "pln", unit_amount: 1, recurring: { interval: "month", interval_count: 1 } });
    await expect(createSubscriptionCheckout(input)).rejects.toThrow("Nieprawidłowa cena");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("offers a first trial and persists a stable purchase key",async()=>{
    await createSubscriptionCheckout(input);
    expect(mocks.create.mock.calls[0]![0].subscription_data.trial_period_days).toBe(3);
    expect(mocks.create.mock.calls[0]![1].idempotencyKey).toBe(`checkout-v2:${records.checkout_attempts!.attempt_id}`);
    expect(records.checkout_attempts!.session_id).toBe("cs_test_one");
  });
  it("never grants another trial after cancellation",async()=>{
    records.organizations!.trial_consumed_at="2026-01-01";
    records.subscriptions={status:"canceled",stripe_customer_id:"cus_existing",trial_started_at:null};
    await createSubscriptionCheckout(input);
    const body=mocks.create.mock.calls[0]![0];
    expect(body.subscription_data.trial_period_days).toBeUndefined();
    expect(body.custom_text.submit.message).toContain("Dziś 49 zł");
    expect(body.customer).toBe("cus_existing");
    expect(body.customer_update).toMatchObject({name:"auto"});
  });
  it("also respects trials recorded in legacy subscriptions",async()=>{
    records.subscriptions={status:"canceled",trial_started_at:"2026-01-01"};
    await createSubscriptionCheckout(input);
    expect(mocks.create.mock.calls[0]![0].subscription_data.trial_period_days).toBeUndefined();
  });
  it("reuses an existing open session without creating a second",async()=>{
    records.checkout_attempts={session_id:"cs_test_one",plan:"lite"};
    mocks.retrieve.mockResolvedValue({id:"cs_test_one",url:"https://checkout.stripe.com/test",status:"open"});
    await createSubscriptionCheckout(input);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("blocks another purchase before completed checkout is synchronized",async()=>{
    records.checkout_attempts={session_id:"cs_test_one",plan:"lite"};
    mocks.retrieve.mockResolvedValue({id:"cs_test_one",status:"complete"});
    await expect(createSubscriptionCheckout(input)).rejects.toThrow("Zakup został ukończony");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("recovers the same key after a lost Stripe response",async()=>{
    mocks.create.mockRejectedValueOnce(new Error("network"));
    await expect(createSubscriptionCheckout(input)).rejects.toThrow("network");
    const firstKey=mocks.create.mock.calls[0]![1].idempotencyKey;
    await createSubscriptionCheckout(input);
    expect(mocks.create.mock.calls[1]![1].idempotencyKey).toBe(firstKey);
  });
  it("does not reuse a key past Stripe's minimum retention window",async()=>{
    records.checkout_attempts={session_id:null,plan:"lite",trial:true,attempt_id:"test",created_at:"2020-01-01"};
    await expect(createSubscriptionCheckout(input)).rejects.toThrow("wymaga sprawdzenia");
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("blocks active and delinquent subscriptions and foreign owners",async()=>{
    for(const status of ["active","trialing","past_due","unpaid"]){
      records.subscriptions={status};await expect(createSubscriptionCheckout(input)).rejects.toThrow("istniejącym abonamentem");
    }
    records.subscriptions=null;records.organizations!.owner_user_id="someone-else";
    await expect(createSubscriptionCheckout(input)).rejects.toThrow("sprawdzić konta");
    expect(mocks.create).not.toHaveBeenCalled();
  });
});
