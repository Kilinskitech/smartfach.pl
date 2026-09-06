import { describe, it, expect } from "vitest";
import {
  emptyWorkspace,
  newQuote,
  newReport,
  switchBillingPlan,
  workspaceSchema,
  reportSchema,
  draftSchema,
} from "./workspace";
import { fixtureWorkspace, fixtureClient } from "../test/fixtures";

describe("warsztat bez danych przykładowych", () => {
  it("zaczyna bez klientów, stawek, członków zespołu, dokumentów i rozmów", () => {
    expect(workspaceSchema.parse(emptyWorkspace)).toEqual(emptyWorkspace);
    for (const key of [
      "clients",
      "catalog",
      "team",
      "documents",
      "conversations",
    ] as const)
      expect(emptyWorkspace[key]).toEqual([]);
  });
  it("nowa wycena nie zgaduje VAT ani ceny", () => {
    const draft = newQuote();
    expect(draft.client).toBe("");
    expect(draft.vatBasisPoints).toBe(-1);
    expect(draft.lines[0]?.price).toBe("");
    expect(draftSchema.safeParse(draft).success).toBe(false);
  });
  it("protokół nie dopisuje pomiarów i sprawności", () => {
    const report = newReport(fixtureClient);
    expect(report.clientId).toBe(fixtureClient.id);
    expect(report.work).toBe("");
    expect(report.measurements).toBe("");
    expect(report.recommendations).toBe("");
  });
  it("sprawdza datę kalendarzową", () => {
    expect(
      reportSchema.safeParse({
        ...newReport(fixtureClient),
        subject: "Serwis",
        work: "Czyszczenie",
        date: "2026-02-30",
      }).success,
    ).toBe(false);
  });
  it("odrzuca powtórzone identyfikatory", () => {
    const data = fixtureWorkspace();
    data.clients.push({ ...fixtureClient });
    expect(workspaceSchema.safeParse(data).success).toBe(false);
  });
  it("nie pozwala usunąć klienta mającego dokumenty", () => {
    const data = fixtureWorkspace();
    data.clients = [];
    expect(workspaceSchema.safeParse(data).success).toBe(false);
  });
  it("odrzuca ceny i VAT nieprzechodzące kalkulatora", () => {
    const data = fixtureWorkspace();
    const doc = data.documents[0]!;
    if (doc.kind !== "quote") throw Error();
    doc.draft.vatBasisPoints = -1;
    expect(workspaceSchema.safeParse(data).success).toBe(false);
    doc.draft.vatBasisPoints = 2300;
    doc.draft.lines[0]!.price = "430.999";
    expect(workspaceSchema.safeParse(data).success).toBe(false);
  });
  it("ceny na zapisanym dokumencie są niezależne od cennika", () => {
    const data = fixtureWorkspace();
    data.catalog[0]!.price = "999";
    const doc = data.documents[0]!;
    expect(doc.kind === "quote" && doc.draft.lines[0]!.price).toBe("430");
  });
  it("przechowuje niezakończony szkic rozmowy, nie tworząc dokumentu", () => {
    const data = structuredClone(emptyWorkspace);
    data.conversations.push({
      id: "conversation-qa",
      title: "Wycena",
      updatedAt: "2026-08-31T10:00:00Z",
      messages: [],
      pendingDocument: { id: "pending-qa", quote: newQuote(), report: null },
    });
    const parsed = workspaceSchema.parse(JSON.parse(JSON.stringify(data)));
    expect(parsed.documents).toEqual([]);
    expect(
      parsed.conversations[0]?.pendingDocument?.quote?.vatBasisPoints,
    ).toBe(-1);
  });
  it("przechowuje koszt odpowiedzi AI przy konkretnej wiadomości", () => {
    const data = structuredClone(emptyWorkspace);
    data.conversations.push({
      id: "conversation-cost",
      title: "Koszt AI",
      updatedAt: "2026-09-04T10:00:00Z",
      messages: [
        {
          id: "assistant-cost",
          role: "assistant",
          content: "Odpowiedź",
          model: "provider/model",
          usage: {
            providerRequestId: "gen-workspace-123",
            provider: "Provider testowy",
            promptTokens: 100,
            completionTokens: 20,
            totalTokens: 120,
            reasoningTokens: 5,
            cachedTokens: 30,
            costUsd: 0.002,
          },
        },
      ],
    });
    expect(
      workspaceSchema.parse(data).conversations[0]?.messages[0]?.usage?.costUsd,
    ).toBe(0.002);
    expect(
      workspaceSchema.parse(data).conversations[0]?.messages[0]?.usage
        ?.providerRequestId,
    ).toBe("gen-workspace-123");
  });
  it("usuwa stare pola trybu i uzupełnia profil oraz lokalny limit", () => {
    const legacy = {
      version: 1,
      revision: 0,
      company: emptyWorkspace.company,
      clients: [],
      catalog: [],
      documents: [],
      conversations: [
        {
          id: "old-conversation",
          title: "Stara rozmowa",
          updatedAt: "2026-08-31T10:00:00.000Z",
          mode: "operate",
          messages: [],
        },
      ],
      journey: {
        mode: "discover",
        focus: "Usługa testowa",
        goal: "Pierwszy klient",
      },
    };
    const migrated = workspaceSchema.parse(legacy);
    expect(migrated.journey.workStyle).toBe("open");
    expect(migrated.billing.plan).toBe("lite");
    expect(migrated.team).toEqual([]);
    expect(migrated.journey).not.toHaveProperty("mode");
    expect(migrated.conversations[0]).not.toHaveProperty("mode");
  });
  it("przechowuje członków zespołu i odrzuca powtórzony identyfikator", () => {
    const data = structuredClone(emptyWorkspace);
    data.team.push({
      id: "member-qa",
      name: "Anna Kowalska",
      email: "anna@example.com",
      phone: "",
      role: "office",
    });
    expect(workspaceSchema.parse(data).team).toHaveLength(1);
    data.team.push({ ...data.team[0]! });
    expect(workspaceSchema.safeParse(data).success).toBe(false);
  });
  it("zmienia plan bez resetowania wykorzystania limitu i okresu", () => {
    const data = fixtureWorkspace();
    data.billing.usedCredits = 37;
    data.billing.topUpCredits = 100;
    const switched = switchBillingPlan(data, "pro");
    expect(switched.billing).toEqual({
      ...data.billing,
      plan: "pro",
    });
    expect(switched.journey).toBe(data.journey);
    expect(switched.clients).toBe(data.clients);
    expect(switched.documents).toBe(data.documents);
  });
});
