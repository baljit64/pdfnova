# Supabase authentication setup

## Environment and deployment

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` locally and in Vercel for each deployed environment. Redeploy after changing these build-time public variables. The existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback remains supported. No service-role key is needed. Never expose one through a `NEXT_PUBLIC_` variable.

This project uses Next.js 15: `src/middleware.ts` refreshes cookies using `getUser()` and forwards cookie/cache headers. Public PDF tools remain public. `/account` checks `getUser()` on the server and fetches only the current user's profile. The existing shared social buttons use the same OAuth flow for signup and login. One navbar listener synchronizes the displayed account state and unsubscribes on unmount. Logout is available on `/account`.

## Database

Apply `supabase/migrations/20260906000000_create_profiles.sql` once using the Supabase SQL Editor or your linked project's migration workflow. It creates `public.profiles`, an Auth insert trigger, timestamp maintenance, owner-only RLS policies, and an idempotent backfill of existing Auth users. Auth owns user creation; the browser does not insert users or profiles. Profile updates are limited to name/avatar columns. Missing optional metadata is accepted.

No existing profile table or migration was found in this repository. The remote database was not inspected. If it already has a profiles table or `handle_new_user` trigger/function, reconcile that schema before applying this migration; do not drop existing data. The migration intentionally fails transactionally on conflicting schema names. Profile lookup failures do not prevent the account page from displaying authenticated user details.

## Supabase dashboard

Authentication → URL Configuration:

Site URL: `https://www.pdfnova.in`

Redirect URLs:

- `http://localhost:3000/**`
- `https://pdfnova.in/**`
- `https://www.pdfnova.in/**`

Enable Email, Google, and Facebook under Authentication → Sign In / Providers. Configure provider client IDs/secrets there, never in frontend code. Choose whether email confirmation is required. With confirmation enabled, signup displays verification instructions; with it disabled, an issued session takes the user directly to `/account`. Supabase may intentionally obscure duplicate-email signup responses; use login or password recovery rather than assuming every success response created a new user.

Configure production SMTP and review email delivery/rate limits. Keep confirmation and recovery templates using `{{ .ConfirmationURL }}` so Supabase verifies the email token and returns a PKCE code to the requested app redirect. Recovery requests redirect to `/auth/reset-password`, which sends the code through `/auth/callback` before showing the password form. Open email links in the browser that initiated the request because PKCE requires its verifier cookie. Expired, reused, or cross-browser links may require a fresh request.

## Google Cloud

Create/configure a Web application OAuth client and consent screen. Add the authorized redirect URI:

`https://jnkyenkzsqbyarocctxe.supabase.co/auth/v1/callback`

This public URL was derived from the existing `NEXT_PUBLIC_SUPABASE_URL`. For another Supabase project use `${NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`.

Copy the Google client ID and secret into the Supabase Google provider settings. Configure consent-screen audience, test users while testing, and production publishing/verification as required.

## Meta / Facebook

Configure Facebook Login and add this Valid OAuth Redirect URI:

`https://jnkyenkzsqbyarocctxe.supabase.co/auth/v1/callback`

Copy the Meta App ID and App Secret into the Supabase Facebook provider settings. Enable web OAuth login; configure the app domain `pdfnova.in`, privacy policy `https://www.pdfnova.in/privacy`, and the data-deletion URL/instructions Meta requires. Verify email permission and switch to Live mode when ready; development mode restricts who can sign in.

The provider callback above is **different from the application's `/auth/callback`**. Do not substitute `https://www.pdfnova.in/auth/callback` into the provider redirect field.

Flow: Application → Google/Facebook → Supabase `/auth/v1/callback` → application `/auth/callback` → `/account` (or a validated internal `next` path).

## Acceptance checks after configuration

- New Google/Facebook account: sign in from either form; verify one Auth user and one profile row, then `/account`.
- Existing social account: sign in again; verify the existing user/profile is reused.
- Email signup: verify confirmation message when enabled and direct login when disabled; confirm the email and check the profile.
- Email login: test valid credentials, invalid password, and unconfirmed email.
- Logout: use `/account` logout, then directly revisit `/account` and confirm `/login?redirect=/account`.
- Password recovery: request the email, open it in the same browser, save a new password, log out, then log in with the new password. Also test an expired/reused link.
- Session refresh: revisit `/account` after token expiry and verify refreshed cookies are written.
- RLS: with two ordinary authenticated users, verify each can select/update only their own profile and cannot insert/delete profiles or change identity/provider fields.
- Callback: test provider cancellation, missing code, and external `next` values; they must never redirect outside the app.

Local checks do not authenticate against real provider accounts or apply the SQL migration. Run the live checks after configuring the dashboards and applying the migration.

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook).
