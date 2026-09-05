import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseConfig } from "./lib/supabase/config";
import { logAuthError } from "./lib/auth/errors";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  try {
    const { url, key } = getPublicSupabaseConfig();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          const previous = response;
          response = NextResponse.next({ request });
          previous.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
          previous.headers.forEach((value, name) => {
            if (["cache-control", "expires", "pragma"].includes(name)) response.headers.set(name, value);
          });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    });
    const { error } = await supabase.auth.getUser();
    if (error && error.name !== "AuthSessionMissingError") logAuthError("Session refresh", error);
  } catch (error) {
    // Public PDF tools stay available; protected pages verify authorization themselves.
    logAuthError("Session refresh", error);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/|images/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|xml|txt)$).*)"],
};
