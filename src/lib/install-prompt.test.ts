import { describe, expect, it } from "vitest";
import { consumeInstallPrompt, type InstallPromptEvent } from "./install-prompt";
import manifest from "@/app/manifest";

describe("PWA install entry", () => {
  it("consumes each native install event once across all buttons", () => {
    const first = new Event("beforeinstallprompt") as InstallPromptEvent;
    expect(consumeInstallPrompt(first)).toBe(true);
    expect(consumeInstallPrompt(first)).toBe(false);
    expect(consumeInstallPrompt(new Event("beforeinstallprompt") as InstallPromptEvent)).toBe(true);
  });
  it("keeps the installed app identity while using a public starting URL", () => {
    expect(manifest()).toMatchObject({ id: "/app", scope: "/", start_url: "/logowanie?dalej=%2Fapp", display: "standalone" });
    expect(manifest().icons).toEqual(expect.arrayContaining([expect.objectContaining({ sizes: "192x192", purpose: "any" }), expect.objectContaining({ sizes: "512x512", purpose: "any" })]));
  });
});
