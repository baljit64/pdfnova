import { safeRedirectPath } from "./redirect";

interface SignupOptionsInput {
  fullName: string;
  origin: string;
  destination: string | null | undefined;
}

export function buildSignupOptions({
  fullName,
  origin,
  destination,
}: SignupOptionsInput) {
  const next = safeRedirectPath(destination);
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", next);

  return {
    data: { full_name: fullName.trim() },
    emailRedirectTo: callback.toString(),
  };
}
