# PDFNova Supabase Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional, secure Supabase email/password plus Google and Facebook authentication, password recovery, and owner-only profiles without changing anonymous PDF tools or existing SEO.

**Architecture:** Use `@supabase/ssr` browser and request-scoped server clients with Next.js 15 middleware for cookie refresh and account-route protection. Keep public pages static by isolating client auth state in the Navbar, store profile data behind Supabase RLS, and route all post-auth navigation through one safe-relative-redirect validator.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.9, `@supabase/supabase-js` 2.114+, `@supabase/ssr` 0.12+, Tailwind CSS 4, Ant Design 6, Playwright, Supabase PostgreSQL/RLS

**Spec:** `docs/superpowers/specs/2026-09-03-supabase-authentication-design.md`

## Global Constraints

- Every existing PDF tool remains usable without authentication.
- Do not redesign PDFNova or change public tool URLs, copy, metadata, canonicals, JSON-LD, sitemap membership, or server-rendered SEO content.
- Email confirmation is enabled; signup must show a truthful “Check your email” state.
- Accept post-auth redirects only when they are relative same-origin paths.
- Never expose, log, commit, or import server keys into client code.
- Auth entry pages use `noindex, follow`; protected account pages use `noindex, nofollow`; none belongs in the sitemap.
- OAuth is limited to the free Google and Facebook providers, in that visual order above email/password.
- File history, Storage, quotas, retention, and cron cleanup are outside this plan.
- All commits remain local. Do not push, deploy, or apply migrations to the hosted Supabase project.
- The exposed Supabase service-role key, CloudConvert key, and cron secret must not be used.

---

## File map

**Supabase boundary**

- Create `src/lib/supabase/config.ts`: validate and return public Supabase configuration.
- Create `src/lib/supabase/client.ts`: browser client factory/cache.
- Create `src/lib/supabase/server.ts`: request-scoped cookie-aware server client.
- Create `src/lib/supabase/middleware.ts`: refresh cookies and protect account paths.
- Delete `src/lib/supabase.ts`: remove the unsafe legacy singleton.
- Create root `middleware.ts`: delegate to the Supabase middleware utility.

**Authentication domain**

- Create `src/lib/auth/redirect.ts`: validate safe internal destinations.
- Create `src/lib/auth/oauth.ts`: define the provider allow list and safe callback options.
- Create `src/lib/auth/validation.ts`: deterministic form validation.
- Create `src/lib/auth/errors.ts`: translate Supabase errors into user-safe messages.

**Authentication UI and routes**

- Create `src/components/auth/AuthShell.tsx`: shared PDFNova auth-page frame.
- Create `src/components/auth/PasswordField.tsx`: accessible show/hide password input.
- Create `src/components/auth/LoginForm.tsx`, `SignupForm.tsx`, `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`: client forms.
- Create `src/components/auth/SocialAuthButtons.tsx`: shared Google and Facebook OAuth controls.
- Create `src/components/auth/AuthNav.tsx`: isolated Navbar auth state and signout.
- Create `src/components/auth/ProfileForm.tsx`: owner profile editing.
- Modify `src/views/Login.tsx`: render the real login form.
- Create `src/views/Signup.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`: page-level auth views.
- Create `src/app/signup/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`: auth pages.
- Create `src/app/auth/callback/route.ts`: PKCE code exchange.
- Create `src/app/account/page.tsx`, `src/app/account/profile/page.tsx`: protected account pages.
- Modify `src/components/Navbar.tsx`: replace fixed login links with `AuthNav`.

**Database, SEO, tests, and docs**

- Create `supabase/migrations/20260903000000_create_profiles.sql`: profiles, trigger, grants, and RLS.
- Create `scripts/verify-auth.mts`: auth-domain and migration verification.
- Modify `scripts/verify-p0-seo.mts`, `scripts/verify-seo-live.mts`, `tests/e2e/smoke.spec.ts`: regression coverage.
- Modify `src/seo/config.ts`, `src/seo/nextMetadata.ts`: auth/private metadata policy.
- Modify `.env.example`, `package.json`, `package-lock.json`, and `README.md`: dependencies and setup.

