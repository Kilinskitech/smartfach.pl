import { describe, it, expect } from "vitest";
import {
  localAccessAllowed,
  localAdminPageAllowed,
  limitedJson,
} from "./local-access";
const request = (
  method = "GET",
  origin?: string,
  site = "same-origin",
  url = "http://127.0.0.1:3000/api/workspace",
) =>
  new Request(url, {
    method,
    headers: { "sec-fetch-site": site, ...(origin ? { origin } : {}) },
  });
describe("lokalna granica dostępu", () => {
  it("zezwala tylko na lokalne żądanie tego samego pochodzenia w dev", () => {
    expect(localAccessAllowed(request(), "development")).toBe(true);
    expect(
      localAccessAllowed(
        request("PUT", "http://127.0.0.1:3000"),
        "development",
      ),
    ).toBe(true);
  });
  it.each(["production", "test"] as const)("blokuje tryb %s", (mode) =>
    expect(localAccessAllowed(request(), mode)).toBe(false),
  );
  it("blokuje obcą stronę, brak Origin i inne hosty", () => {
    for (const input of [
      request("PUT"),
      request("PUT", "https://evil.test"),
      request("GET", undefined, "cross-site"),
      request(
        "GET",
        undefined,
        "same-origin",
        "http://evil.test/api/workspace",
      ),
    ])
      expect(localAccessAllowed(input, "development")).toBe(false);
  });
  it("uwzględnia normalizację localhost w Next, lecz nie ufa obcemu Host", () => {
    const headers = {
      host: "127.0.0.1:3000",
      origin: "http://127.0.0.1:3000",
      "sec-fetch-site": "same-origin",
    };
    expect(
      localAccessAllowed(
        new Request("http://localhost:3000/api/workspace", {
          method: "PUT",
          headers,
        }),
        "development",
      ),
    ).toBe(true);
    expect(
      localAccessAllowed(
        new Request("http://localhost:3000/api/workspace", {
          method: "PUT",
          headers: { ...headers, host: "evil.test" },
        }),
        "development",
      ),
    ).toBe(false);
  });
  it("wymaga JSON i ogranicza rozmiar przed parsowaniem", async () => {
    const req = (text: string, type = "application/json") =>
      new Request("http://localhost", {
        method: "PUT",
        headers: { "content-type": type },
        body: text,
      });
    await expect(limitedJson(req('{"a":1}'))).resolves.toEqual({ a: 1 });
    await expect(limitedJson(req('{"a":1}'), 3)).rejects.toThrow("Za duży");
    await expect(limitedJson(req("{}", "text/plain"))).rejects.toThrow("JSON");
    await expect(limitedJson(req("{"))).rejects.toThrow();
  });
  it("udostępnia panel administratora tylko lokalnemu hostowi w dev", () => {
    expect(localAdminPageAllowed("127.0.0.1:3000", "development")).toBe(true);
    expect(localAdminPageAllowed("localhost:3000", "development")).toBe(true);
    expect(localAdminPageAllowed("smartfach.pl", "development")).toBe(false);
    expect(localAdminPageAllowed("127.0.0.1:3000", "production")).toBe(false);
  });
});
