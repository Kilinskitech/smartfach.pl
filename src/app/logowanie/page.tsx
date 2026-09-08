import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { isPlatformAdminIdentity } from "@/lib/platform-admin";
import { supabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { publicPlanIdSchema } from "@/domain/billing";

export const metadata: Metadata = { title: "Konto — SmartFach", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ dalej?: string; plan?: string; anulowano?: string; blad?: string }> }) {
  if (!supabaseConfigured())
    return <main className="setup-required"><h1>Supabase czeka na konfigurację</h1><p>Dodaj adres projektu i publishable key do zmiennych środowiskowych. Lokalne konto testowe zostało usunięte.</p></main>;
  const params = await searchParams;
  const requestedNext = params.dalej?.startsWith("/platnosc")
    ? params.dalej
    : "/app";
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getClaims();
  const userId =
    typeof session?.claims?.sub === "string" ? session.claims.sub : null;
  const email =
    typeof session?.claims?.email === "string" ? session.claims.email : null;

  const { data: verifiedUser } = userId
    ? await supabase.auth.getUser()
    : { data: { user: null } };
  if (userId && verifiedUser.user?.email_confirmed_at) {
    redirect(
      isPlatformAdminIdentity({ userId, email }) ? "/admin" : requestedNext,
    );
  }

  const selectedPlan = publicPlanIdSchema.safeParse(params.plan);
  return <AuthForm loginFirst={Boolean(params.dalej) || !params.plan} next={requestedNext} initialPlan={selectedPlan.success ? selectedPlan.data : "pro"} checkoutCanceled={params.anulowano === "1"} confirmationFailed={params.blad === "potwierdzenie"} confirmationRequired={params.blad === "potwierdz-email" || Boolean(userId && !verifiedUser.user?.email_confirmed_at)} />;
}
