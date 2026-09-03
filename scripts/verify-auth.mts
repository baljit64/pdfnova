import assert from "node:assert/strict";
import { getPublicSupabaseConfig } from "../src/lib/supabase/config";
import { authErrorMessage } from "../src/lib/auth/errors";
import { buildSignupOptions } from "../src/lib/auth/signup";
import { validateEmail, validateSignup } from "../src/lib/auth/validation";

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

console.log("\n6 authentication checks passed.");