---

### Task 1: Supabase configuration and dependency boundary

**Files:**

- Create: `src/lib/supabase/config.ts`
- Create: `scripts/verify-auth.mts`
- Modify: `.env.example`
- Modify: `package.json`
- Modify: `package-lock.json`
- Delete: `src/lib/supabase.ts`

**Interfaces:**

- Produces: `getPublicSupabaseConfig(env?: NodeJS.ProcessEnv): { url: string; key: string }`
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, preferred `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, fallback `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- [ ] **Step 1: Install compatible SSR dependencies**

Run:

```bash
npm install @supabase/ssr@^0.12.5 @supabase/supabase-js@^2.114.0
```

Expected: `package.json` contains both packages and npm updates `package-lock.json`.

- [ ] **Step 2: Write failing configuration tests**

Create the first `scripts/verify-auth.mts` checks:

```ts
import assert from "node:assert/strict";
import { getPublicSupabaseConfig } from "../src/lib/supabase/config";

assert.deepEqual(
  getPublicSupabaseConfig({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
  } as NodeJS.ProcessEnv),
  { url: "https://example.supabase.co", key: "sb_publishable_example" }
);

assert.equal(
  getPublicSupabaseConfig({
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "legacy-public-key",
  } as NodeJS.ProcessEnv).key,
  "legacy-public-key"
);

for (const env of [
  {},
  { NEXT_PUBLIC_SUPABASE_URL: "project-reference", NEXT_PUBLIC_SUPABASE_ANON_KEY: "key" },
]) {
  assert.throws(() => getPublicSupabaseConfig(env as NodeJS.ProcessEnv), /Supabase public configuration/i);
}
```

- [ ] **Step 3: Run the test and confirm the missing-module failure**

Run: `npx tsx scripts/verify-auth.mts`

Expected: FAIL because `src/lib/supabase/config.ts` does not exist.

- [ ] **Step 4: Implement strict public configuration validation**

Create `src/lib/supabase/config.ts`:

```ts
export interface PublicSupabaseConfig {
  url: string;
  key: string;
}

export function getPublicSupabaseConfig(
  env: NodeJS.ProcessEnv = process.env
): PublicSupabaseConfig {
  const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  try {
    const url = new URL(rawUrl ?? "");
    if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co") || !key) {
      throw new Error();
    }
    return { url: url.origin, key };
  } catch {
    throw new Error(
      "Supabase public configuration is missing or invalid. Set the full project URL and a publishable key."
    );
  }
}
```

Delete `src/lib/supabase.ts` after confirming no imports remain with:

```bash
rg 'lib/supabase["\x27]' src scripts tests
```

- [ ] **Step 5: Update the safe example environment**

Replace the Supabase section in `.env.example` with empty values:

```dotenv
# Public Supabase project values. Prefer the current publishable key.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# Temporary fallback while migrating from Supabase legacy keys.
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only administrative key; never add NEXT_PUBLIC_ or commit a real value.
SUPABASE_SECRET_KEY=
```

- [ ] **Step 6: Run the focused test**

Run: `npx tsx scripts/verify-auth.mts`

Expected: PASS with no secret values in output.

- [ ] **Step 7: Commit locally**

```bash
git add package.json package-lock.json .env.example scripts/verify-auth.mts src/lib/supabase/config.ts src/lib/supabase.ts
git commit -m "chore: add Supabase SSR configuration"
```

---

### Task 2: Browser/server clients and safe redirect rules

**Files:**

- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/auth/redirect.ts`
- Modify: `scripts/verify-auth.mts`

**Interfaces:**

- Consumes: `getPublicSupabaseConfig()` from Task 1
- Produces: `createBrowserSupabaseClient(): SupabaseClient`
- Produces: `createServerSupabaseClient(): Promise<SupabaseClient>`
- Produces: `safeRedirectPath(value: string | null | undefined, fallback?: string): string`

- [ ] **Step 1: Add failing redirect tests**

Append to `scripts/verify-auth.mts`:

```ts
import { safeRedirectPath } from "../src/lib/auth/redirect";

assert.equal(safeRedirectPath("/account?tab=profile"), "/account?tab=profile");
assert.equal(safeRedirectPath("/"), "/");
for (const unsafe of [null, "", "account", "//evil.example", "https://evil.example", "/\\evil.example"]) {
  assert.equal(safeRedirectPath(unsafe), "/account", String(unsafe));
}
```

- [ ] **Step 2: Run the test and confirm the missing-module failure**

Run: `npx tsx scripts/verify-auth.mts`

Expected: FAIL because `src/lib/auth/redirect.ts` does not exist.

- [ ] **Step 3: Implement the redirect validator**

Create `src/lib/auth/redirect.ts`:

```ts
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/account"
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
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
```

- [ ] **Step 4: Implement browser and request-scoped server clients**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import { getPublicSupabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createBrowserSupabaseClient() {
  const { url, key } = getPublicSupabaseConfig();
  browserClient ??= createBrowserClient(url, key);
  return browserClient;
}
```

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicSupabaseConfig } from "./config";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { url, key } = getPublicSupabaseConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          for (const { name, value, options } of values) cookieStore.set(name, value, options);
        } catch {
          // Server Components cannot write cookies; middleware performs refresh writes.
        }
      },
    },
  });
}
```

- [ ] **Step 5: Run focused and type checks**

Run:

```bash
npx tsx scripts/verify-auth.mts
npx tsc --noEmit
```

Expected: both exit 0.

- [ ] **Step 6: Commit locally**

```bash
git add scripts/verify-auth.mts src/lib/auth/redirect.ts src/lib/supabase/client.ts src/lib/supabase/server.ts
git commit -m "feat: add Supabase SSR clients"
```

---

### Task 3: Session refresh and protected-route middleware

**Files:**

- Create: `src/lib/supabase/middleware.ts`
- Create: `middleware.ts`
- Modify: `scripts/verify-auth.mts`

**Interfaces:**

- Produces: `isProtectedPath(pathname: string): boolean`
- Produces: `updateSupabaseSession(request: NextRequest): Promise<NextResponse>`
- Consumes: `safeRedirectPath()` semantics for internal destinations

- [ ] **Step 1: Write failing path-classification tests**

Append:

```ts
import { isProtectedPath } from "../src/lib/supabase/middleware";

for (const path of ["/account", "/account/profile", "/account/history"]) {
  assert.equal(isProtectedPath(path), true, path);
}
for (const path of ["/", "/merge-pdf", "/blog", "/login", "/accounting"]) {
  assert.equal(isProtectedPath(path), false, path);
}
```

- [ ] **Step 2: Run and confirm the missing-module failure**

Run: `npx tsx scripts/verify-auth.mts`

Expected: FAIL for the missing middleware utility.

- [ ] **Step 3: Implement cookie refresh and account protection**

Create `src/lib/supabase/middleware.ts` with this control flow:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getPublicSupabaseConfig } from "./config";

export function isProtectedPath(pathname: string): boolean {
  return pathname === "/account" || pathname.startsWith("/account/") || pathname === "/settings";
}

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = getPublicSupabaseConfig();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (values) => {
        for (const { name, value } of values) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of values) response.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && isProtectedPath(request.nextUrl.pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    login.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    const redirect = NextResponse.redirect(login);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }
  return response;
}
```

- [ ] **Step 4: Add the Next.js 15 root middleware entrypoint**

Create `middleware.ts`:

```ts
import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "./src/lib/supabase/middleware";

export function middleware(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
```

- [ ] **Step 5: Verify tests and compilation**

Run:

