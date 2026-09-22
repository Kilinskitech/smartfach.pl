import type Stripe from "stripe";

/** Uses Stripe's request timestamp: expiration must not generate a second confirmation. */
export function cancellationRequest(subscription: Stripe.Subscription) {
  if (subscription.metadata.smartfach_email_confirmation_hold === "true" ||
      subscription.metadata.smartfach_account_deleted === "true" ||
      !subscription.canceled_at) return null;
  const scheduled = subscription.cancel_at_period_end || typeof subscription.cancel_at === "number";
  const canceled = subscription.status === "canceled";
  if (!scheduled && !canceled) return null;
  const reason = subscription.cancellation_details?.reason;
  if (reason === "payment_failed" || reason === "payment_disputed" ||
      (canceled && reason !== "cancellation_requested")) return null;
  const periodEnd = Math.max(0, ...subscription.items.data.map(item => item.current_period_end)
    .filter((value): value is number => typeof value === "number"));
  const endsAt = canceled ? subscription.ended_at : subscription.cancel_at ??
    (subscription.status === "trialing" ? subscription.trial_end : periodEnd);
  if (!endsAt) return null;
  return {
    id: `${subscription.id}-${subscription.canceled_at}`,
    requestedAt: subscription.canceled_at,
    endsAt,
    canceled,
    trial: Boolean(subscription.trial_start && subscription.trial_end &&
      subscription.canceled_at >= subscription.trial_start &&
      subscription.canceled_at < subscription.trial_end && endsAt <= subscription.trial_end),
    activeAccess: subscription.status === "trialing" || subscription.status === "active",
  };
}

export function cancellationMessage(request: NonNullable<ReturnType<typeof cancellationRequest>>, plan: "lite" | "pro") {
  const date = new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "long", timeStyle: "short", timeZone: "Europe/Warsaw",
  }).format(new Date(request.endsAt * 1000));
  return {
    subject: request.trial ? "Potwierdzenie anulowania próby — SmartFach" : "Potwierdzenie anulowania abonamentu — SmartFach",
    body: [
      `Potwierdzamy anulowanie ${request.trial ? "okresu próbnego" : "abonamentu"} SmartFach ${plan === "pro" ? "Pro" : "Lite"}.`,
      request.canceled
        ? `Ten abonament zakończył się ${date} (czas polski). Dostęp w ramach tego abonamentu został zakończony.`
        : request.activeAccess
          ? `Możesz korzystać z obecnego planu do ${date} (czas polski). Wtedy dostęp w ramach tego abonamentu się zakończy.`
          : `Ten abonament zakończy się ${date} (czas polski). Anulowanie nie przywraca wcześniej wstrzymanego dostępu.`,
      request.trial
        ? "Nie pobierzemy opłaty za przejście z tej próby na płatny plan, jeśli nie wznowisz abonamentu."
        : "Po wskazanej dacie ten abonament nie będzie się odnawiać. Anulowanie nie powoduje zwrotu wcześniejszych opłat ani umorzenia ewentualnych zaległości.",
      "Nie musisz ponownie anulować planu. Rezygnacja z abonamentu nie usuwa Twojego konta.",
      "W razie pytań odpowiedz na tę wiadomość.\nZespół SmartFach",
    ].join("\n\n"),
  };
}
