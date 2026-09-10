import { z } from "zod";
import { publicPlanIdSchema } from "@/domain/billing";
import { authenticatedContext } from "@/server/auth";
import { limitedJson } from "@/server/request-body";
import { createSubscriptionCheckout } from "@/server/stripe-checkout";
import { purchaseConsentSchema } from "@/domain/legal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = purchaseConsentSchema.extend({
  plan: publicPlanIdSchema,
  idempotencyKey: z.uuid(),
});

export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await limitedJson(request, 10_000));
    const context = await authenticatedContext();
    if (context.organizationRole !== "owner")
      return Response.json(
        { error: "Tylko właściciel konta może zmienić abonament." },
        { status: 403 },
      );

    // authenticatedContext already verified the user against Auth. The checkout
    // service reads the current subscription/customer again under its lease.
    if (!context.email)
      return Response.json({ error: "Konto nie ma potwierdzonego adresu e-mail." }, { status: 401 });
    const session = await createSubscriptionCheckout({
      organizationId: context.organizationId,
      userId: context.userId,
      email: context.email,
      plan: input.plan,
      cancelPath: `/platnosc?plan=${input.plan}&anulowano=1`,
      idempotencyKey: `checkout:${context.organizationId}:${input.idempotencyKey}`,
    });
    return Response.json({ url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Nie utworzono sesji Stripe Checkout", {
      message: error instanceof Error ? error.message : "unknown",
    });
    return Response.json(
      { error: "Nie udało się otworzyć bezpiecznej płatności. Spróbuj ponownie." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}
