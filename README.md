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

Run the complete rendered SEO audit after a production build:

```bash
npm run seo:check
```
