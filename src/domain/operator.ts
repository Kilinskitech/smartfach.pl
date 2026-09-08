import { z } from "zod";

export const operatorSchema = z.object({
  name: z.string().trim().min(3).max(200),
  address: z.string().trim().min(8).max(300),
  taxId: z.string().regex(/^\d{10}$/, "NIP musi mieć 10 cyfr."),
  regon: z.string().regex(/^(\d{9}|\d{14})$/, "REGON musi mieć 9 albo 14 cyfr."),
  email: z.email().max(254),
  phone: z.string().trim().regex(/^\+?[\d\s()-]{9,24}$/, "Podaj numer telefonu."),
});
export type Operator = z.infer<typeof operatorSchema>;

export const smartFachOperator = {
  name: "KILIŃSKI TECH Szymon Kiliński",
  address: "Złotów 86, 55-106 Złotów",
  taxId: "9151830069",
  regon: "528527069",
  email: "kontakt@smartfach.pl",
  phone: "+48 662 410 479",
} as const satisfies Operator;

export const legalDocumentVersion = "2026-09-07" as const;
export const legalDocumentUpdatedAt = "7 września 2026 r." as const;
