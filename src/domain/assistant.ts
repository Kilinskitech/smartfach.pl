import { z } from "zod";
import { parseMoneyCents, parseQuantityHundredths } from "./quotes/calculate";
import {
  newReport,
  type AiUsage,
  type WebSource,
  type Workspace,
} from "./workspace";
import type { QuoteDraft } from "./quotes/draft";

const quoteProposal = z
  .object({
    clientName: z.string().max(160),
    subject: z.string().max(160),
    items: z
      .array(
        z
          .object({
            catalogId: z.string().nullable(),
            label: z.string().max(160),
            unit: z.enum(["szt.", "godz.", "usł.", "m"]),
            quantity: z.string().max(17),
            netPrice: z.string().max(17).nullable(),
            priceEvidence: z.string().max(300).nullable(),
          })
          .strict(),
      )
      .max(30),
  })
  .strict();
const reportProposal = z
  .object({
    clientName: z.string().max(160),
    subject: z.string().max(160),
    work: z.string().max(8000),
    measurements: z.string().max(4000),
    recommendations: z.string().max(4000),
  })
  .strict();
export const assistantOutputSchema = z
  .object({
    reply: z.string().max(4000),
    quote: quoteProposal.nullable(),
    report: reportProposal.nullable(),
  })
  .strict();
export type AssistantOutput = z.infer<typeof assistantOutputSchema>;
export const assistantAttachmentSchema = z
  .object({
    kind: z.enum(["image", "audio"]),
    name: z.string().trim().min(1).max(180),
    mediaType: z.enum([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "audio/wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/ogg",
      "audio/webm",
      "audio/aac",
      "audio/flac",
    ]),
    data: z
      .string()
      .min(1)
      .max(8_500_000)
      .regex(/^[A-Za-z0-9+/]+={0,2}$/),
  })
  .strict();
export type AssistantAttachment = z.infer<typeof assistantAttachmentSchema>;
export const assistantRequestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(6000),
          })
          .strict(),
      )
      .min(1)
      .max(12),
    conversationId: z.string().max(80).nullable().optional(),
    clientId: z.string().max(80).nullable(),
    attachments: z.array(assistantAttachmentSchema).max(3).optional(),
  })
  .strict()
  .refine(
    (value) =>
      (value.attachments ?? []).reduce(
        (total, attachment) => total + attachment.data.length,
        0,
      ) <= 10_000_000,
    "Załączniki są zbyt duże.",
  )
  .refine(
    (value) => value.messages.at(-1)?.role === "user",
    "Ostatnia wiadomość musi pochodzić od użytkownika.",
  );
export const assistantJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "quote", "report"],
  properties: {
    reply: { type: "string" },
    quote: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["clientName", "subject", "items"],
          properties: {
            clientName: { type: "string" },
            subject: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: [
                  "catalogId",
                  "label",
                  "unit",
                  "quantity",
                  "netPrice",
                  "priceEvidence",
                ],
                properties: {
                  catalogId: { type: ["string", "null"] },
                  label: { type: "string" },
                  unit: {
                    type: "string",
                    enum: ["szt.", "godz.", "usł.", "m"],
                  },
                  quantity: { type: "string" },
                  netPrice: { type: ["string", "null"] },
                  priceEvidence: { type: ["string", "null"] },
                },
              },
            },
          },
        },
      ],
    },
    report: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: [
            "clientName",
            "subject",
            "work",
            "measurements",
            "recommendations",
          ],
          properties: {
            clientName: { type: "string" },
            subject: { type: "string" },
            work: { type: "string" },
            measurements: { type: "string" },
            recommendations: { type: "string" },
          },
        },
      ],
    },
  },
};
const normalize = (value: string) => value.trim().toLocaleLowerCase("pl");

export function hasExplicitNetPrice(
  price: string,
  evidence: string | null,
  userTexts: string[],
): boolean {
  if (!evidence || !userTexts.some((text) => text.includes(evidence)))
    return false;
  try {
    // Dopasowanie w pełnej wiadomości zapobiega uznaniu „430” za cenę z „1430”.
    const pattern =
      /(?<![\d.,-])\b(\d+(?:[ \u00a0]\d{3})*(?:[,.]\d{1,2})?)\s*(?:zł|PLN)\s+netto\b/gi;
    const evidenceMatches = [...evidence.matchAll(pattern)];
    if (evidenceMatches.length !== 1) return false;
    return userTexts.some(
      (text) =>
        text.includes(evidence) &&
        [...text.matchAll(pattern)].some(
          (match) =>
            evidence.includes(match[0]) &&
            parseMoneyCents(match[1]!.replace(/[ \u00a0]/g, "")) ===
              parseMoneyCents(price),
        ),
    );
  } catch {
    return false;
  }
}
export function resolveClient(
  name: string,
  workspace: Workspace,
  selectedId: string | null,
) {
  const selected = workspace.clients.find((client) => client.id === selectedId);
  if (
    selected &&
    (!name.trim() || normalize(name) === normalize(selected.name))
  )
    return selected;
  const matches = workspace.clients.filter(
    (client) => normalize(client.name) === normalize(name),
  );
  return matches.length === 1 ? matches[0] : undefined;
}
export function materializeAssistant(
  output: AssistantOutput,
  workspace: Workspace,
  userTexts: string[],
  selectedId: string | null,
) {
  let quote: QuoteDraft | null = null;
  if (output.quote) {
    const client = resolveClient(
      output.quote.clientName,
      workspace,
      selectedId,
    );
    quote = {
      client: client?.name ?? output.quote.clientName,
      clientId: client?.id ?? "",
      subject: output.quote.subject,
      vatBasisPoints: -1,
      lines: output.quote.items.map((item) => {
        const catalog = item.catalogId
          ? workspace.catalog.find((entry) => entry.id === item.catalogId)
          : undefined;
        const explicit =
          item.netPrice !== null &&
          hasExplicitNetPrice(item.netPrice, item.priceEvidence, userTexts);
        let quantity = item.quantity;
        try {
          parseQuantityHundredths(quantity);
        } catch {
          quantity = "";
        }
        return {
          id: crypto.randomUUID(),
          label: catalog?.name ?? item.label,
          unit: catalog?.unit ?? item.unit,
          quantity,
          price: explicit ? item.netPrice! : (catalog?.price ?? ""),
          source: explicit
            ? ("user-input" as const)
            : catalog
              ? ("catalog" as const)
              : ("manual" as const),
        };
      }),
    };
  }
  let report = null;
  if (output.report) {
    const client = resolveClient(
      output.report.clientName,
      workspace,
      selectedId,
    );
    report = {
      ...newReport(client),
      client: client?.name ?? output.report.clientName,
      subject: output.report.subject,
      work: output.report.work,
      measurements: output.report.measurements,
      recommendations: output.report.recommendations,
    };
  }
  // Tekst LLM nigdy nie staje się finansowym podsumowaniem karty.
  const reply = quote
    ? "Szkic wyceny jest przygotowany. Sprawdź dopasowanie pozycji, uzupełnij brakujące ceny i wybierz VAT przed zapisem."
    : report
      ? "Szkic protokołu jest przygotowany. Sprawdź opis czynności i pomiarów przed zapisem."
      : output.reply;
  return { reply, quote, report };
}
export type AssistantResult = ReturnType<typeof materializeAssistant> & {
  sources: WebSource[];
  creditsUsed: number;
  model: string;
  usage?: AiUsage;
};
