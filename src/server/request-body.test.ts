import { describe, expect, it } from "vitest";
import { limitedJson } from "./request-body";

describe("ograniczone żądanie JSON", () => {
  it("wymaga JSON i zatrzymuje zbyt duże dane przed parsowaniem", async () => {
    const request = (text: string, type = "application/json") =>
      new Request("http://localhost", {
        method: "PUT",
        headers: { "content-type": type },
        body: text,
      });

    await expect(limitedJson(request('{"a":1}'))).resolves.toEqual({ a: 1 });
    await expect(limitedJson(request('{"a":1}'), 3)).rejects.toThrow("Za duży");
    await expect(limitedJson(request("{}", "text/plain"))).rejects.toThrow("JSON");
    await expect(limitedJson(request("{"))).rejects.toThrow();
  });
});
