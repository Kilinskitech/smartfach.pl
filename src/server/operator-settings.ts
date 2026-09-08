import "server-only";
import { cache } from "react";
import { operatorSchema, smartFachOperator } from "@/domain/operator";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseAdminConfigured } from "@/lib/supabase/config";

export const getOperator = cache(async () => {
  if (!supabaseAdminConfigured()) return smartFachOperator;
  const { data, error } = await createAdminClient()
    .from("platform_settings").select("value").eq("key", "operator").maybeSingle();
  if (error) throw new Error("Nie można odczytać danych sprzedawcy.");
  return data ? operatorSchema.parse(data.value) : smartFachOperator;
});
