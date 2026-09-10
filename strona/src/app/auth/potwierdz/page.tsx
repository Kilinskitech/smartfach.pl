import type { Metadata } from "next";
import { MailCheck } from "lucide-react";
import { PaymentResultPage } from "@/components/payment-result";
import { EmailConfirmation } from "@/components/email-confirmation";
import { emailConfirmationSchema } from "@/lib/email-confirmation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Potwierdzenie adresu — SmartFach", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const parsed = emailConfirmationSchema.safeParse(params);
  const recovery = params.type === "recovery";
  return <PaymentResultPage icon={<MailCheck size={32} />} eyebrow="TWOJE KONTO SMARTFACH"
    title={parsed.success ? recovery ? "Ustaw nowe hasło" : "Potwierdź swój adres e-mail" : "Potrzebujesz nowego linku?"}
    description={parsed.success ? "Naciśnij przycisk poniżej, aby bezpiecznie dokończyć ten krok. Samo otwarcie strony nie zużywa linku." : "Ten link wygasł, został już wykorzystany albo jest niepełny. Jeśli konto zostało potwierdzone, wystarczy się zalogować."}
    tone="pending" steps={[]} trustText="Potwierdzenie adresu nie pobiera opłaty ani nie tworzy nowego abonamentu.">
    <EmailConfirmation token={parsed.success ? parsed.data.token_hash : undefined} type={recovery ? "recovery" : "signup"} />
  </PaymentResultPage>;
}
