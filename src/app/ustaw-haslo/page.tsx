import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand";
import { PasswordUpdateForm } from "@/components/password-update-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Ustaw nowe hasło — SmartFach",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || typeof data?.claims?.sub !== "string") redirect("/logowanie");

  return (
    <main className="auth-page password-update-page">
      <section className="auth-story">
        <Link href="/" className="auth-brand"><BrandMark size={46} /><span>Smart<b>Fach</b></span></Link>
        <div>
          <p className="eyebrow">BEZPIECZNY POWRÓT</p>
          <h1>Odzyskaj dostęp do swojej pracy.</h1>
          <p>Po zapisaniu nowego hasła wrócisz bezpośrednio do SmartFach.</p>
        </div>
        <ul>
          <li><Check size={17} /> link działa tylko przez ograniczony czas</li>
          <li><ShieldCheck size={17} /> hasło jest obsługiwane przez Supabase Auth</li>
        </ul>
      </section>
      <section className="auth-card"><PasswordUpdateForm /></section>
    </main>
  );
}
