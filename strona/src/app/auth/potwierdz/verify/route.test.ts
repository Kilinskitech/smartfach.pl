import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/stripe", () => ({ applicationUrl: () => "https://test.invalid" }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/server/operations", () => ({ assertDeploymentIdentity: vi.fn() }));
vi.mock("@/server/stripe-subscriptions", () => ({ releaseEmailConfirmationHoldForUser: vi.fn() }));
vi.mock("next/server", async (original) => ({ ...await original<typeof import("next/server")>(), after: vi.fn() }));
import { POST } from "./route";
import { createClient } from "@/lib/supabase/server";
const verify = vi.fn();
const request = (type = "signup", origin = "https://test.invalid", token = "a".repeat(64)) => new Request("https://test.invalid/auth/potwierdz/verify", {
  method: "POST", headers: { origin }, body: new URLSearchParams({ type, token_hash: token, next: "https://evil.invalid" }),
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(createClient).mockResolvedValue({ auth: { verifyOtp: verify } } as unknown as Awaited<ReturnType<typeof createClient>>);
  verify.mockResolvedValue({ data: { user: { id: "test-user" } }, error: null });
});
describe("email confirmation from a different browser, without PKCE cookies", () => {
  it("verifies the token on POST and only redirects to app", async () => {
    const result = await POST(request());
    expect(verify).toHaveBeenCalledExactlyOnceWith({ type: "signup", token_hash: "a".repeat(64) });
    expect(result.status).toBe(303);
    expect(result.headers.get("location")).toBe("https://test.invalid/app");
    expect(result.headers.get("cache-control")).toBe("no-store");
  });
  it("sends recovery only to the password form", async () => {
    expect((await POST(request("recovery"))).headers.get("location")).toBe("https://test.invalid/ustaw-haslo");
  });
  it("rejects foreign origins before verifying", async () => {
    expect((await POST(request("signup", "https://evil.invalid"))).status).toBe(403);
    expect(verify).not.toHaveBeenCalled();
  });
  it.each(["invite", "email_change", "unknown"])("rejects unsupported flow %s", async type => {
    await POST(request(type)); expect(verify).not.toHaveBeenCalled();
  });
  it("shows a branded retry page for expired links without leaking token", async () => {
    verify.mockResolvedValue({ data: { user: null }, error: new Error("expired") });
    const result = await POST(request());
    expect(result.headers.get("location")).toBe("https://test.invalid/auth/potwierdz?blad=link&type=signup");
    expect(result.headers.get("location")).not.toContain("token_hash");
  });
});
