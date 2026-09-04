"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { resendConfirmation } from "@/app/auth-actions";

export function ConfirmationResend({ sessionId }: { sessionId: string }) {
  const [state, action, pending] = useActionState(resendConfirmation, undefined);

  return (
    <form action={action} className="confirmation-resend">
      <input type="hidden" name="sessionId" value={sessionId} />
      <button className="button button-secondary" disabled={pending}>
        <Mail size={17} />
        {pending ? "Wysyłamy…" : "Wyślij wiadomość ponownie"}
      </button>
      {state?.error && (
        <p className="form-error" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="success-note" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
