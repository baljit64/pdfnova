export interface PublicSupabaseConfig {
  url: string;
  key: string;
}

export interface PublicSupabaseEnv {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
}

export function getPublicSupabaseConfig(
  env: PublicSupabaseEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  }
): PublicSupabaseConfig {
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  try {
    const url = new URL(rawUrl ?? "");
    if (
      url.protocol !== "https:" ||
      !url.hostname.endsWith(".supabase.co") ||
      !key
    ) {
      throw new Error("Invalid Supabase public configuration");
    }

    return { url: url.origin, key };
  } catch {
    throw new Error(
      "Supabase public configuration is missing or invalid. Set the full project URL and a publishable key."
    );
  }
}
