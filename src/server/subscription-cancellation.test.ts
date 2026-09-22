import type Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { cancellationMessage, cancellationRequest } from "./subscription-cancellation";

export const subscription = (overrides: Partial<Stripe.Subscription> = {}) => ({
  id: "sub_synthetic", status: "trialing", metadata: { user_id: "user", organization_id: "org", plan: "lite" },
  canceled_at: 1790001000, cancel_at_period_end: true, cancel_at: 1790200000,
  trial_start: 1790000000, trial_end: 1790200000, ended_at: null,
  cancellation_details: { reason: "cancellation_requested", comment: null, feedback: null },
  items: { data: [{ current_period_end: 1790200000, price: { id: "price_synthetic" } }] },
  ...overrides,
}) as Stripe.Subscription;

describe("cancellation confirmation", () => {
  it("explains trial cancellation with a precise Warsaw date and no first charge", () => {
    const request = cancellationRequest(subscription())!;
    expect(request.trial).toBe(true);
    const message = cancellationMessage(request, "lite");
    expect(message.subject).toContain("próby");
    expect(message.body).toContain("SmartFach Lite");
    expect(message.body).toContain("Nie pobierzemy opłaty za przejście");
    expect(message.body).toContain("Możesz korzystać");
    expect(message.body).toContain("czas polski");
  });
  it("confirms paid cancellation without promising a refund or forgiving debt", () => {
    const request = cancellationRequest(subscription({ status: "active", trial_start: null, trial_end: null }))!;
    const message = cancellationMessage(request, "pro");
    expect(message.body).toContain("SmartFach Pro");
    expect(message.body).toContain("nie powoduje zwrotu");
    expect(message.subject).toContain("abonamentu");
    expect(message.body).not.toContain("Nie pobierzemy opłaty za przejście");
  });
  it("uses actual end for immediate cancellation and keeps the same dedup key at expiry", () => {
    const request = cancellationRequest(subscription({ status: "canceled", ended_at: 1790001100, cancel_at: null, cancel_at_period_end: false }))!;
    expect(request.endsAt).toBe(1790001100);
    expect(request.id).toBe(cancellationRequest(subscription())!.id);
    expect(cancellationMessage(request, "lite").body).toContain("został zakończony");
  });
  const ignored: Partial<Stripe.Subscription>[] = [
    { metadata: { smartfach_email_confirmation_hold: "true" } },
    { metadata: { smartfach_account_deleted: "true" } },
    { canceled_at: null, cancel_at: null, cancel_at_period_end: false },
    { cancel_at: null, cancel_at_period_end: false },
    { cancellation_details: { reason: "payment_failed", comment: null, feedback: null, feedback_option: null } },
    { cancellation_details: { reason: "payment_disputed", comment: null, feedback: null, feedback_option: null } },
    { status: "canceled", ended_at: 1790200000, cancellation_details: null },
  ];
  it.each(ignored)("ignores non-user cancellations or resumed plans: %j", overrides => {
    expect(cancellationRequest(subscription(overrides))).toBeNull();
  });
  it("does not promise access for a suspended subscription", () => {
    const request = cancellationRequest(subscription({ status: "past_due" }))!;
    expect(cancellationMessage(request, "lite").body).toContain("nie przywraca");
  });
  it("does not call a future paid period a canceled free trial", () => {
    const request = cancellationRequest(subscription({ cancel_at: 1790400000 }))!;
    expect(request.trial).toBe(false);
  });
});
