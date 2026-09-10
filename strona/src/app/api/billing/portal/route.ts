import { createAdminClient } from "@/lib/supabase/admin";
import { applicationUrl, getStripe } from "@/lib/stripe";
import { authenticatedContext } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const context = await authenticatedContext();
    if (context.organizationRole !== "owner")
      return Response.json({ error: "Tylko właściciel zarządza płatnościami." }, { status: 403 });
    const admin = createAdminClient();
    const { data } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", context.organizationId)
      .maybeSingle();
    if (!data?.stripe_customer_id)
      return Response.json({ error: "Konto nie ma jeszcze profilu płatniczego." }, { status: 404 });
    const session = await getStripe().billingPortal.sessions.create({
      customer: String(data.stripe_customer_id),
      return_url: `${applicationUrl()}/app`,
    });
    return Response.json({ url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Nie otwarto płatności." },
      { status: 400 },
    );
  }
}

