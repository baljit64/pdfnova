# PDFNova (Next.js)

Free online PDF tools: merge, split, compress, convert PDFs.

## Development

```bash
npm install
npm run dev
```

## Build & start

```bash
npm run build
npm run start
```

## SEO (Google / search)

SEO is implemented around the preferred origin `https://www.pdfnova.in`:

- **Per-route metadata**: Indexable pages have unique titles, descriptions and self-referencing canonicals.
- **Open Graph & Twitter Cards**: `og:title`, `og:description`, `og:url`, `og:image` and Twitter equivalents for rich previews when shared.
- **Indexability policy**: Functional canonical tools and useful content are indexable. Login, unfinished tools and preserved long-tail variations emit `noindex, follow` and stay out of the sitemap.
- **JSON-LD**: Site-wide entities and tool-page structured data are rendered in the initial HTML.
- **Sitemap and robots**: Next.js generates `/sitemap.xml` and `/robots.txt` from the same route policy.
- **404 handling**: Unknown routes return an HTTP 404 response.
- **Domain normalization**: Requests for `pdfnova.in` redirect directly to `https://www.pdfnova.in`.

To verify the site in Google Search Console, set `GOOGLE_SITE_VERIFICATION` in the production environment to the token from Google's HTML-tag verification method, then deploy. Submit `https://www.pdfnova.in/sitemap.xml` after verification.

## Environment variables

Keep real values in `.env` locally and in Vercel for deployments. Never commit them to
`.env.example`.

- `CLOUDCONVERT_API_KEY` — server-only and required for PDF to Word (including OCR) and Word to PDF. Enable it for Production;
  use separate credentials for Preview or local Development when those environments need the tool.
- `GOOGLE_SITE_VERIFICATION` — optional, non-secret HTML-tag verification token for Google Search
  Console. Production is sufficient. Copy the tag's `content` value, not an HTML filename.
- `CONTACT_FORM_ENDPOINT` — server-only HTTPS webhook that accepts the contact form JSON. Enable it
  for Production, and use a test webhook for Preview/Development if needed.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` — optional server-only Redis REST
  credentials used for conversion rate limits shared across server instances. Without them, local
  development falls back to an in-memory limiter.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — required for signup,
  email/password login, and social login. `NEXT_PUBLIC_SUPABASE_ANON_KEY` remains a temporary
  legacy-key fallback. These project values are browser-visible; never use a Supabase secret or
  service-role key in a `NEXT_PUBLIC_` variable.

## Supabase authentication setup

In Supabase Authentication → URL Configuration, set the Site URL to
`https://www.pdfnova.in` and allow these redirect URLs:

- `https://www.pdfnova.in/auth/callback`
- `http://localhost:3000/auth/callback`

Enable Email plus the Google and Facebook providers under Authentication → Providers.
For every social provider, copy the Supabase callback shown in that provider panel—normally
`https://<project-ref>.supabase.co/auth/v1/callback`—into its external developer console. That
provider callback is different from PDFNova's application callback above.

- Google: create a Web OAuth client, add `https://www.pdfnova.in` and
  `http://localhost:3000` as authorized origins, then add the Supabase provider callback as an
  authorized redirect URI.
- Facebook: configure Facebook Login, request the `email` permission, add the exact Supabase
  provider callback under Valid OAuth Redirect URIs, and switch the app to Live mode before public
  production use.
Provider secrets belong only in the provider panels and secret stores. Do not put them in this
repository or in `NEXT_PUBLIC_` environment variables.

The canonical site URL is intentionally fixed in `src/seo/config.ts`; no `SITE_URL` environment
variable is required.

In Vercel Project Settings → Domains, keep `www.pdfnova.in` as the primary domain. Edit
`pdfnova.in`, redirect it to `www.pdfnova.in`, and select a permanent 308 status while preserving
the path and query string. The application also contains the same permanent redirect as a fallback.

Run the complete rendered SEO audit after a production build:

```bash
npm run seo:check
```
