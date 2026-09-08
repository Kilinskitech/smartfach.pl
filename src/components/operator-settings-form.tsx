"use client";

import { useActionState } from "react";
import { Building2, Save } from "lucide-react";
import type { Operator } from "@/domain/operator";
import { saveOperatorSettings } from "@/app/admin/actions";

export function OperatorSettingsForm({ operator }: { operator: Operator }) {
  const [state, action, pending] = useActionState(saveOperatorSettings, undefined);
  return <section className="admin-panel" id="dane-sprzedawcy">
    <div className="admin-panel-heading"><div><Building2 size={20} /><span><small>USTAWIENIA SERWISU</small><h2>Dane sprzedawcy</h2></span></div></div>
    <p>Te dane są publiczne. Zmiana trafi do Kontaktów, Regulaminu, Polityki prywatności i nowych potwierdzeń zamówień. Starsze potwierdzenia zachowają własną kopię.</p>
    <form action={action} className="settings-form operator-settings-form">
      <label>Pełna nazwa działalności<input name="name" defaultValue={operator.name} maxLength={200} required /></label>
      <label>Pełny adres, kod pocztowy i miejscowość<input name="address" defaultValue={operator.address} maxLength={300} required /></label>
      <div className="two-fields"><label>NIP<input name="taxId" defaultValue={operator.taxId} pattern="[0-9]{10}" required /></label><label>REGON<input name="regon" defaultValue={operator.regon} pattern="[0-9]{9}|[0-9]{14}" required /></label></div>
      <div className="two-fields"><label>E-mail kontaktowy<input name="email" type="email" defaultValue={operator.email} required /></label><label>Telefon<input name="phone" type="tel" defaultValue={operator.phone} required /></label></div>
      <p className="form-hint">Zmiana danych tutaj nie zmienia właściciela konta, danych podatkowych w Stripe ani konfiguracji skrzynki SMTP. Zmianę samego przedsiębiorcy trzeba również odzwierciedlić w umowach i płatnościach.</p>
      {state?.error && <p className="form-error" role="alert">{state.error}</p>}
      {state?.success && <p className="success-note" role="status">{state.success}</p>}
      <button className="button button-primary" disabled={pending}><Save size={17} />{pending ? "Zapisywanie…" : "Zapisz dane sprzedawcy"}</button>
    </form>
  </section>;
}
