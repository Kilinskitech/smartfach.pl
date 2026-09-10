import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { describe, expect, it, vi } from "vitest";

function worker() {
  const listeners: Record<string, (event: unknown) => void> = {};
  const add = vi.fn().mockResolvedValue(undefined);
  const cache = { add };
  const caches = { open: vi.fn().mockResolvedValue(cache), match: vi.fn().mockResolvedValue(new Response("offline")), keys: vi.fn().mockResolvedValue(["other-app", "smartfach-offline-v0", "smartfach-offline-v1"]), delete: vi.fn().mockResolvedValue(true) };
  const fetch = vi.fn().mockResolvedValue(new Response("private content"));
  runInNewContext(readFileSync("public/sw.js", "utf8"), {
    self: { location: { origin: "https://smartfach.pl" }, addEventListener: (type: string, handler: (event: unknown) => void) => { listeners[type] = handler; }, skipWaiting: vi.fn(), clients: { claim: vi.fn() } }, caches, fetch, URL, Response,
  });
  return { listeners, caches, fetch, add };
}

describe("PWA: tylko publiczny ekran offline w pamięci podręcznej", () => {
  it("instaluje tylko offline.html, usuwa wyłącznie własne stare cache", async () => {
    const w = worker(); let task: Promise<unknown> | undefined;
    const event = { waitUntil: (value: Promise<unknown>) => { task = value; } };
    w.listeners.install!(event); await task;
    expect(w.add).toHaveBeenCalledExactlyOnceWith("/offline.html");
    w.listeners.activate!(event); await task;
    expect(w.caches.delete).toHaveBeenCalledExactlyOnceWith("smartfach-offline-v0");
  });
  it("nie przechwytuje API, POST, ani obcych domen", () => {
    const w = worker();
    for (const request of [
      { url: "https://smartfach.pl/api/workspace", method: "GET", mode: "cors" },
      { url: "https://smartfach.pl/api/assistant", method: "POST", mode: "cors" },
      { url: "https://example.com/app", method: "GET", mode: "navigate" },
    ]) {
      const respondWith = vi.fn(); w.listeners.fetch!({ request, respondWith });
      expect(respondWith).not.toHaveBeenCalled();
    }
  });
  it("nie zapisuje prywatnych stron; przy awarii zwraca wyłącznie ekran offline", async () => {
    const w = worker(); let result: Promise<Response> | undefined;
    const event = { request: { url: "https://smartfach.pl/app", method: "GET", mode: "navigate" }, respondWith: (response: Promise<Response>) => { result = response; } };
    w.listeners.fetch!(event);
    expect(await (await result)!.text()).toBe("private content");
    expect(w.caches.open).not.toHaveBeenCalled();
    expect(w.caches.match).not.toHaveBeenCalled();
    w.fetch.mockRejectedValueOnce(new Error("offline"));
    w.listeners.fetch!(event);
    expect(await (await result)!.text()).toBe("offline");
    expect(w.caches.match).toHaveBeenCalledExactlyOnceWith("/offline.html");
  });
});
