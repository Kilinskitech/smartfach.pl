import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";

// Real PostgreSQL functions with synthetic accounts. No Supabase/Stripe/OpenRouter traffic.
let db: PGlite;
let actor: string, other: string, org: string, otherOrg: string;
const fingerprint = "a".repeat(64);
async function rpc(name: string, args: unknown[]) {
  const result = await db.query<{ value: Record<string, unknown> }>(`select public.${name}(${args.map((_,i)=>`$${i+1}`).join(",")}) as value`,args);
  return result.rows[0]!.value;
}
async function begin(key = randomUUID(), owner = actor, organization = org, hash = fingerprint) {
  return rpc("begin_ai_request",[organization,owner,key,hash,1]);
}
const answer = { reply: "Testowa odpowiedź", model: "test-model", sources: [], quote: null, report: null,
  usage: { providerRequestId: "test-generation", costUsd: 0.02, totalTokens: 10 } };
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to authenticated;`);
  // Auth schema is synthetic; all repository migrations run in order.
  for (const name of readdirSync("supabase/migrations").filter(name=>name.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(`supabase/migrations/${name}`,"utf8").replace("create extension if not exists pgcrypto;",""));
  }
},30_000);
afterAll(async () => { await db?.close(); });
beforeEach(async () => {
  await db.exec("truncate auth.users cascade; truncate public.operation_leases; truncate public.stripe_events;");
  actor=randomUUID(); other=randomUUID();
  await db.query(`insert into auth.users values($1,'one@example.invalid','{"plan":"lite"}'),($2,'two@example.invalid','{"plan":"lite"}')`,[actor,other]);
  const rows=await db.query<{id:string;owner_user_id:string}>("select id,owner_user_id from organizations");
  org=rows.rows.find(x=>x.owner_user_id===actor)!.id;
  otherOrg=rows.rows.find(x=>x.owner_user_id===other)!.id;
});
describe("durable AI receipts and reservations",()=>{
  it("can admit and settle through the actual service role grants",async()=>{
    await db.exec("set role service_role");
    try {
      const key=randomUUID();expect((await begin(key)).status).toBe("started");
      await rpc("finish_ai_request",[org,actor,key,JSON.stringify(answer),2]);
      expect((await begin(key)).status).toBe("replay");
      expect(await rpc("admin_operational_summary",[])).toMatchObject({pendingWebhooks:0});
    } finally {await db.exec("reset role");}
  });
  it("RLS exposes only the caller's workspace, subscriptions and organization",async()=>{
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[actor]);
    await db.exec("set role authenticated");
    try {
      for(const table of ["workspaces","subscriptions","memberships"]){
        const rows=await db.query<{organization_id:string}>(`select organization_id from public.${table}`);
        expect(rows.rows.map(row=>row.organization_id)).toEqual([org]);
      }
      const organizations=await db.query<{id:string}>("select id from public.organizations");
      expect(organizations.rows.map(row=>row.id)).toEqual([org]);
      await expect(db.query("update public.organizations set trial_consumed_at=null")).rejects.toThrow(/permission denied/);
      await expect(db.query("update public.workspaces set data='{}'")).rejects.toThrow(/permission denied/);
    } finally {await db.exec("reset role");}
  });
  it("blocks duplicate dispatch and concurrent calls across instances",async()=>{
    const key=randomUUID();
    expect((await begin(key)).status).toBe("started");
    expect((await begin(key)).status).toBe("busy");
    expect((await begin()).status).toBe("busy");
    expect((await begin(randomUUID(),other,otherOrg)).status).toBe("started");
  });
  it("replays a result without another charge and rejects altered payloads",async()=>{
    const key=randomUUID(); await begin(key);
    const finish=()=>rpc("finish_ai_request",[org,actor,key,JSON.stringify(answer),2]);
    await finish(); await finish();
    expect((await begin(key)).status).toBe("replay");
    expect((await begin(key,actor,org,"b".repeat(64))).status).toBe("conflict");
    const r=await db.query<{n:number}>("select count(*)::int n from usage_credit_charges");
    expect(r.rows[0]!.n).toBe(1);
  });
  it("isolates organizations even for identical request keys",async()=>{
    const key=randomUUID(); await begin(key);
    await expect(begin(key,other,org)).rejects.toThrow("Forbidden");
    expect((await begin(key,other,otherOrg)).status).toBe("started");
    await expect(rpc("finish_ai_request",[org,other,key,JSON.stringify(answer),2])).rejects.toThrow("Forbidden");
  });
  it("releases failed requests without making the same key dispatchable",async()=>{
    const key=randomUUID();await begin(key);
    await rpc("fail_ai_request",[org,actor,key]);
    expect((await begin(key)).status).toBe("failed");
    expect((await begin()).status).toBe("started");
  });
  it("retains uncertain reservations after a crashed worker",async()=>{
    const key=randomUUID();await begin(key);
    await db.exec("update ai_requests set created_at=now()-interval '3 minutes'");
    await begin();
    expect((await begin(key)).status).toBe("uncertain");
    const r=await db.query("select reserved_credits from ai_requests where state='uncertain'");
    expect(r.rows).toHaveLength(1);
  });
  it("keeps vendor cost but never discards the response or overdraws the customer",async()=>{
    await db.exec("update workspaces set data=jsonb_set(data,'{billing,usedCredits}','224')");
    const key=randomUUID();await begin(key);
    const result=await rpc("finish_ai_request",[org,actor,key,JSON.stringify(answer),4]);
    expect(result.billing).toMatchObject({usedCredits:225});
    expect(result.response).toMatchObject({reply:answer.reply,creditsUsed:1});
    expect((await begin()).status).toBe("limit");
  });
  it("rate limit counts failed attempts globally",async()=>{
    for(let i=0;i<20;i++){const key=randomUUID();await begin(key);await rpc("fail_ai_request",[org,actor,key]);}
    expect((await begin()).status).toBe("rate_limit");
  });
});
describe("Stripe leases and atomic subscription updates",()=>{
  it("przechowuje dokładny moment pierwszej rezygnacji podczas trialu",async()=>{
    const occurredAt="2026-09-09T10:15:00Z";
    await db.query("insert into product_events(user_id,event,occurred_at) values($1,'trial_canceled',$2)",[actor,occurredAt]);
    const result=await db.query<{occurred_at:Date}>("select occurred_at from product_events where user_id=$1 and event='trial_canceled'",[actor]);
    expect(result.rows[0]!.occurred_at.toISOString()).toBe("2026-09-09T10:15:00.000Z");
  });
  it("summarizes all costs, not just the first API page of 1000 events",async()=>{
    await db.query("insert into usage_events(organization_id,user_id,model,cost_usd,total_tokens) select $1,$2,'test',0.01,10 from generate_series(1,1100)",[org,actor]);
    const r=await db.query<{cost_usd:string;response_count:number}>("select * from admin_usage_totals()");
    expect(Number(r.rows[0]!.cost_usd)).toBe(11);
    expect(Number(r.rows[0]!.response_count)).toBe(1100);
    const summary=await rpc("admin_operational_summary",[]);
    expect(summary).toMatchObject({pendingWebhooks:0,uncertain:[],milestones:{}});
  });
  it("releases only old unresolved reservations and audits the admin decision",async()=>{
    const key=randomUUID();await begin(key);
    expect(await rpc("resolve_ai_reservation",[org,key,other])).toBe(false);
    await db.exec("update ai_requests set created_at=now()-interval '3 minutes'");
    expect(await rpc("resolve_ai_reservation",[org,key,other])).toBe(true);
    expect(await rpc("resolve_ai_reservation",[org,key,other])).toBe(false);
    expect((await begin(key)).status).toBe("failed");
    expect((await db.query("select * from admin_audit_events where action='release_uncertain_ai'")).rows).toHaveLength(1);
  });
  it("purges response bodies without making their paid requests reusable",async()=>{
    const key=randomUUID();await begin(key);
    await rpc("finish_ai_request",[org,actor,key,JSON.stringify(answer),2]);
    await db.exec("update ai_requests set finished_at=now()-interval '25 hours'");
    await rpc("purge_ai_response_bodies",[]);
    expect((await db.query<{response:unknown}>("select response from ai_requests")).rows[0]!.response).toBeNull();
    expect((await begin(key)).status).toBe("expired");
  });
  it("rolls back the entire settlement on invalid provider accounting",async()=>{
    const key=randomUUID();await begin(key);
    await expect(rpc("finish_ai_request",[org,actor,key,JSON.stringify({...answer,usage:{costUsd:"invalid"}}),2])).rejects.toThrow();
    expect((await begin(key)).status).toBe("busy");
    expect((await db.query("select * from usage_credit_charges")).rows).toHaveLength(0);
    expect((await db.query("select * from usage_events")).rows).toHaveLength(0);
  });
  it("recovers expired event leases and fences out the old worker",async()=>{
    const id="evt_test",old=randomUUID(),fresh=randomUUID();
    await db.query("insert into stripe_events(event_id,event_type) values($1,'test')",[id]);
    expect(await rpc("claim_operation",["stripe-event:"+id,old])).toBe(true);
    expect(await rpc("claim_operation",["stripe-event:"+id,fresh])).toBe(false);
    await db.exec("update operation_leases set expires_at=now()-interval '1 second'");
    expect(await rpc("claim_operation",["stripe-event:"+id,fresh])).toBe(true);
    expect(await rpc("complete_stripe_event",[id,old])).toBe(false);
    expect(await rpc("complete_stripe_event",[id,fresh])).toBe(true);
  });
  it("renews the budget once and preserves paid top-ups",async()=>{
    await db.exec(`update workspaces set data=jsonb_set(data,'{billing}','{"plan":"lite","usedCredits":230,"topUpCredits":15,"periodStartedAt":"2026-01-01T00:00:00.000Z"}')`);
    const token=randomUUID();await rpc("claim_operation",["subscription:"+org,token]);
    const snapshot={id:"sub_new",created:200,customer:"cus_test",plan:"lite",status:"active",trial_start:"2026-01-01T00:00:00Z",trial_end:"2026-01-04T00:00:00Z",period_start:"2026-02-01T00:00:00Z",period_end:"2026-03-01T00:00:00Z",cancel_at_period_end:false,payment_method:true};
    await rpc("apply_subscription_snapshot",[org,actor,token,JSON.stringify(snapshot)]);
    await db.query("update workspaces set data=jsonb_set(data,'{billing,usedCredits}','7') where organization_id=$1",[org]);
    await rpc("apply_subscription_snapshot",[org,actor,token,JSON.stringify(snapshot)]);
    const r=await db.query<{b:unknown}>("select data->'billing' b from workspaces where organization_id=$1",[org]);
    expect(r.rows[0]!.b).toMatchObject({usedCredits:7,topUpCredits:10});
    expect(await rpc("apply_subscription_snapshot",[org,actor,token,JSON.stringify({...snapshot,id:"sub_old",created:100,status:"canceled"})])).toBe(false);
    const o=await db.query<{trial_consumed_at: unknown}>("select trial_consumed_at from organizations where id=$1",[org]);
    expect(o.rows[0]!.trial_consumed_at).not.toBeNull();
  });
  it("refuses direct database mutations by authenticated browser users",async()=>{
    await db.exec("set role authenticated");
    try {
      await expect(begin()).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from ai_requests")).rejects.toThrow(/permission denied/);
      await expect(rpc("claim_operation",["anything",randomUUID()])).rejects.toThrow(/permission denied/);
    } finally { await db.exec("reset role"); }
  });
});
