import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import type Stripe from "stripe";
import { legalDocumentText, termsDocument, privacyDocument, termsAcknowledgement, earlyServiceRequest } from "@/domain/legal";
import { legalDocumentVersion } from "@/domain/operator";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOperator } from "./operator-settings";
import { sendContractEmail, smtpConfigured } from "./transactional-email";

export async function recordPurchaseAcceptance(input: { userId: string; purchaseKey: string; offer: string }) {
  if (/^(sk|rk)_live_/.test(process.env.STRIPE_SECRET_KEY?.trim() ?? "") && !smtpConfigured())
    throw new Error("Sprzedaż Live wymaga SMTP do potwierdzeń umowy.");
  const operator = await getOperator();
  const terms = legalDocumentText(termsDocument(operator));
  const privacy = legalDocumentText(privacyDocument(operator));
  const snapshot = { offer: input.offer, terms, privacy, termsAcknowledgement, earlyServiceRequest, operator };
  const admin = createAdminClient();
  const { error } = await admin.from("purchase_acceptances").upsert({
    user_id: input.userId, purchase_key: input.purchaseKey, document_version: legalDocumentVersion,
    document_hash: createHash("sha256").update(JSON.stringify(snapshot)).digest("hex"), snapshot,
  }, { onConflict: "purchase_key", ignoreDuplicates: true });
  if (error) throw new Error("Nie zapisano akceptacji warunków zakupu.");
  const { data, error: readError } = await admin.from("purchase_acceptances")
    .select("id,user_id,snapshot").eq("purchase_key", input.purchaseKey).single();
  if (readError || data.user_id !== input.userId || data.snapshot.offer !== input.offer)
    throw new Error("Nie można zweryfikować warunków zakupu.");
  return String(data.id);
}

const snapshotSchema = z.object({
  offer: z.string(), terms: z.string(), privacy: z.string(),
  termsAcknowledgement: z.string(), earlyServiceRequest: z.string(),
  operator: z.object({ email: z.email() }),
});

export async function confirmPurchaseContract(session: Stripe.Checkout.Session, trialEnd?: number | null) {
  const acceptanceId = session.metadata?.legal_acceptance_id;
  // Existing sandbox purchases predate collection of these statements.
  if (!acceptanceId) return;
  if (session.status !== "complete" || (session.mode === "payment" && session.payment_status !== "paid"))
    throw new Error("Nie można potwierdzić nieukończonego zakupu.");
  const admin = createAdminClient();
  const { data, error } = await admin.from("purchase_acceptances")
    .select("id,user_id,snapshot,accepted_at,document_hash,document_version").eq("id", acceptanceId).single();
  if (error || !data.user_id || data.user_id !== session.metadata?.user_id)
    throw new Error("Nie znaleziono akceptacji dla zamówienia.");
  const { data: auth, error: authError } = await admin.auth.admin.getUserById(data.user_id);
  if (authError || !auth.user?.email) throw new Error("Nie znaleziono odbiorcy potwierdzenia.");
  const snapshot = snapshotSchema.parse(data.snapshot);
  const trialDate = trialEnd ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(trialEnd * 1000)) : null;
  const body = [
    "Potwierdzenie zamówienia SmartFach", `Numer: ${session.id}`, `Konto: ${auth.user.email}`,
    `Warunki zaakceptowano: ${data.accepted_at}`, `Wersja dokumentów: ${data.document_version}`,
    snapshot.offer,
    ...(trialDate ? [`Próba kończy się: ${trialDate} (czas polski). Pierwsza opłata nastąpi po próbie, jeśli wcześniej nie anulujesz.`,
      "Do czasu potwierdzenia e-maila odnowienie jest wstrzymane. Potwierdź adres, aby korzystać z asystenta."] : []),
    "Abonament anulujesz przez Ustawienia → Zarządzaj abonamentem. Rezygnację, reklamację lub odstąpienie możesz wysłać również na " + snapshot.operator.email + ".",
    "Konsument ma 14 dni na odstąpienie od zawartej umowy. Zasady i formularz są poniżej.",
    "Twoje oświadczenia:", snapshot.termsAcknowledgement, snapshot.earlyServiceRequest,
    `Suma kontrolna zapisanych warunków: ${data.document_hash}`,
    snapshot.terms, snapshot.privacy,
  ].join("\n\n");
  const { error: saveError } = await admin.from("purchase_contracts").upsert({
    checkout_session_id: session.id, acceptance_id: acceptanceId, user_id: data.user_id,
    recipient: auth.user.email, body,
  }, { onConflict: "checkout_session_id", ignoreDuplicates: true });
  if (saveError) throw new Error("Nie zapisano potwierdzenia umowy.");
  if (!smtpConfigured() && !session.livemode) {
    console.warn("Potwierdzenie testowe zapisane; wysyłka wymaga SMTP.", { sessionId: session.id });
    return;
  }
  const { data: contract, error: contractError } = await admin.from("purchase_contracts")
    .select("body,recipient,email_sent_at").eq("checkout_session_id", session.id).single();
  if (contractError) throw new Error("Nie odczytano potwierdzenia umowy.");
  if (contract.email_sent_at) return;
  const { data: claimed, error: claimError } = await admin.rpc("claim_contract_delivery", { session_id: session.id });
  if (claimError || !claimed) throw new Error("Potwierdzenie czeka na zakończenie wysyłki; ponów webhook.");
  try {
    await sendContractEmail({ recipient: contract.recipient, body: contract.body, sessionId: session.id, replyTo: snapshot.operator.email });
    const { error: markError } = await admin.from("purchase_contracts")
      .update({ email_sent_at: new Date().toISOString(), delivery_claimed_at: null }).eq("checkout_session_id", session.id);
    if (markError) throw new Error("Nie zapisano potwierdzenia dostarczenia.");
  } catch (deliveryError) {
    await admin.from("purchase_contracts").update({ delivery_claimed_at: null }).eq("checkout_session_id", session.id);
    throw deliveryError;
  }
}
