# Canonical tool landing pages

PDFNova publishes one indexable landing page for each working tool. The current
catalogue contains 13 canonical tool pages, all rendered from one server
component and backed by the same tool engine used in the interface.

This one-page-per-intent policy prevents keyword cannibalisation. Older
long-tail routes such as `/merge-pdf-online` remain available only as permanent
redirects to `/merge-pdf`; they are not rendered, internally linked, or listed
in the sitemap.

## Adding a working tool

1. Add the tool id and interface contract in `src/tools/types.ts`.
2. Add the descriptor in `src/tools/registry.ts`, including its verified
   processing model and related tools.
3. Add execution in `src/tools/runners.ts`, keeping heavy libraries behind
   dynamic imports.
4. Add unique supporting content in `src/seo/landing/toolContent.ts`.
5. Add a unique title, description, and H1 in
   `src/seo/landing/toolSeo.ts`.
6. Add the canonical route at `src/app/<slug>/page.tsx` with
   `CanonicalToolPage` and `canonicalMetadata`.

Only set `available: true` when the workspace completes the advertised task.
Available tools automatically enter the canonical landing-page catalogue and
sitemap. Unfinished tools use explicit route metadata with `noindex, follow`
and stay out of the sitemap.

## Page architecture

Each canonical tool page includes:

- a self-referencing canonical and unique Open Graph/Twitter metadata;
- exactly one H1 and a short, task-specific introduction;
- the real interactive tool workspace;
- visible steps, benefits, features, limitations, privacy details, and FAQs;
- Home › PDF Tools › Current Tool breadcrumbs;
- contextual links to other working tools and relevant blog guides;
- server-rendered BreadcrumbList, SoftwareApplication/WebApplication, HowTo,
  and FAQPage data generated from the same visible content.

`src/seo/landing/generate.ts` composes the registry, source content, and search
metadata. `src/components/landing/LandingPageView.tsx` renders the result. Tool
routes stay small and cannot drift into separate implementations.

## Legacy redirects

`src/seo/legacyRedirects.ts` derives the previous long-tail route catalogue for
verification. Compact pattern rules in `next.config.js` emit the permanent
redirects without building hundreds of page artifacts. URLs outside the
explicit patterns return a real 404.

Do not add new keyword permutations. Improve the canonical tool page and link
to it from a genuinely useful guide instead.

## Verification

Run:

```bash
npm run verify:landing
npm run verify:seo
npm run build
npm run seo:check
```

The checks cover metadata uniqueness and length, one canonical page per working
tool, meaningful supporting content, breadcrumb and related-link integrity,
legacy redirect coverage, indexability, sitemap/robots output, JSON-LD,
generated HTML, internal links, and real 404 responses.
