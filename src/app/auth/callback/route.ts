import { NextResponse } from "next/server";
import { safeRedirectPath } from "../../../lib/auth/redirect";
import { logAuthError } from "../../../lib/auth/errors";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const destination = safeRedirectPath(requestUrl.searchParams.get("next"), "/");
  const code = requestUrl.searchParams.get("code");
  let target = new URL("/login?error=oauth_failed", requestUrl.origin);
  try {
    if (code && !requestUrl.searchParams.has("error")) {
      const supabase = await createServerSupabaseClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      target = new URL(destination, requestUrl.origin);
    }
  } catch (error) {
    logAuthError("Authentication callback", error);
  }
  const response = NextResponse.redirect(target);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