```bash
npx tsx scripts/verify-auth.mts
npx tsc --noEmit
```

Expected: both exit 0 and public route classification remains false.

- [ ] **Step 6: Commit locally**

```bash
git add middleware.ts scripts/verify-auth.mts src/lib/supabase/middleware.ts
git commit -m "feat: refresh and protect Supabase sessions"
```

---

### Task 4: Validation, error translation, and accessible auth primitives

**Files:**

- Create: `src/lib/auth/validation.ts`
- Create: `src/lib/auth/errors.ts`
- Create: `src/components/auth/AuthShell.tsx`
- Create: `src/components/auth/PasswordField.tsx`
- Modify: `scripts/verify-auth.mts`

**Interfaces:**

- Produces: `validateEmail(value: string): string | null`
- Produces: `validatePassword(value: string, minimum?: number): string | null`
- Produces: `validateSignup(values: SignupValues): FieldErrors<SignupValues>`
- Produces: `authErrorMessage(error: unknown): string`
- Produces: shared `AuthShell` and controlled `PasswordField`

- [ ] **Step 1: Write failing validation and error-copy tests**

Append:

```ts
import { validateEmail, validateSignup } from "../src/lib/auth/validation";
import { authErrorMessage } from "../src/lib/auth/errors";

assert.match(validateEmail("invalid") ?? "", /valid email/i);
assert.equal(validateEmail("person@example.com"), null);
assert.deepEqual(
  validateSignup({ fullName: "", email: "bad", password: "short", confirmPassword: "other" }),
  {
    fullName: "Enter your full name.",
    email: "Enter a valid email address.",
    password: "Use at least 8 characters.",
    confirmPassword: "Passwords do not match.",
  }
);
assert.equal(authErrorMessage({ code: "invalid_credentials" }), "Incorrect email or password.");
assert.equal(authErrorMessage({ status: 429 }), "Too many attempts. Please wait a moment and try again.");
assert.equal(authErrorMessage(new Error("database internals")), "Something went wrong. Please try again.");
```

- [ ] **Step 2: Run and confirm missing-module failures**

Run: `npx tsx scripts/verify-auth.mts`

Expected: FAIL for the new auth-domain modules.

- [ ] **Step 3: Implement deterministic validation**

Create `src/lib/auth/validation.ts` with `SignupValues`, a typed partial error record, a conservative email expression, trimmed-name validation, eight-character password validation, and equality validation. Return exactly the strings asserted above.

- [ ] **Step 4: Implement safe error translation**

Create `src/lib/auth/errors.ts` and inspect only `code`, `status`, and known public messages. Map `invalid_credentials`, `user_already_exists`, `weak_password`, `email_rate_limit_exceeded`, status 429, and network failures to the approved copy; return the generic fallback for everything else.

- [ ] **Step 5: Build shared auth UI primitives**

`AuthShell` must render the existing PDFNova page background, centered `Container`, heading, description, and card styles. `PasswordField` must render an `<input type={visible ? "text" : "password"}>` plus a `type="button"` control whose accessible label alternates between “Show password” and “Hide password”. Use existing CSS variables and focus styles rather than new brand tokens.

- [ ] **Step 6: Verify domain tests and type safety**

Run:

```bash
npx tsx scripts/verify-auth.mts
npx tsc --noEmit
```

Expected: both exit 0.

- [ ] **Step 7: Commit locally**

```bash
git add scripts/verify-auth.mts src/lib/auth src/components/auth/AuthShell.tsx src/components/auth/PasswordField.tsx
git commit -m "feat: add authentication form foundations"
```

---

### Task 5: Login, signup, and social OAuth flows

**Files:**

- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/SignupForm.tsx`
- Create: `src/components/auth/SocialAuthButtons.tsx`
- Create: `src/lib/auth/oauth.ts`
- Create: `src/views/Signup.tsx`
- Create: `src/app/signup/page.tsx`
- Modify: `src/views/Login.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**

