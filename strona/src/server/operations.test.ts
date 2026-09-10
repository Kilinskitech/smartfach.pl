import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only",()=>({}));
const m=vi.hoisted(()=>({query:vi.fn()}));
vi.mock("@/lib/supabase/admin",()=>({createAdminClient:()=>({from:()=>({select:()=>({eq:()=>({maybeSingle:m.query})})})})}));
import { assertDeploymentIdentity } from "./operations";
beforeEach(()=>{vi.resetAllMocks();vi.stubEnv("VERCEL_ENV","production");vi.stubEnv("STRIPE_SECRET_KEY","sk_test_synthetic");m.query.mockResolvedValue({data:null,error:null});});
afterEach(()=>vi.unstubAllEnvs());
describe("environment isolation guard",()=>{
  it("allows the temporary shared Sandbox before binding",async()=>{await expect(assertDeploymentIdentity()).resolves.toBeUndefined();});
  it("blocks Live without an explicit production binding",async()=>{vi.stubEnv("STRIPE_SECRET_KEY","sk_live_synthetic");await expect(assertDeploymentIdentity()).rejects.toThrow();});
  it("allows bound Production Live",async()=>{vi.stubEnv("STRIPE_SECRET_KEY","sk_live_synthetic");m.query.mockResolvedValue({data:{environment:"production"},error:null});await expect(assertDeploymentIdentity()).resolves.toBeUndefined();});
  it("blocks Preview from the production database even with test keys",async()=>{vi.stubEnv("VERCEL_ENV","preview");m.query.mockResolvedValue({data:{environment:"production"},error:null});await expect(assertDeploymentIdentity()).rejects.toThrow();});
  it("blocks Live keys in Preview, including whitespace",async()=>{vi.stubEnv("VERCEL_ENV","preview");vi.stubEnv("STRIPE_SECRET_KEY","  sk_live_synthetic  ");m.query.mockResolvedValue({data:{environment:"preview"},error:null});await expect(assertDeploymentIdentity()).rejects.toThrow();});
  it("fails closed on a missing migration or database failure",async()=>{m.query.mockResolvedValue({data:null,error:{code:"42P01"}});await expect(assertDeploymentIdentity()).rejects.toThrow();});
  it("cannot use Live from an unrecognized environment",async()=>{vi.stubEnv("VERCEL_ENV","");vi.stubEnv("STRIPE_SECRET_KEY","rk_live_synthetic");await expect(assertDeploymentIdentity()).rejects.toThrow();});
});
