"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  isPlanAvailableForSalesEntry,
  planIdSchema,
  salesEntrySchema,
} from "@/domain/billing";
import { applicationUrl } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; success?: string } | undefined;

const credentialsSchema = z.object({
  email: z.email("Podaj poprawny adres e-mail.").trim().max(254),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków.").max(200),
});

const registrationSchema = credentialsSchema.extend({
  displayName: z.string().trim().min(2, "Podaj imię lub nazwę firmy.").max(160),
  accountType: salesEntrySchema,
  plan: planIdSchema,
  terms: z.literal("accepted", "Zaakceptuj regulamin i politykę prywatności."),
}).superRefine((input, context) => {
  if (!isPlanAvailableForSalesEntry(input.accountType, input.plan))
    context.addIssue({
      code: "custom",
      path: ["plan"],
      message: "Wybierz plan dostępny dla swojej sytuacji.",
    });
});

function message(error: unknown) {
  if (!(error instanceof Error)) return "Nie udało się wykonać operacji.";
  if (/invalid login credentials/i.test(error.message))
    return "Nieprawidłowy e-mail lub hasło.";
  if (/already registered|already exists/i.test(error.message))
    return "Konto z tym adresem już istnieje. Zaloguj się.";
  return "Nie udało się połączyć z kontem. Spróbuj ponownie.";
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: message(error) };
  const requested = String(formData.get("next") ?? "");
  redirect(requested.startsWith("/platnosc") ? requested : "/app");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registrationSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
    accountType: formData.get("accountType"),
    plan: formData.get("plan"),
    terms: formData.get("terms"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = await createClient();
  const next = `/platnosc?plan=${parsed.data.plan}`;
  const callback = new URL("/auth/callback", applicationUrl());
  callback.searchParams.set("next", next);
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: callback.toString(),
      data: {
        display_name: parsed.data.displayName,
        account_type: parsed.data.accountType,
        plan: parsed.data.plan,
      },
    },
  });
  if (error) return { error: message(error) };
  if (data.session) redirect(next);
  return {
    success:
      "Sprawdź pocztę i potwierdź adres e-mail. Potem wybierzesz kartę i uruchomisz 3-dniową próbę.",
  };
}