- Consumes: browser Supabase client, validation/error helpers, `safeRedirectPath`, `AuthShell`, `PasswordField`
- Produces: functional `/login` and `/signup` pages

- [ ] **Step 1: Add failing browser tests for auth form behavior**

Append Playwright tests that:

```ts
test("login and signup expose accessible validation", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByLabel("Email")).toHaveAttribute("autocomplete", "email");
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("autocomplete", "current-password");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();

  await page.goto("/signup");
  await expect(page.getByLabel("Full name")).toHaveAttribute("autocomplete", "name");
  await page.getByLabel("Password", { exact: true }).fill("12345678");
  await page.getByLabel("Confirm password").fill("87654321");
  await page.getByRole("button", { name: "Create Account" }).click();
  await expect(page.getByText("Passwords do not match.")).toBeVisible();
});
```

- [ ] **Step 2: Build and run only the new E2E test to confirm failure**

Run:

```bash
npm run build
npx playwright test tests/e2e/smoke.spec.ts --grep "login and signup expose"
```

Expected: FAIL because `/signup` and the real form behavior do not exist.

- [ ] **Step 3: Implement `LoginForm`**

Use controlled email/password state, field-level errors, one submit guard, and `createBrowserSupabaseClient().auth.signInWithPassword({ email, password })`. On success run:

```ts
  router.push(safeRedirectPath(searchParams.get("redirect"), "/"));
router.refresh();
```

The submit label changes from `Sign In` to `Signing in...`; include links to `/forgot-password` and `/signup` while preserving a safe `redirect` query value.

- [ ] **Step 4: Implement `SignupForm`**

Call:

```ts
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { full_name: fullName.trim() },
    emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`,
  },
});
```

On success replace the form with heading “Check your email” and copy “We've sent a confirmation link to your email address.” Do not navigate to `/account` until confirmation establishes a session.

- [ ] **Step 5: Wire page views and routes**

Replace the placeholder `src/views/Login.tsx` contents with `AuthShell` plus `LoginForm`. Add the equivalent signup view and route. Preserve `buildMetadata("/login")`; use `buildMetadata("/signup")` for signup.

- [ ] **Step 6: Verify focused UI and type checks**

Run:

```bash
npx tsc --noEmit
npm run build
npx playwright test tests/e2e/smoke.spec.ts --grep "login and signup expose"
```

Expected: all exit 0 on both configured viewport projects.

- [ ] **Step 7: Commit locally**

```bash
git add src/components/auth/LoginForm.tsx src/components/auth/SignupForm.tsx src/views/Login.tsx src/views/Signup.tsx src/app/login/page.tsx src/app/signup/page.tsx tests/e2e/smoke.spec.ts
git commit -m "feat: add Supabase login and signup"
```

---

### Task 6: Confirmation callback, password recovery, and reset

**Files:**

- Create: `src/app/auth/callback/route.ts`
- Create: `src/components/auth/ForgotPasswordForm.tsx`
- Create: `src/components/auth/ResetPasswordForm.tsx`
- Create: `src/views/ForgotPassword.tsx`
- Create: `src/views/ResetPassword.tsx`
- Create: `src/app/forgot-password/page.tsx`
- Create: `src/app/reset-password/page.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**

- Consumes: server/browser clients, safe redirect, validation/error helpers, shared auth UI
- Produces: `/auth/callback`, `/forgot-password`, and `/reset-password`

- [ ] **Step 1: Add failing callback and recovery-page tests**

Add E2E coverage asserting `/auth/callback?next=https://evil.example` never redirects off origin, `/forgot-password` has a labelled email input and generic completion message, and `/reset-password` exposes two `new-password` inputs with mismatch validation.

- [ ] **Step 2: Run focused tests and confirm failure**

Run:

```bash
npm run build
npx playwright test tests/e2e/smoke.spec.ts --grep "callback|password recovery"
```

Expected: FAIL because the routes do not exist.

