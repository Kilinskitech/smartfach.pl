import type Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const mocks = vi.hoisted(() => ({ from: vi.fn(), payments: vi.fn() }));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mocks.from }),
}));
vi.mock("@/lib/stripe", () => ({
  planForStripePriceId: () => undefined,
}));

import { captureFirstPaidSubscriptionInvoice } from "./stripe-paid-invoice";

const subscription = {
  id: "sub_test_one",
  metadata: { user_id: "user-one", organization_id: "org-one", plan: "pro" },
  items: { data: [{ price: { id: "price_pro" } }] },
} as unknown as Stripe.Subscription;

function invoice(overrides: Partial<Stripe.Invoice> = {}) {
  return {
    id: "in_test_one",
    status: "paid",
    amount_paid: 9900,
    billing_reason: "subscription_cycle",
    currency: "pln",
    created: 1_800_000_000,
    status_transitions: { paid_at: 1_800_000_100 },
    parent: {
      type: "subscription_details",
      quote_details: null,
      subscription_details: { subscription, metadata: subscription.metadata },
    },
    ...overrides,
  } as unknown as Stripe.Invoice;
}

beforeEach(() => {
  vi.resetAllMocks();
  const query = {
    upsert: vi.fn(),
    select: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { event: "paid" }, error: null }),
  };
  query.upsert.mockReturnValue(query);
  query.select.mockReturnValue(query);
  mocks.from.mockReturnValue(query);
  mocks.payments.mockResolvedValue({
    data: [{
      id: "inpay_test_one",
      status: "paid",
      payment: { payment_intent: "pi_test_one", type: "payment_intent" },
      status_transitions: { paid_at: 1_800_000_100 },
    }],
  });
});

describe("first paid subscription invoice", () => {
  it("ignores the zero-value invoice created at trial start", async () => {
    const stripe = { invoicePayments: { list: mocks.payments } } as unknown as Stripe;
    expect(await captureFirstPaidSubscriptionInvoice(invoice({ amount_paid: 0, billing_reason: "subscription_create" }), stripe)).toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("captures the first non-zero subscription cycle with internal Stripe identifiers", async () => {
    const stripe = { invoicePayments: { list: mocks.payments } } as unknown as Stripe;
    await expect(captureFirstPaidSubscriptionInvoice(invoice(), stripe)).resolves.toEqual({
      invoiceId: "in_test_one",
      paymentId: "inpay_test_one",
      paymentIntentId: "pi_test_one",
      chargeId: null,
      subscriptionId: "sub_test_one",
      organizationId: "org-one",
      userId: "user-one",
      plan: "pro",
      amountGrosze: 9900,
      currency: "PLN",
      paidAt: new Date(1_800_000_100 * 1000).toISOString(),
    });
  });

  it("returns null when the user's first paid milestone already exists", async () => {
    const query = mocks.from();
    query.maybeSingle.mockResolvedValue({ data: null, error: null });
    const stripe = { invoicePayments: { list: mocks.payments } } as unknown as Stripe;
    expect(await captureFirstPaidSubscriptionInvoice(invoice(), stripe)).toBeNull();
  });
});
