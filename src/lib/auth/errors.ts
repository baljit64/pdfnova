type PublicAuthError = {
  code?: unknown;
  status?: unknown;
  message?: unknown;
};

export function authErrorMessage(error: unknown): string {
  logAuthError("Authentication", error);
  const value =
    typeof error === "object" && error !== null
      ? (error as PublicAuthError)
      : {};
  const message = typeof value.message === "string" ? value.message : "";

  if (value.code === "email_not_confirmed") return "Please verify your email before signing in.";
  if (value.code === "same_password") return "Choose a password different from your current password.";
  if (/Supabase public configuration/i.test(message)) return "Sign-in is temporarily unavailable. Please try again later.";

  if (value.status === 429 || value.code === "email_rate_limit_exceeded") {
    return "Too many attempts. Please wait a moment and try again.";
  }

  if (value.code === "user_already_exists" || value.message === "User already registered") {
    return "An account with this email already exists.";
  }

  if (value.code === "weak_password") {
    return "Choose a stronger password and try again.";
  }

  if (
    value.code === "invalid_credentials" ||
    value.message === "Invalid login credentials"
  ) {
    return "Incorrect email or password.";
  }

  if (
    value.code === "provider_disabled" ||
    /provider.*(?:not enabled|disabled|unsupported)/i.test(message)
  ) {
    return "This sign-in option is not available yet.";
  }

  if (
    value.code === "network_error" ||
    value.message === "Failed to fetch" ||
    value.message === "Network request failed"
  ) {
    return "Unable to connect. Check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}

export function logAuthError(context: string, error: unknown) {
  if (process.env.NODE_ENV !== "development") return;
  const value = error as PublicAuthError | null;
  // Never log sessions, passwords, tokens, or callback URLs.
  console.error(context, { code: value?.code, status: value?.status, message: value?.message });
}
