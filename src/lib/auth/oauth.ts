import type { Provider } from "@supabase/supabase-js";
import { safeRedirectPath } from "./redirect";

export interface SocialAuthProvider {
  provider: Extract<Provider, "google" | "facebook">;
  label: string;
}

export const SOCIAL_AUTH_PROVIDERS: readonly SocialAuthProvider[] = [
  { provider: "google", label: "Continue with Google" },
  { provider: "facebook", label: "Continue with Facebook" },
];

interface OAuthOptionsInput {
  origin: string;
  destination: string | null | undefined;
}

export function buildOAuthOptions({
  origin,
  destination,
}: OAuthOptionsInput): { redirectTo: string } {
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", safeRedirectPath(destination));

  return { redirectTo: callback.toString() };
}
