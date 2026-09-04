import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { supabaseConfigured } from "@/lib/supabase/config";
import { planIdSchema } from "@/domain/billing";
import { journeyModeSchema } from "@/domain/workspace";

export const metadata: Metadata = { title: "Konto — SmartFach", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ dalej?: string; plan?: string; typ?: string }> }) {
  if (!supabaseConfigured())
    return <main className="setup-required"><h1>Supabase czeka na konfigurację</h1><p>Dodaj adres projektu i publishable key do zmiennych środowiskowych. Lokalne konto testowe zostało usunięte.</p></main>;
  const params = await searchParams;
  const selectedPlan = planIdSchema.safeParse(params.plan);
  const selectedType = journeyModeSchema.safeParse(params.typ);
  return <AuthForm next={params.dalej?.startsWith("/") ? params.dalej : "/app"} initialPlan={selectedPlan.success ? selectedPlan.data : "pro"} initialAccountType={selectedType.success ? selectedType.data : "operate"} />;
}
