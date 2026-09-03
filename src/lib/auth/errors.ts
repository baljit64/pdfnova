type PublicAuthError = {
  code?: unknown;
  status?: unknown;
  message?: unknown;
};

export function authErrorMessage(error: unknown): string {
  const value =
    typeof error === "object" && error !== null
      ? (error as PublicAuthError)
      : {};

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
    value.code === "network_error" ||
    value.message === "Failed to fetch" ||
    value.message === "Network request failed"
  ) {
    return "Unable to connect. Check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
