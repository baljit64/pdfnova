# Supabase authentication setup

## Environment and deployment

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` locally and in Vercel for each deployed environment. Redeploy after changing these build-time public variables. The existing `NEXT_PUBLIC_SUPABASE_ANON_KEY` fallback remains supported. Never expose a service-role key through a `NEXT_PUBLIC_` variable.

This project uses Next.js 15: `src/middleware.ts` refreshes cookies using `getUser()` and forwards cookie/cache headers. Public PDF tools remain public. The existing shared social buttons use the same OAuth flow for signup and login. One navbar listener synchronizes the displayed account state and unsubscribes on unmount. Hovering, focusing, or tapping the signed-in user control in the navbar shows the name, email, photo, and logout action.

## Database

Apply both migrations in timestamp order using the Supabase SQL Editor or your linked project's migration workflow:

- `supabase/migrations/20260906000000_create_profiles.sql` creates `public.profiles`, an Auth insert trigger, timestamp maintenance, owner-only RLS policies, and an idempotent backfill of existing Auth users.
- `supabase/migrations/20260907000000_create_user_file_archive.sql` creates the private `user-files` Storage bucket and owner-only `user_files` archive records.

Auth owns user creation; the browser does not insert users or profiles. Profile updates are limited to name/avatar columns. Missing optional metadata is accepted.

No existing profile table or migration was found in this repository. The remote database was not inspected. If it already has a profiles table or `handle_new_user` trigger/function, reconcile that schema before applying this migration; do not drop existing data. The migration intentionally fails transactionally on conflicting schema names.

## Thirty-day saved file archive

When a signed-in user completes a tool, PDFNova uploads the resulting file to the private `user-files` bucket and creates an archive record. Source files are not archived. Users can retrieve results from `/files`; RLS prevents one user from listing or downloading another user’s files.

Set these **server-only** values locally and in Vercel:

- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Dashboard → Project Settings → API → service_role key. This is used only by the cleanup route; never put it in a `NEXT_PUBLIC_` variable.
- `CRON_SECRET`: a newly generated long random string. Vercel sends it to the scheduled cleanup route automatically.

`vercel.json` schedules `/api/cron/purge-user-files` daily at 03:00 UTC. It removes expired Storage objects and their database records in batches of 100. Verify the Vercel project has the cron enabled after deployment.

## Supabase dashboard

Authentication → URL Configuration:

Site URL: `https://www.pdfnova.in`

Redirect URLs:

- `http://localhost:3000/**`
- `https://pdfnova.in/**`
- `https://www.pdfnova.in/**`

Enable Email, Google, and Facebook under Authentication → Sign In / Providers. Configure provider client IDs/secrets there, never in frontend code. Choose whether email confirmation is required. With confirmation enabled, signup displays verification instructions; with it disabled, an issued session takes the user directly to `/`. Supabase may intentionally obscure duplicate-email signup responses; use login or password recovery rather than assuming every success response created a new user.

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

Flow: Application → Google/Facebook → Supabase `/auth/v1/callback` → application `/auth/callback` → `/` (or a validated internal `next` path).

## Acceptance checks after configuration

- New Google/Facebook account: sign in from either form; verify one Auth user and one profile row, then `/`.
- Existing social account: sign in again; verify the existing user/profile is reused.
- Email signup: verify confirmation message when enabled and direct login when disabled; confirm the email and check the profile.
- Email login: test valid credentials, invalid password, and unconfirmed email.
- Logout: use the navbar user menu logout action and confirm the signed-in user control becomes the Log in button.
- Password recovery: request the email, open it in the same browser, save a new password, log out, then log in with the new password. Also test an expired/reused link.
- Session refresh: revisit the site after token expiry and verify refreshed cookies are written.
- RLS: with two ordinary authenticated users, verify each can select/update only their own profile and cannot insert/delete profiles or change identity/provider fields.
- Callback: test provider cancellation, missing code, and external `next` values; they must never redirect outside the app.
- Saved archive: while signed in, complete a local tool and confirm the result appears in `/files`; use a second account to confirm it cannot view or download it. Confirm an expired test record is removed by the scheduled cleanup route.

Local checks do not authenticate against real provider accounts or apply the SQL migration. Run the live checks after configuring the dashboards and applying the migration.

References: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook).
