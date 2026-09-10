import "server-only";
import Stripe from "stripe";
import type { PlanId } from "@/domain/billing";

export function stripeConfigured() {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_WEBHOOK_SECRET?.trim() &&
      process.env.STRIPE_PRICE_LITE?.trim() &&
      process.env.STRIPE_PRICE_PRO?.trim(),
  );
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) throw new Error("Brak konfiguracji Stripe.");
  return new Stripe(key, { timeout: 15_000, maxNetworkRetries: 1, appInfo: { name: "SmartFach", version: "0.1.0" } });
}

export function stripePriceId(plan: PlanId) {
  const ids: Record<PlanId, string | undefined> = {
    lite: process.env.STRIPE_PRICE_LITE,
    pro: process.env.STRIPE_PRICE_PRO,
  };
  const id = ids[plan]?.trim();
  if (!id) throw new Error(`Plan ${plan} nie ma ceny Stripe.`);
  return id;
}

export function planForStripePriceId(priceId: string | undefined) {
  if (!priceId) return undefined;
  const matches: Array<[PlanId, string | undefined]> = [
    ["lite", process.env.STRIPE_PRICE_LITE],
    ["pro", process.env.STRIPE_PRICE_PRO],
  ];
  return matches.find(([, configured]) => configured?.trim() === priceId)?.[0];
}

export function applicationUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return new URL(configured).origin;
  if (process.env.NODE_ENV === "development") return "http://127.0.0.1:3000";
  throw new Error("Brak NEXT_PUBLIC_APP_URL.");
}
