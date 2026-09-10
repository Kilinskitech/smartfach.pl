"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";

export function CheckoutProgress({ creatingAccount = false }: { creatingAccount?: boolean }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, []);
  return <div className="checkout-progress" role="status" aria-live="polite">
    <LoaderCircle className="checkout-progress-spinner" size={24} aria-hidden="true" />
    <div><strong>{creatingAccount ? "Tworzymy konto i otwieramy Stripe" : "Otwieramy bezpieczne płatności"}</strong>
      <p>{slow ? "Połączenie trwa dłużej niż zwykle. Pozostaw tę stronę otwartą — nie klikaj ponownie i nie odświeżaj formularza." : "Za chwilę przejdziesz do formularza. Nie zamykaj tej strony."}</p>
      <small><ShieldCheck size={14} /> Ten krok nie pobiera pieniędzy z karty.</small>
    </div>
  </div>;
}
