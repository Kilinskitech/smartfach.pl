import { z } from "zod";
import { parseMoneyCents } from "./quotes/calculate";
import { validateDraft, type QuoteDraft } from "./quotes/draft";
import { billingSchema, type Billing, type PlanId } from "./billing";

const name = z.string().trim().min(1).max(160);
const id = z.string().min(1).max(80);
const optionalText = z.string().max(500);
const money = z
  .string()
  .max(17)
  .refine((value) => {
    try {
      parseMoneyCents(value);
      return true;
    } catch {
      return false;
    }
  }, "Nieprawidłowa cena netto.");
export const clientSchema = z.object({
  id,
  name,
  phone: z.string().max(40),
  email: z.union([z.literal(""), z.email()]),
  address: optionalText,
  notes: z.string().max(3000),
});
export const priceSchema = z.object({
  id,
  name,
  unit: z.enum(["szt.", "godz.", "usł.", "m"]),
  price: money,
});
export const companySchema = z.object({
  name: z.string().max(160),
  phone: z.string().max(40),
  email: z.union([z.literal(""), z.email()]),
  address: optionalText,
  taxId: z.string().max(30),
});
export const teamRoleSchema = z.enum(["technician", "office", "manager"]);
export const teamMemberSchema = z.object({
  id,
  name,
  email: z.union([z.literal(""), z.email()]),
  phone: z.string().max(40),
  role: teamRoleSchema,
});
export const draftSchema = z
  .object({
    client: name,
    clientId: z.string().max(80).optional(),
    subject: name,
    vatBasisPoints: z.number().int(),
    lines: z
      .array(
        z.object({
          id,
          label: name,
          unit: z.string().max(12),
          price: money,
          quantity: z.string().max(17),
          source: z.enum([
            "command-demo",
            "rate-demo",
            "manual",
            "catalog",
            "user-input",
          ]),
        }),
      )
      .min(1)
      .max(100),
  })
  .refine(
    (draft) => validateDraft(draft).quote !== null,
    "Wycena wymaga poprawnych pozycji i VAT.",
  );
export const reportSchema = z.object({
  client: name,
  clientId: z.string().max(80),
  subject: name,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const date = new Date(value);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }),
  work: z.string().trim().min(1).max(8000),
  measurements: z.string().max(4000),
  recommendations: z.string().max(4000),
});
const documentBase = {
  id,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
};
export const documentSchema = z.discriminatedUnion("kind", [
  z.object({ ...documentBase, kind: z.literal("quote"), draft: draftSchema }),
  z.object({
    ...documentBase,
    kind: z.literal("report"),
    report: reportSchema,
  }),
]);
export const aiUsageSchema = z.object({
  providerRequestId: z.string().max(300).optional(),
  provider: z.string().max(200).optional(),
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  reasoningTokens: z.number().int().nonnegative(),
  cachedTokens: z.number().int().nonnegative(),
  costUsd: z.number().finite().nonnegative().max(1_000_000),
});
export const messageSchema = z.object({
  id,
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8000),
  model: z.string().max(180).optional(),
  usage: aiUsageSchema.optional(),
  sources: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(300),
        url: z
          .string()
          .trim()
          .max(2048)
          .regex(/^https?:\/\//),
      }),
    )
    .max(5)
    .optional(),
});
// Niezatwierdzony szkic może mieć braki. Nie jest dokumentem i nie przechodzi do PDF.
const pendingQuoteSchema = z.object({
  client: z.string().max(160),
  clientId: z.string().max(80).optional(),
  subject: z.string().max(160),
  vatBasisPoints: z.number().int(),
  lines: z
    .array(
      z.object({
        id,
        label: z.string().max(160),
        unit: z.string().max(12),
        price: z.string().max(17),
        quantity: z.string().max(17),
        source: z.enum([
          "command-demo",
          "rate-demo",
          "manual",
          "catalog",
          "user-input",
        ]),
      }),
    )
    .max(100),
});
const pendingReportSchema = reportSchema.extend({
  client: z.string().max(160),
  subject: z.string().max(160),
  work: z.string().max(8000),
});
export const pendingDocumentSchema = z
  .object({
    id,
    quote: pendingQuoteSchema.nullable(),
    report: pendingReportSchema.nullable(),
  })
  .refine((value) => Boolean(value.quote) !== Boolean(value.report));
