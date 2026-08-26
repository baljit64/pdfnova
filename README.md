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
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — currently unused because login is
  not connected. Leave them blank until authentication is implemented. These project values are
  browser-visible; never use a Supabase service-role key in a `NEXT_PUBLIC_` variable.

The canonical site URL is intentionally fixed in `src/seo/config.ts`; no `SITE_URL` environment
variable is required.

In Vercel Project Settings → Domains, keep `www.pdfnova.in` as the primary domain. Edit
`pdfnova.in`, redirect it to `www.pdfnova.in`, and select a permanent 308 status while preserving
the path and query string. The application also contains the same permanent redirect as a fallback.

Run the complete rendered SEO audit after a production build:

```bash
npm run seo:check
```
