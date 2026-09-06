import { afterEach, describe, expect, it, vi } from "vitest";
import { isPlatformAdminIdentity } from "./platform-admin";

afterEach(() => vi.unstubAllEnvs());

describe("administrator platformy", () => {
  it("rozpoznaje niezmienny identyfikator użytkownika", () => {
    vi.stubEnv("PLATFORM_ADMIN_USER_ID", "bc005248-3459-471c-8053-2b90b9351e7e");
    expect(
      isPlatformAdminIdentity({
        userId: "bc005248-3459-471c-8053-2b90b9351e7e",
        email: "other@example.com",
      }),
    ).toBe(true);
  });

  it("rozpoznaje skonfigurowany adres bez względu na wielkość liter", () => {
    vi.stubEnv("PLATFORM_ADMIN_USER_ID", "");
    vi.stubEnv("PLATFORM_ADMIN_EMAIL", " Kilinskitech@Gmail.com ");
    expect(
      isPlatformAdminIdentity({ email: "kilinskitech@gmail.com" }),
    ).toBe(true);
  });

  it("obsługuje adres zapisany wcześniej w zmiennej identyfikatora", () => {
    vi.stubEnv("PLATFORM_ADMIN_USER_ID", "kilinskitech@gmail.com");
    expect(
      isPlatformAdminIdentity({ email: "KILINSKITECH@gmail.com" }),
    ).toBe(true);
  });

  it("nie przyznaje dostępu bez zgodnej, podpisanej tożsamości", () => {
    vi.stubEnv("PLATFORM_ADMIN_USER_ID", "bc005248-3459-471c-8053-2b90b9351e7e");
    vi.stubEnv("PLATFORM_ADMIN_EMAIL", "kilinskitech@gmail.com");
    expect(
      isPlatformAdminIdentity({
        userId: "8320c2e0-4a6f-4594-b202-41c7ec7991ad",
        email: "client@example.com",
      }),
    ).toBe(false);
  });
});