- [ ] **Step 3: Implement server callback**

In `GET(request)` read `code` and `next`, normalize `next` with `safeRedirectPath`, exchange a present code using `createServerSupabaseClient().auth.exchangeCodeForSession(code)`, and redirect to the safe destination on success. Redirect failures to `/login?error=confirmation_failed`; never include a raw Supabase message.

- [ ] **Step 4: Implement forgot-password flow**

Call:

```ts
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
});
```

After any non-rate-limited response display: “If an account exists for this email, you'll receive a reset link.”

- [ ] **Step 5: Implement reset-password flow**

Validate both fields, call `supabase.auth.updateUser({ password })`, then show “Your password has been updated.” with links to `/account` and `/`. If no recovery session exists, show a link to request a new reset email.

- [ ] **Step 6: Add views, routes, and metadata calls**

Each route renders the shared PDFNova auth shell and exports `buildMetadata()` for its exact path.

- [ ] **Step 7: Verify focused tests and compile**

Run:

```bash
npx tsc --noEmit
npm run build
npx playwright test tests/e2e/smoke.spec.ts --grep "callback|password recovery"
```

Expected: all exit 0.

- [ ] **Step 8: Commit locally**

```bash
git add src/app/auth src/app/forgot-password src/app/reset-password src/components/auth/ForgotPasswordForm.tsx src/components/auth/ResetPasswordForm.tsx src/views/ForgotPassword.tsx src/views/ResetPassword.tsx tests/e2e/smoke.spec.ts
git commit -m "feat: add Supabase recovery flows"
```

---

### Task 7: Profiles migration and protected account pages

**Files:**

- Create: `supabase/migrations/20260903000000_create_profiles.sql`
- Create: `src/components/auth/ProfileForm.tsx`
- Create: `src/app/account/page.tsx`
- Create: `src/app/account/profile/page.tsx`
- Modify: `scripts/verify-auth.mts`

**Interfaces:**

- Produces: `public.profiles` owner-only table and automatic `auth.users` trigger
- Produces: protected account summary and profile editing pages
- Consumes: server/browser Supabase clients and middleware identity validation

- [ ] **Step 1: Write failing migration-policy checks**

Read the migration in `scripts/verify-auth.mts` and assert it contains:

```ts
const migration = await readFile(
  new URL("../supabase/migrations/20260903000000_create_profiles.sql", import.meta.url),
  "utf8"
);
assert.match(migration, /enable row level security/i);
assert.match(migration, /auth\.uid\(\)\s*=\s*id/i);
assert.match(migration, /security definer/i);
assert.match(migration, /set search_path\s*=\s*''/i);
assert.match(migration, /references auth\.users\s*\(id\)\s*on delete cascade/i);
assert.doesNotMatch(migration, /service_role/);
```

- [ ] **Step 2: Run and confirm missing-file failure**

Run: `npx tsx scripts/verify-auth.mts`

Expected: FAIL because the migration does not exist.

- [ ] **Step 3: Create the profiles migration**

The SQL must create `profiles`, enable RLS, revoke anonymous access, grant authenticated select/update, add separate owner-select and owner-update policies using `(select auth.uid()) = id`, define `public.handle_new_user()` as `security definer set search_path = ''`, install an `after insert on auth.users` trigger, and backfill existing users with `on conflict (id) do nothing`. Add an updated-at trigger that changes only the matching profile row.

- [ ] **Step 4: Implement protected account page**

Create a server page that obtains a verified user with `auth.getUser()`, redirects to `/login?redirect=/account` if absent, selects that user's profile, and renders first name, email, Profile link, and honest “Saved file history is not enabled yet” copy.

- [ ] **Step 5: Implement profile editing**

The server page loads the verified user/profile and passes the user ID and current full name to `ProfileForm`. The client validates a trimmed name of 1–100 characters and updates:

```ts
await supabase.from("profiles").update({ full_name: fullName.trim() }).eq("id", userId);
```

