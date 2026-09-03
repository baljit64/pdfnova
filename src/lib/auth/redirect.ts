export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/account"
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "https://www.pdfnova.in");
    return parsed.origin === "https://www.pdfnova.in"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
