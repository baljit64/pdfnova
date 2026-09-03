import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createBrowserSupabaseClient() {
  const { url, key } = getPublicSupabaseConfig();
  browserClient ??= createBrowserClient(url, key);
  return browserClient;
}
