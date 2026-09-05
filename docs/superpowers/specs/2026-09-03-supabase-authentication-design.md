# PDFNova Supabase Authentication Design

**Date:** 3 September 2026  
**Status:** Approved; free-provider social-login extension approved 5 September 2026
**Scope:** Optional account authentication and profile foundation

## Goal

Add secure Supabase email/password authentication to PDFNova without changing the public PDF-tool experience or weakening existing SEO. Anonymous visitors retain full access to every working tool. Accounts are an optional enhancement that provides identity, profile management, and the foundation for a later private output-history feature.

## Delivery boundaries

This phase includes:

- Supabase SSR browser, server, middleware, and server-only client utilities
- Email/password signup with full-name metadata and email confirmation
- Email/password login
- Google and Facebook OAuth login on both login and signup pages
- Secure PKCE confirmation callback
- Forgot-password and reset-password flows
- Logout
- Protected account and profile pages
- Profile creation trigger and owner-only RLS
- Authentication-aware desktop and mobile header controls
- Noindex metadata and sitemap exclusion for all auth/private routes
- Automated authentication, accessibility, routing, and SEO regression checks
- Exact Supabase and deployment configuration instructions

This phase does not include:

- OAuth providers other than Google and Facebook
- File uploads, output history, quotas, or retention cleanup
- A global application-wide auth provider
- Any requirement to sign in before using a PDF tool

Private output history will be a separate phase using the already selected policy: output files only, private Supabase Storage, 1 GB active quota per account, 60-day expiry, and user deletion at any time.

## Existing system

PDFNova uses Next.js App Router, TypeScript, Tailwind-based site tokens, Ant Design in some forms, and a root layout containing the existing Navbar and Footer. Public tool pages are statically rendered with established metadata, canonical URLs, JSON-LD, sitemap rules, and crawlable content. The current `/login` form is a client-side placeholder and the current Supabase utility is a browser-oriented singleton created directly with `@supabase/supabase-js`.

The implementation must replace that placeholder while preserving all working public routes and page output.

## Supabase configuration

Install `@supabase/ssr` and update `@supabase/supabase-js` to a compatible current release.

Use these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` — full project URL, including `https://` and `.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — preferred current browser-safe key
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — temporary fallback for the existing legacy public key during migration
- `SUPABASE_SECRET_KEY` — server-only key reserved for later administrative storage operations; not required by ordinary authentication flows
- `SUPABASE_SERVICE_ROLE_KEY` — legacy server-key fallback only while migrating; never imported by browser-reachable modules
- `CRON_SECRET` — reserved for the later file-retention phase

Public clients may read only variables prefixed with `NEXT_PUBLIC_`. Server-only keys must never be logged, returned in responses, embedded in URLs, or imported into client components.

## Client utilities

Create a focused structure under `src/lib/supabase/`:

- `config.ts` validates the public URL/key and provides a clear configuration error without exposing values.
- `client.ts` creates the browser client with `createBrowserClient`.
- `server.ts` creates a request-scoped server client with `createServerClient` and Next.js `cookies()`.
- `middleware.ts` synchronizes refreshed cookies between the request and response.
- `admin.ts` is server-only and creates an elevated client only when later administrative operations require it.

The browser client may be cached at module scope in the browser. Server clients remain request-scoped because their cookie state belongs to one request.

## Session middleware and protection

Add root `middleware.ts`, appropriate for the project's Next.js 15 version. It runs for application pages while excluding static assets, image optimization, and obvious public files.

The middleware refreshes the Supabase session and copies updated cookies to both the forwarded request and outgoing response. It does not redirect users away from public routes.

Protected route prefixes are:

- `/account`
- `/account/profile`
- `/account/history` when the later history phase is delivered
- `/settings` if it is introduced later

An anonymous request to a protected route redirects to `/login?redirect=<safe-relative-path>`. Authentication decisions use a verified claims/user call, not untrusted `getSession()` data.

Authenticated users visiting `/login` or `/signup` may be redirected to a safe requested destination or `/account`.

## Safe redirects

A shared redirect utility accepts only a path that:

