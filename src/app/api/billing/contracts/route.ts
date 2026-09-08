import { authenticatedContext, AuthenticationRequired } from "@/server/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const context = await authenticatedContext();
    const { data, error } = await createAdminClient().from("purchase_contracts")
      .select("body").eq("user_id", context.userId).order("created_at", { ascending: true });
    if (error) throw new Error("Nie pobrano potwierdzeń.");
    return new Response(data?.length ? data.map(row => row.body).join("\n\n----------\n\n") : "Nie ma jeszcze potwierdzeń zamówień dla tego konta. Starsze zamówienie możesz zgłosić przez Kontakt.", {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": 'attachment; filename="smartfach-moje-zamowienia.txt"' },
    });
  } catch (error) {
    return Response.json({ error: "Nie można pobrać potwierdzeń. Zaloguj się lub spróbuj ponownie." }, { status: error instanceof AuthenticationRequired ? 401 : 500, headers: { "Cache-Control": "no-store" } });
  }
}
