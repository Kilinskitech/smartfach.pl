"use server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { getOperator } from "@/server/operator-settings";
import { sendContractEmail, smtpConfigured } from "@/server/transactional-email";
import { assertDeploymentIdentity } from "@/server/operations";

export type WithdrawalState = { error?: string; success?: string } | undefined;
const schema = z.object({
  fullName: z.string().trim().min(2).max(160), email: z.email().trim().max(254),
  order: z.string().trim().regex(/^cs_(?:test_|live_)?[A-Za-z0-9]+$/).max(200),
  confirm: z.literal("yes"),
});

export async function submitWithdrawal(_: WithdrawalState, formData: FormData): Promise<WithdrawalState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Podaj imię i nazwisko, e-mail konta oraz numer zamówienia zaczynający się od cs_." };
  try {
    await assertDeploymentIdentity();
    const session = await getStripe().checkout.sessions.retrieve(parsed.data.order);
    if (session.status !== "complete" || !session.metadata?.user_id)
      return { error: "Nie znaleziono ukończonego zamówienia dla tych danych. Możesz złożyć oświadczenie również przez kontakt e-mail." };
    const admin = createAdminClient();
    const { data: account, error: accountError } = await admin.auth.admin.getUserById(session.metadata.user_id);
    if (accountError || account.user?.email?.toLowerCase() !== parsed.data.email.toLowerCase())
      return { error: "Nie znaleziono ukończonego zamówienia dla tych danych. Możesz złożyć oświadczenie również przez kontakt e-mail." };
    const statement = `Ja, ${parsed.data.fullName}, odstępuję od umowy dotyczącej zamówienia SmartFach ${session.id}. E-mail konta i adres do potwierdzenia: ${parsed.data.email}.`;
    const { error } = await admin.from("withdrawal_requests").upsert({ user_id: account.user.id, checkout_session_id: session.id, full_name: parsed.data.fullName, email: account.user.email, statement }, { onConflict: "checkout_session_id", ignoreDuplicates: true });
    if (error) throw new Error("Nie zapisano oświadczenia.");
    const { data: record, error: readError } = await admin.from("withdrawal_requests").select("id,received_at,email_sent_at,statement,email").eq("checkout_session_id", session.id).single();
    if (readError) throw new Error("Nie odczytano oświadczenia.");
    const confirmation = `Potwierdzenie otrzymania odstąpienia od umowy\n\nOtrzymano: ${new Date(record.received_at).toLocaleString("pl-PL", { timeZone: "Europe/Warsaw" })} (czas polski).\nNumer zgłoszenia: ${record.id}\n\n${record.statement}\n\nOświadczenie zostało przyjęte. Oddzielnie otrzymasz informację o zakończeniu umowy i należnym rozliczeniu. Potwierdzenie odbioru nie oznacza jeszcze wykonania zwrotu płatności.`;
    if (!record.email_sent_at) {
      try {
        if (!smtpConfigured()) throw new Error("Brak SMTP.");
        const operator = await getOperator();
        await sendContractEmail({ recipient: record.email, body: confirmation, sessionId: `withdrawal-${record.id}`, replyTo: operator.email, subject: "Potwierdzenie otrzymania odstąpienia — SmartFach" });
        const { error: markError } = await admin.from("withdrawal_requests").update({ email_sent_at: new Date().toISOString() }).eq("id", record.id);
        if (markError) throw new Error("Nie zapisano statusu wiadomości.");
      } catch {
        return { success: `${confirmation}\n\nWysyłka e-maila nie powiodła się. Oświadczenie jest już zapisane z powyższą datą — zachowaj to potwierdzenie. Możesz ponowić ten sam formularz, aby ponowić wysyłkę, lub skontaktować się z nami.` };
      }
    }
    return { success: `${confirmation}\n\nPotwierdzenie wysłaliśmy również e-mailem.` };
  } catch {
    return { error: "Nie udało się zweryfikować lub zapisać oświadczenia. Spróbuj ponownie albo skorzystaj z e-maila na stronie Kontakt — zachowujesz tę możliwość." };
  }
}
