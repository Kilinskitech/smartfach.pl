import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabasePublicConfig } from "./config";

export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!secretKey) throw new Error("Brak serwerowego klucza Supabase.");
  const { url } = supabasePublicConfig();
  return createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