- starts with exactly one `/`
- does not start with `//`
- contains no scheme or host
- resolves to a route on the same PDFNova origin

Invalid, absolute, protocol-relative, or malformed values fall back to `/account`. The callback, login, and signup flows all use this same utility.

## Authentication flows

### Signup

`/signup` collects full name, email, password, and password confirmation. Client-side validation requires a non-empty name, valid email, at least eight password characters, and matching passwords. The form disables duplicate submission and exposes accessible loading and error states.

It calls `supabase.auth.signUp()` with `full_name` in user metadata and an environment-aware confirmation callback URL. Email confirmation is treated as enabled. A successful signup presents a “Check your email” state and does not claim the user is signed in.

### Email confirmation callback

`/auth/callback` is a server route handler. It validates the optional internal destination, exchanges the PKCE code with `exchangeCodeForSession`, and redirects to the safe destination. Missing, expired, or invalid codes redirect to login with a short user-safe error code; raw Supabase errors never enter the query string.

### Login

`/login` collects email and password and calls `signInWithPassword()`. After success it navigates to the validated internal redirect and refreshes the router. Until `/account` is delivered, the default destination is `/`, avoiding a post-login 404.

### Social login

Both `/login` and `/signup` show OAuth actions in this exact order: Google, then Facebook. A divider labelled “or continue with email” separates those actions from the existing email/password form below. Apple is intentionally omitted because this phase is limited to providers that do not require a paid developer membership.

A shared client component calls `signInWithOAuth()` using only those three allow-listed provider identifiers. It sends users back to `/auth/callback` through the existing PKCE flow and preserves only validated same-origin destinations. Until `/account` is delivered, an absent or rejected destination falls back to `/`, avoiding a post-login 404. Buttons prevent duplicate submissions, expose a provider-specific loading state, and render provider failures as user-safe messages.

The callback treats provider cancellation or rejection as `oauth_failed`; raw provider descriptions never enter the application URL or UI. Google and Facebook profile metadata may populate a profile name.

### Password recovery

`/forgot-password` accepts an email and calls `resetPasswordForEmail()` with an environment-aware callback ending in `?next=/reset-password`. Its success message is identical whether or not the address exists.

The callback establishes the recovery session and redirects to `/reset-password`. That page requires a valid authenticated recovery session, validates two matching passwords of at least eight characters, and calls `updateUser({ password })`. Success offers navigation to `/account` and `/`.

### Logout

Logout calls `supabase.auth.signOut()`, clears synchronized session state, refreshes the router, and redirects to `/`. No full browser cache clear or manual reload is required.

## Error handling

Map known Supabase error codes/messages to stable user-facing copy:

- invalid credentials → “Incorrect email or password.”
- duplicate signup → “An account with this email already exists.” or the non-enumerating confirmation response required by the configured Supabase behavior
- weak password → “Please choose a stronger password.”
- email rate limit → “Too many attempts. Please wait a moment and try again.”
- expired confirmation/recovery code → a concise prompt to request a new link
- unavailable network/service → “We could not connect right now. Please try again.”

Unexpected technical details remain server-side and are not rendered or logged with tokens, passwords, or secret values.

## Profile data

Add a Supabase migration creating `public.profiles`:

