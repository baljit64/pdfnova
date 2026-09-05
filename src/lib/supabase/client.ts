import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getPublicSupabaseConfig } from "./config";

let browserClient: SupabaseClient | undefined;

export function createBrowserSupabaseClient() {
  const { url, key } = getPublicSupabaseConfig();
  browserClient ??= createBrowserClient(url, key);
  return browserClient;
}
