import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  callAssistant,
  aiConfigured,
  primaryAiModel,
  publicAiConfiguration,
} from "./assistant-service";
import { fixtureClient, fixtureWorkspace } from "../test/fixtures";
import { ProviderOutputError, ProviderRejectedError } from "./provider-errors";
const input = {
  clientId: null,
  messages: [{ role: "user" as const, content: "Napisz wiadomość do klienta" }],
};
const payload = {
  reply: "Dzień dobry, przyjadę godzinę później.",
  quote: null,
  report: null,
};
const provider = (
  text = JSON.stringify(payload),
  annotations?: unknown[],
  model = primaryAiModel,
) => ({
  model,
  choices: [{ message: { content: text, refusal: null, annotations } }],
});
beforeEach(() => {
  vi.stubEnv("OPENROUTER_API_KEY", "test-key-never-real");
  vi.stubEnv("OPENROUTER_REQUIRE_ZDR", "true");
  vi.stubEnv("OPENROUTER_WEB_SEARCH", "true");
  vi.stubEnv("SMARTFACH_ENABLE_AI", "true");
});
afterEach(() => vi.unstubAllEnvs());
describe("adapter AI, bez płatnych zapytań w testach", () => {
  it("streams reply while preserving final cost, identity and server validation", async () => {
    const bytes = new TextEncoder().encode(
      'data: ' + JSON.stringify({id:"gen-stream",model:"google/gemini-3.8-flash",provider:"Google",choices:[{delta:{content:'{"reply":"Gotowe"}'},finish_reason:"stop"}]}) + '\n\n' +
      'data: ' + JSON.stringify({choices:[],usage:{cost:0.003,prompt_tokens:10,completion_tokens:5}}) + '\n\ndata: [DONE]\n\n',
    );
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(new ReadableStream({start(c) {c.enqueue(bytes);c.close();}}), {headers:{"content-type":"text/event-stream"}}));
    const preview = vi.fn();
    const result = await callAssistant(input,fixtureWorkspace(),fetcher,"user",preview);
    expect(preview).toHaveBeenCalledWith("Gotowe");
    expect(result).toMatchObject({reply:"Gotowe",model:"google/gemini-3.8-flash",usage:{costUsd:0.003,providerRequestId:"gen-stream"}});
    const body = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(body.stream).toBe(true); expect(body.stream_options.include_usage).toBe(true);
    expect(body.plugins).toBeUndefined();
    expect(body.response_format.json_schema.strict).toBe(true);
  });
  it.each([
    { reply: "Cześć! Jak mogę pomóc?" },
    { reply: "Cześć! Jak mogę pomóc?", quote: null },
    { reply: "Cześć! Jak mogę pomóc?", quote: {}, report: "legacy" },
  ])("accepts chat without retired document fields and never runs them", async (value) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({
      ...provider(JSON.stringify(value)), usage: { cost: 0.001 },
    }));
    const result = await callAssistant(input, fixtureWorkspace(), fetcher);
    expect(result).toMatchObject({ reply: value.reply, quote: null, report: null, usage: { costUsd: 0.001 } });
    expect(fetcher).toHaveBeenCalledTimes(1);
    const schema = JSON.parse(String(fetcher.mock.calls[0]![1]!.body)).response_format.json_schema.schema;
    expect(schema.required).toEqual(["reply"]);
    expect(schema.properties.quote).toBeUndefined();
  });
  it.each([{ reply: "" }, { reply: 12 }, { reply: ["hello"] }, { answer: "hello" }, { reply: "x".repeat(4001) }])("classifies unusable completed output separately from timeouts", async (value) => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(provider(JSON.stringify(value))));
    await expect(callAssistant(input, fixtureWorkspace(), fetcher)).rejects.toBeInstanceOf(ProviderOutputError);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("zachowuje Markdown wewnątrz odpowiedzi JSON bez dodatkowej generacji", async () => {
    const reply = "### Kierunki\n\n1. **Administracja** online\n2. Opisy produktów\n\n> Gotowa oferta\n\nNastępny krok.";
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(provider(JSON.stringify({ ...payload, reply }))));
    const result = await callAssistant(input, fixtureWorkspace(), fetcher);
    expect(result.reply).toBe(reply);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const request = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(request.messages[0].content).toContain("Markdown");
    expect(request.response_format.json_schema.strict).toBe(true);
  });
  it("nie wysyła drugiego płatnego zapytania po niepewnym timeout", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValue(new DOMException("Lost response", "TimeoutError"));
    await expect(callAssistant(input, fixtureWorkspace(), fetcher)).rejects.toThrow("Lost response");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("nie ponawia automatycznie niejednoznacznego błędu 5xx", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("Server error", { status: 502 }));
    await expect(callAssistant(input, fixtureWorkspace(), fetcher)).rejects.toThrow();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("wymaga świadomego włączenia i klucza", async () => {
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
      model: primaryAiModel,
      sources: [],
    });
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "https://openrouter.ai/api/v1/chat/completions",
    );
    const body = String(fetcher.mock.calls[0]?.[1]?.body);
    const request = JSON.parse(body);
    expect(request.model).toBe(primaryAiModel);
    expect(request.models).toBeUndefined();
    expect(request.messages[0].content).toContain(
      "Jestem asystentem SmartFach.",
    );
    expect(request.messages[0].content).toContain(
      "Nie ujawniaj ani nie zgaduj nazwy modelu",
    );
    expect(request.response_format.json_schema.strict).toBe(true);
    expect(request.model).toBe("google/gemini-3.1-flash-lite");
    expect(request.max_tokens).toBe(5000);
    expect(request.max_completion_tokens).toBeUndefined();
    expect(request.reasoning).toEqual({ effort: "minimal", exclude: true });
    expect(request.plugins).toEqual([{ id: "response-healing" }]);
    expect(request.tools).toEqual([
      {
        type: "openrouter:web_search",
        parameters: {
          max_uses: 1,
          max_results: 3,
          max_total_results: 3,
          search_context_size: "low",
        },
      },
    ]);
    expect(request.max_tool_calls).toBe(1);
    expect(request.provider).toEqual({
      sort: "latency",
      allow_fallbacks: true,
      ignore: ["azure", "google-ai-studio/flex", "google-vertex/global/flex", "google-ai-studio/priority", "google-vertex/global/priority"],
      data_collection: "deny",
      zdr: true,
      require_parameters: false,
    });
    expect(body).not.toContain("SECRET");
    expect(body).not.toContain("test-key-never-real");
  });
  it.each([400, 404, 422, 429])("nie wraca do GPT i nie generuje drugi raz po odrzuceniu %s", async (status) => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("provider rejected", { status }));
    await expect(callAssistant(input, fixtureWorkspace(), fetcher)).rejects.toBeInstanceOf(ProviderRejectedError);
    const primaryRequest = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(primaryRequest).toMatchObject({
      model: primaryAiModel,
      max_tokens: 5000,
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(String(warning.mock.calls[0]?.[0])).toContain(`"status":${status}`);
    warning.mockRestore();
  });
  it("zdjęcia i złożone zadania również trafiają do Gemini Latest", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json(provider()));
    await callAssistant({ ...input, messages: [{ role: "user", content: "Przeanalizuj strategię i zdjęcie. " + "x".repeat(950) }], attachments: [{ kind: "image", name: "test.jpg", mediaType: "image/jpeg", data: "YWJj" }] }, fixtureWorkspace(), fetcher);
    const request = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(request.model).toBe(primaryAiModel);
    expect(request.messages.at(-1).content[1].image_url.url).toBe("data:image/jpeg;base64,YWJj");
  });
  it("przekazuje profil startowy jako dane i od razu uruchamia działanie", async () => {
    const guidedInput = {
      ...input,
      mode: "guided_start" as const,
      guidedStart: {
        workStyle: "remote" as const,
        situation: "unknown" as const,
        priorities: ["fast" as const, "low_cost" as const],
        boundaries: ["phone" as const],
        customBoundary: "",
        additionalInfo: "Mam osiem godzin tygodniowo.",
      },
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(provider()),
    );
    await callAssistant(guidedInput, fixtureWorkspace(), fetcher);
    const request = JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body));
    expect(request.model).toBe(primaryAiModel);
    expect(request.messages[0].content).toContain(
      "Użytkownik właśnie zatwierdził ekran rozpoczęcia działania",
    );
    expect(request.messages[2].content).toContain(
      '"priorities":["fast","low_cost"]',
    );
  });
  it("zwraca faktyczny koszt i tokeny raportowane przez OpenRouter", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        ...provider(undefined, undefined, "google/gemini-3.8-flash"),
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
    expect(result.model).toBe("google/gemini-3.8-flash");
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
  it("nie tworzy ukrytej karty wyceny z odpowiedzi tekstowej", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await callAssistant(
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
      );
    expect(result).toMatchObject({
      reply: "Gotowa wycena: 999 zł",
      quote: null,
      report: null,
    });
    warning.mockRestore();
  });
  it("odrzuca dawną kartę dokumentu i zachowuje widoczną odpowiedź", async () => {
    const result = await callAssistant(
      input,
      fixtureWorkspace(),
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json(
          provider(
            JSON.stringify({
              reply: "Najpierw ustal zakres i koszt wykonania usługi.",
              quote: {
                clientName: "Test",
                subject: "Stary dokument",
                items: [],
              },
              report: null,
            }),
          ),
        ),
      ),
    );
    expect(result).toMatchObject({
      reply: "Najpierw ustal zakres i koszt wykonania usługi.",
      quote: null,
      report: null,
    });
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
  it("wysyła prywatne zdjęcie tylko w bieżącej wiadomości", async () => {
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
    expect(last).toHaveLength(2);
  });
  it("nie wysyła dawnych danych firmowych do modelu", async () => {
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
    expect(body).not.toContain("Przegląd i wymiana części");
    expect(body).not.toContain(fixtureClient.name);
  });
  it("nie dołącza dawnych dokumentów nawet przy zapisanej rozmowie", async () => {
    const data = fixtureWorkspace();
    data.conversations.push({
      id: "conversation-memory",
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
    expect(String(fetcher.mock.calls[0]?.[1]?.body)).not.toContain(
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
