import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicConfig } from "./config";

export function createClient() {
  const { url, key } = supabasePublicConfig();
  return createBrowserClient(url, key);
}

