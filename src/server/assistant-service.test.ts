import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  callAssistant,
  inferClientFromConversation,
  inferClientFromText,
  aiConfigured,
  publicAiConfiguration,
} from "./assistant-service";
import { fixtureClient, fixtureWorkspace } from "../test/fixtures";
const input = {
  clientId: null,
  messages: [{ role: "user" as const, content: "Napisz wiadomość do klienta" }],
};
const payload = {
  reply: "Dzień dobry, przyjadę godzinę później.",
  quote: null,
  report: null,
};
const provider = (text = JSON.stringify(payload), annotations?: unknown[]) => ({
  choices: [{ message: { content: text, refusal: null, annotations } }],
});
beforeEach(() => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-key-never-real");
  vi.stubEnv("OPENROUTER_MODEL", "google/test-model");
  vi.stubEnv("OPENROUTER_REQUIRE_ZDR", "true");
  vi.stubEnv("OPENROUTER_WEB_SEARCH", "true");
  vi.stubEnv("SMARTFACH_ENABLE_AI", "true");
});
afterEach(() => vi.unstubAllEnvs());
describe("adapter AI, bez płatnych zapytań w testach", () => {
  it("rozpoznaje jednoznaczne nazwisko, ale nie zgaduje przy dwóch osobach", () => {
    const data = fixtureWorkspace();
    expect(inferClientFromText("Co robiliśmy u Żółć?", data)?.id).toBe(
      fixtureClient.id,
    );
    data.clients.push({
      ...fixtureClient,
      id: "second-client",
      name: "Anna Żółć",
    });
    expect(inferClientFromText("Co robiliśmy u Żółć?", data)).toBeUndefined();
    expect(inferClientFromText("Co robiliśmy u Łukasza Żółć?", data)?.id).toBe(
      fixtureClient.id,
    );
    expect(
      inferClientFromText("Napisz wiadomość do klienta", fixtureWorkspace()),
    ).toBeUndefined();
  });
  it("pamięta klienta z wcześniejszej wiadomości w tej samej rozmowie", () => {
    const data = fixtureWorkspace();
    expect(
      inferClientFromConversation(
        [
          { role: "user", content: "Sprawdź historię Łukasza Żółć." },
          { role: "assistant", content: "Znalazłem klienta." },
          { role: "user", content: "A co robiliśmy u niego ostatnio?" },
        ],
        data,
      )?.id,
    ).toBe(fixtureClient.id);
  });
  it("nie wraca do starego klienta po nowej, niejednoznacznej wzmiance", () => {
    const data = fixtureWorkspace();
    data.clients.push({
      ...fixtureClient,
      id: "second-client",
      name: "Anna Żółć",
    });
    expect(
      inferClientFromConversation(
        [
          { role: "user", content: "Sprawdź historię Łukasza Żółć." },
          { role: "assistant", content: "Znalazłem klienta." },
          { role: "user", content: "A teraz przygotuj protokół dla Żółć." },
        ],
        data,
      ),
    ).toBeUndefined();
  });
  it("wymaga świadomego włączenia, klucza i modelu", async () => {
    vi.stubEnv("SMARTFACH_ENABLE_AI", "false");
    const fetcher = vi.fn();
    expect(aiConfigured()).toBe(false);
    await expect(
      callAssistant(input, fixtureWorkspace(), fetcher),
    ).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("nie udostępnia nazw modeli do interfejsu", () => {
    expect(publicAiConfiguration()).toEqual({
      available: true,
      webSearch: true,
    });
  });
  it("używa oficjalnego endpointu i schematu; nie wysyła kontaktów bez potrzeby", async () => {
    const data = fixtureWorkspace();
    data.clients[0]!.phone = "SECRET-PHONE";
    data.clients[0]!.notes = "SECRET-NOTES";
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(provider()));
    expect(await callAssistant(input, data, fetcher)).toEqual({
      ...payload,
      model: "google/test-model",
      sources: [],
    });
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    );
    const body = String(fetcher.mock.calls[0]?.[1]?.body);
    const request = JSON.parse(body);
    expect(request.response_format.json_schema.strict).toBe(true);
    expect(request.max_tokens).toBe(5000);
    expect(request.reasoning).toEqual({ effort: "minimal", exclude: true });
    expect(request.plugins).toEqual([{ id: "response-healing" }]);
    expect(request.tools).toEqual([
      {
        type: "openrouter:web_search",
        parameters: {
          max_results: 3,
          max_total_results: 5,
          search_context_size: "low",
        },
      },
    ]);
    expect(request.provider).toEqual({
      require_parameters: true,
      data_collection: "deny",
      zdr: true,
    });
    expect(body).not.toContain("SECRET");
    expect(body).not.toContain("test-key-never-real");
  });
  it("zwraca faktyczny koszt i tokeny raportowane przez OpenRouter", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        ...provider(),
        id: "gen-cost-123",
        provider: "Google",
        usage: {
          prompt_tokens: 120,
          completion_tokens: 35,
          total_tokens: 155,
          cost: 0.00123,
          completion_tokens_details: { reasoning_tokens: 9 },
          prompt_tokens_details: { cached_tokens: 40 },
        },
      }),
    );
    const result = await callAssistant(input, fixtureWorkspace(), fetcher);
    expect(result.usage).toEqual({
      providerRequestId: "gen-cost-123",
      provider: "Google",
      promptTokens: 120,
      completionTokens: 35,
      totalTokens: 155,
      reasoningTokens: 9,
      cachedTokens: 40,
      costUsd: 0.00123,
    });
  });
  it("zwraca tylko bezpieczne źródła internetowe i upraszcza link w odpowiedzi", async () => {
    const output = JSON.stringify({
      ...payload,
      reply: "Orientacyjny poziom cen opisuje [lokalny cennik](https://example.com/cennik).",
    });
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        provider(output, [
          {
            type: "url_citation",
            url_citation: {
              url: "https://example.com/cennik",
              title: "Lokalny cennik usług",
              content: "Niezaufany fragment strony",
            },
          },
          {
            type: "url_citation",
            url_citation: {
              url: "javascript:alert(1)",
              title: "Niebezpieczny link",
            },
          },
        ]),
      ),
    );
    const result = await callAssistant(input, fixtureWorkspace(), fetcher);
    expect(result.reply).toBe(
      "Orientacyjny poziom cen opisuje lokalny cennik.",
    );
    expect(result.sources).toEqual([
      {
        url: "https://example.com/cennik",
        title: "Lokalny cennik usług",
      },
    ]);
  });
  it.each([
    "```json\n" + JSON.stringify(payload) + "\n```",
    "Oto wynik:\n" + JSON.stringify(payload) + "\nKoniec odpowiedzi.",
  ])("naprawia bezpieczne otoczenie poprawnego JSON-u", async (content) => {
    const result = await callAssistant(
      input,
      fixtureWorkspace(),
      vi.fn<typeof fetch>().mockResolvedValue(Response.json(provider(content))),
    );
    expect(result).toMatchObject(payload);
  });
  it("pokazuje zwykłą odpowiedź mimo błędu JSON i loguje tylko metadane", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const raw = "Orientacyjnie jest to 60–90 zł/m². [Źródło](https://example.com).";
    const response = {
      id: "gen-safe-id",
      provider: "Test Provider",
      choices: [
        {
          finish_reason: "stop",
          message: { content: raw, refusal: null },
        },
      ],
    };
    const result = await callAssistant(
      {
        clientId: null,
        messages: [
          {
            role: "user",
            content: "Ile kosztuje metr posadzki we Wrocławiu?",
          },
        ],
      },
      fixtureWorkspace(),
      vi.fn<typeof fetch>().mockResolvedValue(Response.json(response)),
    );
    expect(result).toMatchObject({
      reply: "Orientacyjnie jest to 60–90 zł/m². Źródło.",
      quote: null,
      report: null,
    });
    expect(warning).toHaveBeenCalledOnce();
    const logged = String(warning.mock.calls[0]?.[0]);
    expect(logged).toContain("SmartFach odrzucił format odpowiedzi AI");
    expect(logged).toContain('"reason":"invalid-json"');
    expect(logged).toContain('"requestId":"gen-safe-id"');
    expect(logged).toContain('"provider":"Test Provider"');
    expect(logged).toContain(`"contentLength":${raw.length}`);
    expect(logged).toContain('"expectedDocument":false');
    expect(JSON.stringify(warning.mock.calls)).not.toContain(raw);
    warning.mockRestore();
  });
  it("nie myli oferty usługi z formalną wyceną", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await callAssistant(
      {
        clientId: null,
        messages: [
          {
            role: "user",
            content: "Pomóż mi zbudować ofertę zdalnej obróbki zdjęć.",
          },
        ],
      },
      fixtureWorkspace(),
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json(
            provider("Zacznij od pakietu 10 zdjęć dla małych sklepów internetowych."),
          ),
        ),
    );
    expect(result).toMatchObject({
      reply: "Zacznij od pakietu 10 zdjęć dla małych sklepów internetowych.",
      quote: null,
      report: null,
    });
    expect(warning).toHaveBeenCalledOnce();
    expect(String(warning.mock.calls[0]?.[0])).toContain(
      '"expectedDocument":false',
    );
    warning.mockRestore();
  });
  it("odzyskuje ukończoną odpowiedź z JSON-u uciętego później", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await callAssistant(
      {
        clientId: null,
        messages: [
          {
            role: "user",
            content: "Ile kosztuje metr posadzki we Wrocławiu?",
          },
        ],
      },
      fixtureWorkspace(),
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json(
            provider(
              '{"reply":"Orientacyjnie 60–90 zł za m².","quote":null,"report":',
            ),
          ),
        ),
    );
    expect(result).toMatchObject({
      reply: "Orientacyjnie 60–90 zł za m².",
      quote: null,
      report: null,
    });
    warning.mockRestore();
  });
  it("nie zamienia błędnego tekstu w wycenę ani protokół", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(
      callAssistant(
        {
          clientId: null,
          messages: [
            { role: "user", content: "Stwórz wycenę montażu klimatyzacji" },
          ],
        },
        fixtureWorkspace(),
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(Response.json(provider("Gotowa wycena: 999 zł"))),
      ),
    ).rejects.toThrow("tekstem zamiast poprawnego szkicu");
    warning.mockRestore();
  });
  it("pozwala jawnie wyłączyć dodatkowy koszt wyszukiwania", async () => {
    vi.stubEnv("OPENROUTER_WEB_SEARCH", "false");
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(provider()));
    await callAssistant(input, fixtureWorkspace(), fetcher);
    const request = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(request.tools).toBeUndefined();
  });
  it("wysyła prywatne zdjęcie i głos tylko w bieżącej wiadomości", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(provider()));
    await callAssistant(
      {
        ...input,
        attachments: [
          {
            kind: "image",
            name: "tabliczka.jpg",
            mediaType: "image/jpeg",
            data: "YWJjZA==",
          },
          {
            kind: "audio",
            name: "Notatka głosowa",
            mediaType: "audio/webm",
            data: "ZWZnaA==",
          },
        ],
      },
      fixtureWorkspace(),
      fetcher,
    );
    const request = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    const last = request.messages.at(-1).content;
    expect(last[1]).toEqual({
      type: "image_url",
      image_url: { url: "data:image/jpeg;base64,YWJjZA==" },
    });
    expect(last[2]).toEqual({
      type: "input_audio",
      input_audio: { data: "ZWZnaA==", format: "webm" },
    });
  });
  it("dołącza historię tylko dla jednoznacznie wspomnianego klienta", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(provider()));
    await callAssistant(
      {
        clientId: null,
        messages: [
          { role: "user", content: "Sprawdź klienta Łukasza Żółć." },
          { role: "assistant", content: "Jasne." },
          { role: "user", content: "Co robiliśmy u niego ostatnio?" },
        ],
      },
      fixtureWorkspace(),
      fetcher,
    );
    const body = String(fetcher.mock.calls[0]?.[1]?.body);
    expect(body).toContain("Przegląd i wymiana części");
  });
  it("odnajduje klienta w zapisanej części długiej rozmowy", async () => {
    const data = fixtureWorkspace();
    data.conversations.push({
      id: "conversation-memory",
      mode: "operate",
      title: "Rozmowa z klientem",
      updatedAt: "2026-09-01T10:00:00Z",
      messages: [
        {
          id: "stored-user-message",
          role: "user",
          content: "Sprawdź historię Łukasza Żółć.",
        },
        {
          id: "stored-assistant-message",
          role: "assistant",
          content: "Jasne.",
        },
      ],
    });
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(provider()));
    await callAssistant(
      {
        clientId: null,
        conversationId: "conversation-memory",
        messages: [
          { role: "user", content: "Co robiliśmy u niego ostatnio?" },
        ],
      },
      data,
      fetcher,
    );
    expect(String(fetcher.mock.calls[0]?.[1]?.body)).toContain(
      "Przegląd i wymiana części",
    );
  });
  it.each([
    { choices: [] },
    { choices: [{ message: { content: null, refusal: "Nie mogę" } }] },
    provider(JSON.stringify({ ...payload, unauthorizedAction: true })),
  ])("odrzuca niepełną, odmowną lub niepoprawną odpowiedź", async (value) => {
    await expect(
      callAssistant(
        input,
        fixtureWorkspace(),
        vi.fn<typeof fetch>().mockResolvedValue(Response.json(value)),
      ),
    ).rejects.toThrow();
  });
  it("nie ujawnia odpowiedzi błędu dostawcy", async () => {
    await expect(
      callAssistant(
        input,
        fixtureWorkspace(),
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(
            new Response("SECRET PROVIDER ERROR", { status: 401 }),
          ),
      ),
    ).rejects.toThrow("Sprawdź konfigurację");
  });
});
