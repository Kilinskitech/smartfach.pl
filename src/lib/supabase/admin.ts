import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabasePublicConfig } from "./config";

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) throw new Error("Brak serwerowego klucza Supabase.");
  const { url } = supabasePublicConfig();
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

