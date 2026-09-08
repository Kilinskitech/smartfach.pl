import { legalDocumentText, termsDocument, privacyDocument } from "@/domain/legal";
import { getOperator } from "@/server/operator-settings";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ document: string }> }) {
  const { document } = await context.params;
  if (!["regulamin", "polityka-prywatnosci"].includes(document))
    return new Response("Nie znaleziono dokumentu.", { status: 404 });
  const operator = await getOperator();
  const content = document === "regulamin" ? termsDocument(operator) : privacyDocument(operator);
  return new Response(legalDocumentText(content), { headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Disposition": `attachment; filename="smartfach-${document}-${content.version}.txt"`,
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex",
  } });
}