RLS remains the ownership authority. Render `Saving...`, “Saved successfully”, and safe inline errors.

- [ ] **Step 6: Verify migration, types, and build**

Run:

```bash
npx tsx scripts/verify-auth.mts
npx tsc --noEmit
npm run build
```

Expected: all exit 0; the hosted project remains unchanged.

- [ ] **Step 7: Commit locally**

```bash
git add supabase/migrations/20260903000000_create_profiles.sql scripts/verify-auth.mts src/app/account src/components/auth/ProfileForm.tsx
git commit -m "feat: add protected PDFNova profiles"
```

---

### Task 8: Navbar auth state and logout

**Files:**

- Create: `src/components/auth/AuthNav.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**

- Produces: `<AuthNav mobile?: boolean onNavigate?: () => void />`
- Consumes: browser client and Next.js router

- [ ] **Step 1: Add failing anonymous Navbar tests**

Assert desktop and mobile navigation expose a link named “Sign In” pointing to `/login`, while the homepage still exposes all existing tool links and has no horizontal overflow.

- [ ] **Step 2: Run focused tests and confirm expected failure**

Run:

```bash
npm run build
npx playwright test tests/e2e/smoke.spec.ts --grep "Navbar authentication"
```

Expected: FAIL because the existing label is “Log in” and no auth-aware component exists.

- [ ] **Step 3: Implement isolated auth state**

On mount call `supabase.auth.getUser()` once, subscribe to `onAuthStateChange`, and unsubscribe during cleanup. Anonymous output is the subtle Sign In link. Authenticated desktop output is an Account menu containing `/account`, `/account/profile`, and Sign Out; mobile output uses the same actions in the existing navigation layout.

Sign Out must guard duplicate clicks and execute:

```ts
await supabase.auth.signOut();
router.push("/");
router.refresh();
```

- [ ] **Step 4: Integrate without restructuring public content**

Replace only the fixed desktop/mobile login links in `Navbar.tsx`. Keep tool menus, logo, search, language switcher, dimensions, breakpoints, and styles unchanged.

- [ ] **Step 5: Verify focused tests and types**

Run:

```bash
npx tsc --noEmit
npm run build
npx playwright test tests/e2e/smoke.spec.ts --grep "Navbar authentication"
```

Expected: all exit 0.

- [ ] **Step 6: Commit locally**

```bash
git add src/components/Navbar.tsx src/components/auth/AuthNav.tsx tests/e2e/smoke.spec.ts
git commit -m "feat: add account navigation and logout"
```

---

### Task 9: Auth metadata, sitemap exclusions, and SEO regression protection

**Files:**

- Modify: `src/seo/config.ts`
- Modify: `src/seo/nextMetadata.ts`
- Modify: `scripts/verify-p0-seo.mts`
- Modify: `scripts/verify-seo-live.mts`
- Modify: `scripts/verify-auth.mts`
- Modify: `package.json`

**Interfaces:**

- Extends: `RouteMeta` with optional `follow?: boolean`
- Produces: unique noindex metadata for every auth/private page
- Produces: `npm run verify:auth`

- [ ] **Step 1: Write failing metadata/sitemap tests**

Update P0 checks so `/login`, `/signup`, `/forgot-password`, and `/reset-password` must be `index: false, follow: true`; `/account` and `/account/profile` must be `index: false, follow: false`; every route must be absent from `sitemap()`. Include all six in title/description uniqueness checks.

- [ ] **Step 2: Run and confirm failure**

Run: `npm run verify:seo`

Expected: FAIL because new route metadata and nofollow support are missing.

- [ ] **Step 3: Add exact route metadata**

Add unique titles/descriptions:

```ts
"/login": { title: "Sign In | PDFNova", description: "Sign in to your PDFNova account.", indexable: false },
"/signup": { title: "Create Account | PDFNova", description: "Create an optional PDFNova account.", indexable: false },
"/forgot-password": { title: "Reset Password | PDFNova", description: "Request a secure PDFNova password reset link.", indexable: false },
"/reset-password": { title: "Choose New Password | PDFNova", description: "Choose a new password for your PDFNova account.", indexable: false },
"/account": { title: "My Account | PDFNova", description: "View your PDFNova account.", indexable: false, follow: false },
"/account/profile": { title: "Profile | PDFNova", description: "Update your PDFNova profile.", indexable: false, follow: false },
```

Change `buildMetadata()` to emit `follow: meta.follow ?? true`.

- [ ] **Step 4: Expand rendered SEO checks**

Add the four public auth pages to `noindexPaths` in `verify-seo-live.mts`. Treat protected account paths as known routes that legitimately redirect without adding them to rendered indexable pages. Assert none of the auth/private paths occurs in sitemap XML.

- [ ] **Step 5: Register the auth verification script**

Add:

```json
"verify:auth": "tsx scripts/verify-auth.mts"
```

and include it in `npm run verify` before `verify:seo`.

- [ ] **Step 6: Verify auth and SEO checks**

Run:

```bash
npm run verify:auth
npm run verify:seo
npm run verify:landing
```

Expected: all exit 0 and the canonical sitemap count remains unchanged.

- [ ] **Step 7: Commit locally**

```bash
git add package.json scripts/verify-auth.mts scripts/verify-p0-seo.mts scripts/verify-seo-live.mts src/seo/config.ts src/seo/nextMetadata.ts
git commit -m "test: protect SEO from authentication changes"
```

---

### Task 10: Local setup documentation and complete verification

**Files:**

- Modify: `README.md`
- Modify: `tests/e2e/smoke.spec.ts`

**Interfaces:**

- Produces: reproducible local and Supabase-dashboard setup instructions
- Verifies: all design acceptance criteria without remote deployment

- [ ] **Step 1: Document exact local configuration**

Add an Authentication section covering:

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Document Supabase Site URL `https://www.pdfnova.in`, redirects `https://www.pdfnova.in/auth/callback` and `http://localhost:3000/auth/callback`, email/password plus confirmation settings, production SMTP, and the command that will eventually apply migrations. Clearly state that this local-only delivery does not run `supabase db push`, `git push`, or a deployment command.

