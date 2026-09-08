"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/server/auth";
import { syncSubscription } from "@/server/stripe-subscriptions";
import { operatorSchema } from "@/domain/operator";
import { getOperator } from "@/server/operator-settings";
import { sendSmtpTest, smtpConfigured } from "@/server/transactional-email";

export async function saveOperatorSettings(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const parsed = operatorSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Sprawdź nazwę, pełny adres, NIP, REGON, telefon i e-mail." };
  try {
    const owner = await requirePlatformAdmin();
    const { error } = await createAdminClient().rpc("save_operator_settings", {
      settings_value: parsed.data, actor_id: owner.userId,
    });
    if (error) throw new Error("Nie zapisano ustawień.");
    for (const path of ["/admin", "/kontakt", "/regulamin", "/polityka-prywatnosci"])
      revalidatePath(path);
    return { success: "Zapisano. Publiczne dokumenty i nowe zamówienia korzystają z nowych danych." };
  } catch {
    return { error: "Nie zapisano danych. Sprawdź uprawnienia lub spróbuj ponownie." };
  }
}

export type AdminActionState =
  | { error?: string; success?: string }
  | undefined;

export async function testSmtpConnection(
  previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  void previousState;
  void formData;
  try {
    const platformAdmin = await requirePlatformAdmin();
    if (!smtpConfigured())
      return { error: "Brakuje pełnej konfiguracji SMTP w tym środowisku." };
    const operator = await getOperator();
    const recipient = platformAdmin.email ?? operator.email;
    await sendSmtpTest({ recipient, replyTo: operator.email });
    return {
      success: `Serwer SMTP przyjął wiadomość wysłaną na ${recipient}. Sprawdź skrzynkę i Spam.`,
    };
  } catch (error) {
    console.error("Nie wysłano testu SMTP z panelu administratora", {
      message: errorMessage(error),
    });
    return {
      error:
        "Test SMTP nie powiódł się. Sprawdź host, port, login i hasło w zmiennych tego wdrożenia.",
    };
  }
}

export async function resolveWithdrawal(_: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const parsed = z.object({ id: z.uuid(), confirmed: z.literal("yes") }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Potwierdź wcześniejsze rozliczenie zgłoszenia i odpowiedź klientowi." };
  try {
    const owner = await requirePlatformAdmin();
    const { error } = await createAdminClient().rpc("resolve_withdrawal", { request_id: parsed.data.id, actor_id: owner.userId });
    if (error) throw new Error("Nie zapisano rozliczenia.");
    revalidatePath("/admin");
    return { success: "Oznaczono jako obsłużone. Ta operacja nie wykonuje zwrotu w Stripe." };
  } catch {
    return { error: "Nie zapisano statusu. Sprawdź uprawnienia i spróbuj ponownie." };
  }
}

const subscriptionActionSchema = z.object({
  userId: z.uuid(),
  intent: z.enum(["schedule", "resume"]),
});

const deleteUserSchema = z.object({
  userId: z.uuid(),
  confirmation: z.string().trim().email(),
});

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Nie udało się wykonać operacji.";
}

export async function updateSubscriptionCancellation(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = subscriptionActionSchema.safeParse({
    userId: formData.get("userId"),
    intent: formData.get("intent"),
  });
  if (!parsed.success) return { error: "Nieprawidłowe dane operacji." };

  try {
    const platformAdmin = await requirePlatformAdmin();
    if (parsed.data.userId === platformAdmin.userId)
      return { error: "Konto administratora nie podlega subskrypcji." };

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id, status, cancel_at_period_end")
      .eq("owner_user_id", parsed.data.userId)
      .maybeSingle();
    if (error || !data?.stripe_subscription_id)
      return { error: "Użytkownik nie ma aktywnej subskrypcji Stripe." };
    if (!["active", "trialing"].includes(String(data.status)))
      return { error: "Tego abonamentu nie można teraz zmienić." };

    const shouldCancel = parsed.data.intent === "schedule";
    if (Boolean(data.cancel_at_period_end) === shouldCancel)
      return {
        success: shouldCancel
          ? "Anulowanie jest już zaplanowane."
          : "Automatyczne odnowienie jest już aktywne.",
      };

    const stripe = getStripe();
    const updated = await stripe.subscriptions.update(
      String(data.stripe_subscription_id),
      { cancel_at_period_end: shouldCancel },
    );
    await syncSubscription(updated);
    const { error: auditError } = await admin
      .from("admin_audit_events")
      .insert({
        admin_user_id: platformAdmin.userId,
        target_user_id: parsed.data.userId,
        action: shouldCancel
          ? "schedule_subscription_cancellation"
          : "resume_subscription",
        metadata: { stripe_subscription_id: updated.id },
      });
    if (auditError)
      console.error("Nie zapisano audytu zmiany subskrypcji", auditError);

    revalidatePath("/admin");
    revalidatePath(`/admin/uzytkownicy/${parsed.data.userId}`);
    return {
      success: shouldCancel
        ? "Abonament zakończy się z końcem bieżącego okresu."
        : "Automatyczne odnowienie zostało przywrócone.",
    };
  } catch (error) {
    console.error("Nie zmieniono subskrypcji z panelu administratora", {
      userId: parsed.data.userId,
      message: errorMessage(error),
    });
    return { error: "Nie udało się zmienić subskrypcji. Spróbuj ponownie." };
  }
}

