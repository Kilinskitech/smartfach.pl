"use client";

import { useActionState, useState } from "react";
import { Ban, CheckCircle2, RotateCcw, ShieldAlert, Trash2 } from "lucide-react";
import {
  deletePlatformUser,
  updateSubscriptionCancellation,
} from "@/app/admin/actions";

type Props = {
  userId: string;
  email: string;
  subscriptionStatus: string;
  cancelAtPeriodEnd: boolean;
  subscriptionEndsAt: string | null;
  stripeConnected: boolean;
  deleteBlockedReason?: string;
};

const activeStatuses = new Set(["active", "trialing"]);

export function AdminUserActions({
  userId,
  email,
  subscriptionStatus,
  cancelAtPeriodEnd,
  subscriptionEndsAt,
  stripeConnected,
  deleteBlockedReason,
}: Props) {
  const [subscriptionState, subscriptionAction, subscriptionPending] =
    useActionState(updateSubscriptionCancellation, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePlatformUser,
    undefined,
  );
  const [showDelete, setShowDelete] = useState(false);
  const canManageSubscription =
    stripeConnected && activeStatuses.has(subscriptionStatus);

  return (
    <section className="admin-panel admin-account-actions">
      <div className="admin-panel-heading">
        <div>
          <ShieldAlert size={20} />
          <span>
            <small>ZARZĄDZANIE KONTEM</small>
            <h2>Subskrypcja i dane użytkownika</h2>
          </span>
        </div>
      </div>

      <div className="admin-action-grid">
        <article>
          <span className="admin-action-icon">
            {cancelAtPeriodEnd ? <RotateCcw size={20} /> : <Ban size={20} />}
          </span>
          <div>
            <h3>
              {cancelAtPeriodEnd
                ? "Anulowanie jest zaplanowane"
                : "Zarządzaj odnowieniem"}
            </h3>
            <p>
              {subscriptionEndsAt
                ? `Dostęp pozostanie aktywny do ${new Date(subscriptionEndsAt).toLocaleString("pl-PL")}.`
                : "Zmiana zostanie zsynchronizowana bezpośrednio ze Stripe."}
            </p>
          </div>
          {canManageSubscription ? (
            <form action={subscriptionAction}>
              <input name="userId" type="hidden" value={userId} />
              <button
                className={cancelAtPeriodEnd ? "button button-secondary" : "button admin-cancel-button"}
                disabled={subscriptionPending}
                name="intent"
                type="submit"
                value={cancelAtPeriodEnd ? "resume" : "schedule"}
              >
                {subscriptionPending
                  ? "Zapisywanie…"
                  : cancelAtPeriodEnd
                    ? "Przywróć odnowienie"
                    : "Anuluj po tym okresie"}
              </button>
            </form>
          ) : (
            <p className="admin-action-muted">
              Brak aktywnej subskrypcji Stripe do zmiany.
            </p>
          )}
          {subscriptionState?.success && (
            <p className="admin-action-success" role="status">
              <CheckCircle2 size={15} /> {subscriptionState.success}
            </p>
          )}
          {subscriptionState?.error && (
            <p className="form-error" role="alert">
              {subscriptionState.error}
            </p>
          )}
        </article>

        <article className="admin-danger-zone">
          <span className="admin-action-icon danger">
            <Trash2 size={20} />
          </span>
          <div>
            <h3>Usuń konto użytkownika</h3>
            <p>
              Najpierw anulujemy abonament Stripe, a następnie trwale usuniemy
              konto, workspace, rozmowy i dane firmy.
            </p>
          </div>
          {deleteBlockedReason ? (
            <p className="admin-action-muted">{deleteBlockedReason}</p>
          ) : showDelete ? (
            <form action={deleteAction} className="admin-delete-form">
              <input name="userId" type="hidden" value={userId} />
              <label>
                Aby potwierdzić, wpisz: <strong>{email}</strong>
                <input
                  autoComplete="off"
                  name="confirmation"
                  placeholder={email}
                  required
                  type="email"
                />
              </label>
              <div>
                <button
                  className="button button-secondary"
                  disabled={deletePending}
                  onClick={() => setShowDelete(false)}
                  type="button"
                >
                  Zachowaj konto
                </button>
                <button
                  className="button button-danger"
                  disabled={deletePending}
                  type="submit"
                >
                  {deletePending ? "Usuwanie…" : "Usuń konto i dane"}
                </button>
              </div>
            </form>
          ) : (
            <button
              className="button button-danger"
              onClick={() => setShowDelete(true)}
              type="button"
            >
              Usuń konto…
            </button>
          )}
          {deleteState?.error && (
            <p className="form-error" role="alert">
              {deleteState.error}
            </p>
          )}
        </article>
      </div>
    </section>
  );
}