- [ ] **Step 2: Add final public-access regression test**

For representative `/`, `/merge-pdf`, `/compress-pdf`, and `/blog` pages, assert an anonymous request returns 200, does not navigate to `/login`, retains its H1, and exposes the expected tool/content link.

- [ ] **Step 3: Run auth verification from a clean build**

Run:

```bash
npm run clean
npm run verify:auth
npm run verify
npm run build
```

Expected: every command exits 0 with zero failed checks.

- [ ] **Step 4: Run rendered SEO verification**

Run: `npm run seo:check`

Expected: exit 0; public pages retain metadata, canonical, H1, JSON-LD, sitemap, and internal-link checks, while auth pages report noindex.

- [ ] **Step 5: Run browser smoke tests**

Run: `npx playwright test tests/e2e/smoke.spec.ts`

Expected: all tests pass for desktop Chromium and mobile Chromium.

- [ ] **Step 6: Inspect secrets and repository state**

Run:

```bash
git status --short
git diff --check
git grep -n -E 'SUPABASE_(SECRET|SERVICE_ROLE)_KEY=.+' -- ':!package-lock.json' || true
git grep -n -E 'CRON_SECRET=.+' || true
```

Expected: no real secret values appear in tracked files; only intentional local commits and any ignored `.env` remain.

- [ ] **Step 7: Commit local documentation and test completion**

```bash
git add README.md tests/e2e/smoke.spec.ts
git commit -m "docs: add local Supabase authentication setup"
```

- [ ] **Step 8: Stop before remote operations**

Report the local commit range, verification results, and these deliberately unperformed commands:

```text
supabase link
supabase db push
git push
vercel deploy
```

Do not execute any of them without a new explicit request.
