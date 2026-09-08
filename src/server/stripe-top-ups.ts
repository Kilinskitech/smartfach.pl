import "server-only";
import { z } from "zod";
import type Stripe from "stripe";
import {
  creditPackById,
  creditPackIdSchema,
  stripeExistingCustomerUpdate,
  type CreditPackId,
} from "@/domain/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { applicationUrl, getStripe } from "@/lib/stripe";
import { recordPurchaseAcceptance } from "./purchase-legal";

const identitySchema = z.uuid();

export async function createUsageTopUpCheckout(input: {
  organizationId: string;
  userId: string;
  customerId: string;
  packId: CreditPackId;
  idempotencyKey: string;
}) {
  const stripe = getStripe();
  const pack = creditPackById(input.packId);
  const acceptanceId = await recordPurchaseAcceptance({ userId: input.userId, purchaseKey: input.idempotencyKey,
    offer: `Jednorazowe zwiększenie limitu SmartFach: ${pack.credits} jednostek za ${pack.price} (cena całkowita). Bez automatycznego odnowienia. Wykorzystanie wymaga aktywnego abonamentu; niewykorzystany zapas przechodzi na następne okresy.`,
  });
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      submit_type: "pay",
      locale: "pl",
      custom_text: { submit: { message: `${pack.credits} jednostek za ${pack.price}. Zakup jednorazowy, wymaga aktywnego abonamentu. Niewykorzystany zapas przechodzi na następne okresy.` } },
      customer: input.customerId,
      customer_update: stripeExistingCustomerUpdate,
      client_reference_id: input.userId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pln",
            unit_amount: pack.unitAmountGrosze,
            product_data: {
              name: "Jednorazowe zwiększenie limitu SmartFach",
              description: "Dodatkowy zakres pracy AI bez zmiany abonamentu.",
            },
          },
        },
      ],
      tax_id_collection: { enabled: true },
      metadata: {
        purchase_type: "usage_top_up",
        organization_id: input.organizationId,
        user_id: input.userId,
        top_up_pack: input.packId,
        legal_acceptance_id: acceptanceId,
      },
      success_url: `${applicationUrl()}/platnosc/limit/sukces?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${applicationUrl()}/app?limit=anulowano`,
    },
    { idempotencyKey: input.idempotencyKey },
  );
  if (!session.url) throw new Error("Stripe nie zwrócił adresu płatności.");
  return session;
}

export async function grantUsageTopUpFromSession(
  session: Stripe.Checkout.Session,
  expected?: { organizationId: string; userId: string },
) {
  if (
    session.metadata?.purchase_type !== "usage_top_up" ||
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid"
  )
    throw new Error("Płatność zwiększenia limitu nie jest zakończona.");

  const organizationId = identitySchema.parse(
    session.metadata.organization_id,
  );
  const userId = identitySchema.parse(session.metadata.user_id);
  const packId = creditPackIdSchema.parse(session.metadata.top_up_pack);
  const pack = creditPackById(packId);
  if (
    expected &&
    (expected.organizationId !== organizationId || expected.userId !== userId)
  )
    throw new Error("Płatność nie należy do tego konta.");
  if (
    session.currency?.toLowerCase() !== "pln" ||
    session.amount_total !== pack.unitAmountGrosze
  )
    throw new Error("Kwota płatności nie zgadza się z wybranym pakietem.");

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("grant_usage_top_up", {
    target_organization_id: organizationId,
    target_user_id: userId,
    target_checkout_session_id: session.id,
    target_pack_id: packId,
    target_granted_credits: pack.credits,
    target_amount_total_grosze: pack.unitAmountGrosze,
    target_currency: "pln",
  });
  if (error) {
    console.error("Nie zapisano zwiększenia limitu", {
      code: error.code,
      checkoutSessionId: session.id,
    });
    throw new Error("Nie udało się dopisać zwiększenia limitu do konta.");
  }
  return { pack, newlyGranted: data === true };
}

export async function retrieveAndGrantUsageTopUp(
  sessionId: string,
  expected?: { organizationId: string; userId: string },
) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return grantUsageTopUpFromSession(session, expected);
}