- `id uuid primary key references auth.users(id) on delete cascade`
- `full_name text`
- `avatar_url text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

A `security definer` trigger function with an explicit empty/safe `search_path` creates the profile from `auth.users` and `raw_user_meta_data->>'full_name'`. It uses the authenticated user's generated ID and handles conflicts safely.

RLS is enabled. Authenticated users may select and update only the profile whose `id = auth.uid()`. There is no public profile access and no client-supplied user ID is trusted for ownership.

## Account UI

`/account` is a protected server page showing the verified user's first name, email, a Profile card, and an honest notice that stored-file history will arrive in the next phase. It does not display fabricated activity.

`/account/profile` allows editing the full name with saving, success, and inline error states. Avatar upload is deferred.

The Navbar keeps its current dimensions, colors, spacing, and responsive behavior. Anonymous users see the existing subtle sign-in action. An isolated client auth-status control checks the user once and subscribes to auth changes; it does not convert page content to client rendering or make every public page dynamically rendered. Authenticated users see an Account control with Account, Profile, and Sign Out options. Mobile actions remain inside the existing mobile navigation.

## Auth-page UI and accessibility

Login, signup, recovery, and reset pages reuse the existing Navbar, Footer, container widths, design tokens, buttons, borders, radii, shadows, and form styling. OAuth buttons use recognizable provider marks and appear above the email/password fields. No standalone dashboard theme or redesign is introduced.

All fields have visible associated labels, correct `autocomplete` values, keyboard-accessible controls, visible focus treatment, inline validation, and `aria-live` error/status regions. Password fields have text-labelled show/hide buttons; icons are not the only accessible name. Submit buttons expose the requested loading labels and remain disabled during submission.

## SEO preservation

No public tool route, canonical, metadata record, structured-data component, or content hierarchy changes as part of authentication. Public tools remain accessible without cookies or a session.

The following routes are absent from the sitemap and emit `noindex`:

- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/auth/callback`
- `/account`
- `/account/profile`

Public auth-entry pages use `noindex, follow`; protected account pages use `noindex, nofollow`. Middleware never redirects public pages or crawlers to login.

## Testing strategy

Implementation follows test-driven development.

Unit/verification coverage includes:

- environment validation without secret disclosure
- safe redirect acceptance and rejection
- Supabase error translation
- auth/private metadata and sitemap exclusion
- middleware route classification and protected redirects
- profile migration structure, RLS policies, and safe trigger definition
- public route policy remains unchanged

End-to-end coverage includes:

- accessible login/signup forms and client validation
- duplicate-submit prevention and loading states
- anonymous public-tool access
- anonymous `/account` redirect preserving a safe destination
- malicious external redirect rejection
- authenticated account rendering and logout navigation using a controlled test client or test project
- email-confirmation and password-recovery callback error handling

The existing full verification suite, production build, rendered SEO checker, and public-tool smoke tests must pass before completion.

## Manual Supabase and deployment configuration

After implementation, configure Supabase Auth with:

- Site URL: `https://www.pdfnova.in`
- Redirect URLs:
  - `https://www.pdfnova.in/auth/callback`
  - `http://localhost:3000/auth/callback`
- Email/password provider enabled
- Google and Facebook providers enabled with credentials from their respective developer consoles
- Email confirmation enabled
- Production SMTP configured before relying on confirmation or recovery email delivery

Each provider console must use the Supabase Auth callback shown in the provider panel, normally `https://<project-ref>.supabase.co/auth/v1/callback`. This is distinct from PDFNova's `/auth/callback`, which belongs in Supabase's redirect allow list. Google also needs the PDFNova production and local origins configured. Facebook needs the `email` permission and Live mode before general production use.

Add the public URL/key to local and Vercel environments. Add server-only secrets only to trusted server environments. Never paste them into chat or commit them.

Apply the checked-in Supabase migration to the linked `pdfnova` project only after reviewing the target project reference and migration diff.

## Security incident prerequisite

The previously pasted Supabase service-role key, CloudConvert key, and cron secret must be considered compromised. Before any storage/admin phase or production deployment uses them:

1. Create a new Supabase `sb_secret_...` key and retire the exposed legacy service-role key after replacement.
2. Revoke and replace the exposed CloudConvert key.
3. Generate a new cron secret.
4. Store replacements only in local/Vercel secret stores.

The public Supabase anon/publishable key is intentionally browser-visible and is protected by RLS rather than secrecy.

## Acceptance criteria

- Anonymous visitors can use every existing PDF tool exactly as before.
- A visitor can authenticate with Google, Facebook, or email/password; email users can confirm email, recover a password, and sign out.
- Protected pages reject anonymous access and never trust a client-supplied identity.
- No open redirect is possible through login or callback parameters.
- No secret or service-role key reaches browser code, source control, logs, or responses.
- Auth/private routes are noindex and absent from the sitemap.
- Existing SEO and functional verification suites pass unchanged.
- The UI remains recognizably and consistently PDFNova.
