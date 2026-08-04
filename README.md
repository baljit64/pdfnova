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

SEO is implemented for better search visibility:

- **Per-route meta**: Every page has a unique `<title>` and `<meta name="description">` with relevant keywords (e.g. "merge PDF online free", "compress PDF").
- **Open Graph & Twitter Cards**: `og:title`, `og:description`, `og:url`, `og:image` and Twitter equivalents for rich previews when shared.
- **Canonical URLs**: Each page sets a canonical link to avoid duplicate content.
- **JSON-LD**: WebSite and Organization schema on the homepage; SoftwareApplication schema on tool pages for rich results.
- **Sitemap**: `public/sitemap.xml` lists all indexable URLs.
- **robots.txt**: `public/robots.txt` allows crawlers and points to the sitemap.

**Production URL**: Before deploying, set your live domain so all absolute URLs are correct:

1. Create `.env` from `.env.example` and set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com`.
2. Replace `https://pdfnova.com` in `public/robots.txt` and `public/sitemap.xml` with your domain, or use a build step to inject it.

Submit your sitemap in [Google Search Console](https://search.google.com/search-console) after going live.
