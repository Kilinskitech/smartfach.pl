import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Home } from "@/components/home";
import { isPlatformAdminIdentity } from "@/lib/platform-admin";
import { supabaseConfigured } from "@/lib/supabase/config";
import { authenticatedContext, SubscriptionRequired, requireSubscription } from "@/server/auth";

export const metadata: Metadata = {
  title: "SmartFach — aplikacja",
  description: "Prywatna przestrzeń pracy w SmartFach.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AppPage() {
  if (!supabaseConfigured())
    return <main className="setup-required"><h1>Podłącz Supabase</h1><p>Lokalny profil testowy został usunięty. Po dodaniu konfiguracji utworzysz tutaj pierwsze prawdziwe konto użytkownika.</p></main>;
  const context = await authenticatedContext();
  if (
    isPlatformAdminIdentity({ userId: context.userId, email: context.email })
  )
    redirect("/admin");
  try {
    await requireSubscription(context.supabase, context.organizationId);
  } catch (error) {
    if (error instanceof SubscriptionRequired) redirect("/platnosc");
    throw error;
  }
  return <Home />;
}
