import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { loadAdminTopUps } from "./admin-top-ups";

function client() {
  const range = vi.fn();
  const query = { select: vi.fn(), in: vi.fn(), order: vi.fn(), range };
  query.select.mockReturnValue(query);
  query.in.mockReturnValue(query);
  query.order.mockReturnValue(query);
  const from = vi.fn().mockReturnValue(query);
  return { admin: { from } as unknown as Parameters<typeof loadAdminTopUps>[0], from, query, range };
}
const row = (id: number) => ({ checkout_session_id: `cs_test_${id}`, organization_id: "org", pack_id: "mini", granted_credits: 138, amount_total_grosze: 1999, created_at: "2026-09-01T00:00:00Z" });

describe("loadAdminTopUps", () => {
  it("does not query without organizations", async () => {
    const c = client();
    expect(await loadAdminTopUps(c.admin, [])).toEqual([]);
    expect(c.from).not.toHaveBeenCalled();
  });
  it("loads all pages and keeps recorded purchase values", async () => {
    const c = client();
    c.range.mockResolvedValueOnce({ data: Array.from({ length: 500 }, (_, i) => row(i)), error: null })
      .mockResolvedValueOnce({ data: [row(500)], error: null });
    const result = await loadAdminTopUps(c.admin, ["org", "org", ""]);
    expect(result).toHaveLength(501);
    expect(c.query.in).toHaveBeenCalledWith("organization_id", ["org"]);
    expect(c.range).toHaveBeenNthCalledWith(1, 0, 499);
    expect(c.range).toHaveBeenNthCalledWith(2, 500, 999);
    expect(result[500]).toMatchObject({ checkoutSessionId: "cs_test_500", grantedCredits: 138, amountGrosze: 1999 });
  });
  it("does not present database errors as zero purchases", async () => {
    const c = client();
    c.range.mockResolvedValue({ data: null, error: { message: "unavailable" } });
    await expect(loadAdminTopUps(c.admin, ["org"])).rejects.toThrow("Nie można wczytać historii");
  });
});
