"use client";
import Link from "next/link";
import { earlyServiceRequest } from "@/domain/legal";
import { legalDocumentVersion } from "@/domain/operator";

export function PurchaseConsent({ onChange }: { onChange?: (accepted: boolean) => void }) {
  function changed(event: React.ChangeEvent<HTMLDivElement>) {
    const fields = event.currentTarget.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    onChange?.(Array.from(fields).every(input => input.checked));
  }
  return <div className="purchase-consent" onChange={changed}>
    <input type="hidden" name="legalVersion" value={legalDocumentVersion} />
    <label className="auth-consent"><input type="checkbox" name="terms" value="accepted" required /><span>Akceptuję <Link href="/regulamin" target="_blank">Regulamin</Link> i potwierdzam zapoznanie się z <Link href="/polityka-prywatnosci" target="_blank">Polityką prywatności</Link>.</span></label>
    <label className="auth-consent"><input type="checkbox" name="earlyPerformance" value="requested" required /><span>{earlyServiceRequest}</span></label>
  </div>;
}