export const workStyleSchema = z.enum(["remote", "local", "hybrid", "open"]);
export const conversationSchema = z.object({
  id,
  title: name,
  updatedAt: z.string().datetime(),
  messages: z.array(messageSchema).max(60),
  businessContext: z.string().max(3000).optional(),
  pendingDocument: pendingDocumentSchema.optional(),
});
export const journeySchema = z.object({
  aboutMe: z.string().trim().max(1200).optional(),
  focus: z.string().max(160),
  goal: z.string().max(500),
  workStyle: workStyleSchema.default("open"),
  weeklyHours: z.string().max(80).default(""),
  experience: z.string().max(1200).default(""),
  constraints: z.string().max(1200).default(""),
  onboardingCompleted: z.boolean().default(false),
});
export const workspaceSchema = z
  .object({
    version: z.literal(1),
    revision: z.number().int().nonnegative(),
    company: companySchema,
    clients: z.array(clientSchema).max(500),
    catalog: z.array(priceSchema).max(1000),
    team: z.array(teamMemberSchema).max(50).default([]),
    documents: z.array(documentSchema).max(500),
    conversations: z.array(conversationSchema).max(30),
    journey: journeySchema.default({
      focus: "",
      goal: "",
      workStyle: "open",
      weeklyHours: "",
      experience: "",
      constraints: "",
      onboardingCompleted: false,
    }),
    billing: billingSchema.default({
      plan: "lite",
      usedCredits: 0,
      topUpCredits: 0,
      periodStartedAt: "2026-09-01T00:00:00.000Z",
    }),
  })
  .superRefine((data, ctx) => {
    for (const key of [
      "clients",
      "catalog",
      "team",
      "documents",
      "conversations",
    ] as const) {
      if (new Set(data[key].map((item) => item.id)).size !== data[key].length)
        ctx.addIssue({
          code: "custom",
          path: [key],
          message: "Powtórzone identyfikatory.",
        });
    }
    const clients = new Set(data.clients.map((client) => client.id));
    data.documents.forEach((doc, index) => {
      const clientId =
        doc.kind === "quote" ? doc.draft.clientId : doc.report.clientId;
      if (clientId && !clients.has(clientId))
        ctx.addIssue({
          code: "custom",
          path: ["documents", index],
          message: "Nie ma wskazanego klienta.",
        });
    });
  });

export type Client = z.infer<typeof clientSchema>;
export type PriceItem = z.infer<typeof priceSchema>;
export type Company = z.infer<typeof companySchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type TeamRole = z.infer<typeof teamRoleSchema>;
export type VisitReport = z.infer<typeof reportSchema>;
export type WorkDocument = z.infer<typeof documentSchema>;
export type Conversation = z.infer<typeof conversationSchema>;
export type ChatMessage = z.infer<typeof messageSchema>;
export type AiUsage = z.infer<typeof aiUsageSchema>;
export type WebSource = NonNullable<ChatMessage["sources"]>[number];
export type Workspace = z.infer<typeof workspaceSchema>;
export type WorkStyle = z.infer<typeof workStyleSchema>;
export type { Billing };
export const emptyWorkspace: Workspace = {
  version: 1,
  revision: 0,
  company: { name: "", phone: "", email: "", address: "", taxId: "" },
  clients: [],
  catalog: [],
  team: [],
  documents: [],
  conversations: [],
  journey: {
    focus: "",
    goal: "",
    workStyle: "open",
    weeklyHours: "",
    experience: "",
    constraints: "",
    onboardingCompleted: false,
  },
  billing: {
    plan: "lite",
    usedCredits: 0,
    topUpCredits: 0,
    periodStartedAt: "2026-09-01T00:00:00.000Z",
  },
};
export function switchBillingPlan(
  workspace: Workspace,
  plan: PlanId,
): Workspace {
  return {
    ...workspace,
    billing: { ...workspace.billing, plan },
  };
}
export function newQuote(client?: Client): QuoteDraft {
  return {
    client: client?.name ?? "",
    clientId: client?.id ?? "",
    subject: "",
    vatBasisPoints: -1,
    lines: [
      {
        id: crypto.randomUUID(),
        label: "",
        unit: "szt.",
        price: "",
        quantity: "1",
        source: "manual",
      },
    ],
  };
}
export function newReport(client?: Client): VisitReport {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return {
    client: client?.name ?? "",
    clientId: client?.id ?? "",
    subject: "",
    date,
    work: "",
    measurements: "",
    recommendations: "",
  };
}
export const documentTitle = (doc: WorkDocument) =>
  doc.kind === "quote" ? doc.draft.subject : doc.report.subject;
export const documentClient = (doc: WorkDocument) =>
  doc.kind === "quote" ? doc.draft.client : doc.report.client;
export const documentClientId = (doc: WorkDocument) =>
  doc.kind === "quote" ? doc.draft.clientId : doc.report.clientId;
