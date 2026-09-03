import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseConfig } from "./config";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url, key } = getPublicSupabaseConfig();

  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          for (const { name, value, options } of values) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Route handlers can write cookies. Server Components rely on middleware refresh.
        }
      },
    },
  });
}
