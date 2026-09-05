import type { User } from "@supabase/supabase-js";

export function profileText(...values: unknown[]): string | null {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim() ?? null;
}

export function userDisplayName(user: User): string {
  return profileText(user.user_metadata.full_name, user.user_metadata.name, user.email) ?? "My account";
}

export function avatarUrl(...values: unknown[]): string | null {
  const value = profileText(...values);
  if (!value) return null;
  try { return new URL(value).protocol === "https:" ? value : null; }
  catch { return null; }
}