export async function deletePlatformUser(
  _: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const parsed = deleteUserSchema.safeParse({
    userId: formData.get("userId"),
    confirmation: formData.get("confirmation"),
  });
  if (!parsed.success)
    return { error: "Wpisz pełny adres e-mail użytkownika." };

  try {
    const platformAdmin = await requirePlatformAdmin();
    if (parsed.data.userId === platformAdmin.userId)
      return { error: "Nie można usunąć własnego konta administratora." };

    const admin = createAdminClient();
    const { data: authData, error: authError } =
      await admin.auth.admin.getUserById(parsed.data.userId);
    if (authError || !authData.user)
      return { error: "Nie znaleziono użytkownika." };
    const targetEmail = authData.user.email?.trim().toLowerCase() ?? "";
    if (!targetEmail || parsed.data.confirmation.toLowerCase() !== targetEmail)
      return { error: "Adres e-mail nie zgadza się z usuwanym kontem." };

    const { data: organizations, error: organizationsError } = await admin
      .from("organizations")
      .select("id")
      .eq("owner_user_id", parsed.data.userId);
    if (organizationsError)
      throw new Error("Nie można sprawdzić organizacji użytkownika.");
    const organizationIds = (organizations ?? []).map((row) => String(row.id));

    if (organizationIds.length) {
      const { data: memberships, error: membershipsError } = await admin
        .from("memberships")
        .select("organization_id, user_id")
        .in("organization_id", organizationIds)
        .eq("status", "active");
      if (membershipsError)
        throw new Error("Nie można sprawdzić zespołu użytkownika.");
      if (
        (memberships ?? []).some(
          (membership) => String(membership.user_id) !== parsed.data.userId,
        )
      )
        return {
          error:
            "Konto jest właścicielem zespołu. Najpierw usuń członków albo przenieś własność organizacji.",
        };
    }

    const { data: subscriptions, error: subscriptionsError } = organizationIds.length
      ? await admin
          .from("subscriptions")
          .select("stripe_subscription_id")
          .in("organization_id", organizationIds)
      : { data: [], error: null };
    if (subscriptionsError)
      throw new Error("Nie można sprawdzić subskrypcji użytkownika.");

    const subscriptionIds = (subscriptions ?? [])
      .map((row) =>
        row.stripe_subscription_id ? String(row.stripe_subscription_id) : "",
      )
      .filter(Boolean);
    const canceledSubscriptionIds: string[] = [];
    if (subscriptionIds.length) {
      const stripe = getStripe();
      for (const subscriptionId of subscriptionIds) {
        const current = await stripe.subscriptions.retrieve(subscriptionId);
        if (current.status === "canceled") continue;
        await stripe.subscriptions.update(subscriptionId, {
          metadata: { smartfach_account_deleted: "true" },
        });
        const canceled = await stripe.subscriptions.cancel(subscriptionId);
        await syncSubscription(canceled);
        canceledSubscriptionIds.push(subscriptionId);
      }
    }

    const { error: auditError } = await admin
      .from("admin_audit_events")
      .insert({
        admin_user_id: platformAdmin.userId,
        target_user_id: parsed.data.userId,
        action: "delete_user_account",
        metadata: {
          target_user_id: parsed.data.userId,
          target_email: targetEmail,
          organization_ids: organizationIds,
          canceled_subscription_ids: canceledSubscriptionIds,
        },
      });
    if (auditError) throw new Error("Nie zapisano audytu usunięcia konta.");

    const { error: deleteError } = await admin.auth.admin.deleteUser(
      parsed.data.userId,
    );
    if (deleteError)
      throw new Error(
        canceledSubscriptionIds.length
          ? "Subskrypcję anulowano, ale konto nie zostało usunięte. Spróbuj ponownie."
          : "Nie udało się usunąć konta.",
      );
  } catch (error) {
    console.error("Nie usunięto użytkownika z panelu administratora", {
      userId: parsed.data.userId,
      message: errorMessage(error),
    });
    return { error: errorMessage(error) };
  }

  revalidatePath("/admin");
  redirect("/admin?usunieto=1");
}
