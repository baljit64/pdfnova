import assert from "node:assert/strict";
import { safeRedirectPath } from "../src/lib/auth/redirect";
import { avatarUrl, profileText } from "../src/lib/auth/profile";
import { getPublicSupabaseConfig } from "../src/lib/supabase/config";
import { authErrorMessage } from "../src/lib/auth/errors";
import {
  buildOAuthOptions,
  SOCIAL_AUTH_PROVIDERS,
} from "../src/lib/auth/oauth";
import { buildSignupOptions } from "../src/lib/auth/signup";
import {
  validateEmail,
  validateLogin,
  validateSignup,
} from "../src/lib/auth/validation";

function check(name: string, assertion: () => void) {
  assertion();
  console.log(`ok - ${name}`);
}

check("accepts a full Supabase URL and publishable key", () => {
  assert.deepEqual(
    getPublicSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    }),
    { url: "https://example.supabase.co", key: "sb_publishable_example" }
  );
});

check("supports the legacy public anon key during migration", () => {
  assert.equal(
    getPublicSupabaseConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-public-key",
    }).key,
    "legacy-public-key"
  );
});

check("rejects missing or malformed public configuration", () => {
  for (const env of [
    {},
    {
      NEXT_PUBLIC_SUPABASE_URL: "project-reference",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "key",
    },
  ]) {
    assert.throws(
      () => getPublicSupabaseConfig(env),
      /Supabase public configuration/i
    );
  }
});

check("validates signup fields", () => {
  assert.match(validateEmail("invalid") ?? "", /valid email/i);
  assert.equal(validateEmail("person@example.com"), null);
  assert.deepEqual(
    validateSignup({
      fullName: "",
      email: "bad",
      password: "short",
      confirmPassword: "other",
    }),
    {
      fullName: "Enter your full name.",
      email: "Enter a valid email address.",
      password: "Use at least 8 characters.",
      confirmPassword: "Passwords do not match.",
    }
  );
});

check("validates email and password login fields", () => {
  assert.deepEqual(validateLogin({ email: "bad", password: "" }), {
    email: "Enter a valid email address.",
    password: "Enter your password.",
  });
  assert.deepEqual(
    validateLogin({ email: "person@example.com", password: "secret" }),
    {}
  );
});

check("translates authentication errors without leaking internals", () => {
  assert.equal(
    authErrorMessage({ code: "user_already_exists" }),
    "An account with this email already exists."
  );
  assert.equal(
    authErrorMessage({ status: 429 }),
    "Too many attempts. Please wait a moment and try again."
  );
  assert.equal(
    authErrorMessage(new Error("database internals")),
    "Something went wrong. Please try again."
  );
  assert.equal(
    authErrorMessage({ code: "invalid_credentials" }),
    "Incorrect email or password."
  );
  assert.equal(
    authErrorMessage({ message: "Unsupported provider: provider is not enabled" }),
    "This sign-in option is not available yet."
  );
});

check("keeps only the free social providers in the approved order", () => {
  assert.deepEqual(
    SOCIAL_AUTH_PROVIDERS.map(({ provider, label }) => [provider, label]),
    [
      ["google", "Continue with Google"],
      ["facebook", "Continue with Facebook"],
    ]
  );
});

check("builds a PKCE OAuth callback with a safe destination", () => {
  assert.deepEqual(
    buildOAuthOptions({
      origin: "https://www.pdfnova.in",
      destination: "/account?tab=profile",
    }),
    {
      redirectTo:
        "https://www.pdfnova.in/auth/callback?next=%2Faccount%3Ftab%3Dprofile",
    }
  );
  assert.equal(
    buildOAuthOptions({
      origin: "https://www.pdfnova.in",
      destination: "https://evil.example",
    }).redirectTo,
    "https://www.pdfnova.in/auth/callback?next=%2Faccount"
  );
});

check("builds signup metadata and an internal confirmation destination", () => {
  assert.deepEqual(
    buildSignupOptions({
      fullName: "  Baljit Singh  ",
      origin: "https://www.pdfnova.in",
      destination: "/account?tab=files",
    }),
    {
      data: { full_name: "Baljit Singh" },
      emailRedirectTo:
        "https://www.pdfnova.in/auth/callback?next=%2Faccount%3Ftab%3Dfiles",
    }
  );
  assert.equal(
    buildSignupOptions({
      fullName: "Baljit Singh",
      origin: "https://www.pdfnova.in",
      destination: "https://evil.example",
    }).emailRedirectTo,
    "https://www.pdfnova.in/auth/callback?next=%2Faccount"
  );
});

check("rejects external and control-character redirect destinations", () => {
  for (const destination of ["https://evil.example", "//evil.example", "/\\evil.example", "/\t/evil.example", "/\n/evil.example", "/safe/..//evil.example", "/%2e//evil.example", "javascript:alert(1)"]) {
    assert.equal(safeRedirectPath(destination), "/account");
  }
  assert.equal(safeRedirectPath("/account?tab=profile#name"), "/account?tab=profile#name");
});

check("handles absent and malformed optional profile metadata", () => {
  assert.equal(profileText({}, [], null, "", " Person "), "Person");
  assert.equal(profileText(undefined), null);
  assert.equal(avatarUrl("javascript:alert(1)"), null);
  assert.equal(avatarUrl("https://example.com/photo.png"), "https://example.com/photo.png");
});

check("explains unconfirmed email and password errors", () => {
  assert.match(authErrorMessage({ code: "email_not_confirmed" }), /verify your email/);
  assert.match(authErrorMessage({ code: "same_password" }), /different/);
  assert.match(authErrorMessage({ message: "Failed to fetch" }), /connection/);
});

console.log("\n12 authentication checks passed.");
