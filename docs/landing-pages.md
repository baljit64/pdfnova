# SEO landing pages

PDFNova serves **256 tool pages** — 13 parent tool pages and 243 long-tail landing
pages — from a single template and a single tool engine. Every one of them runs
the real tool: upload, drag & drop, validation, progress, errors, retry and
download. None of them redirects to a parent page.

Adding more pages is a configuration change. No new route file, no new component.

---

## Adding a landing page

Everything is driven by [`src/seo/landing/variations.ts`](../src/seo/landing/variations.ts).

### Apply an existing variation to more tools

Some variations are restricted with `onlyTools`. Widen the list and the pages
appear:

```ts
const highResolution: VariationDefinition = {
  id: "high-resolution",
  onlyTools: ["pdf-to-jpg", "pdf-to-image"],   // ← add a tool id here
  …
}
```

### Add a brand-new variation

Add one object to the file and list it in the `VARIATIONS` array at the bottom:

```ts
const forStudents: VariationDefinition = {
  id: "for-students",
  slugSuffix: "-for-students",
  label: "For students",
  keyword: (t) => `${t.name.toLowerCase()} for students`,
  h1: (t) => `${t.name} for Students`,
  titlePrefix: (t) => `${t.name} for Students — Free, No Signup`,
  description: (t) => `${t.name} for coursework and assignments. ${t.blurb} Free, no account.`,
  lead: (t) => ["…", "…", "…"],           // paragraphs above the tool
  section: (t) => ({ heading: "…", paragraphs: ["…", "…"] }),
  benefits: (t) => [{ title: "…", body: "…" }],
  faqs: (t) => [{ question: "…", answer: "…" }],
  // localOnly: true,                     // skip this for server-side tools
  // onlyTools: ["merge-pdf"],            // restrict to specific tools
}

export const VARIATIONS = [ …, forStudents ]
```

One entry with no `onlyTools` generates **13 pages** — one per available tool.
Routes, metadata, canonicals, JSON-LD, internal links and the sitemap all follow
automatically.

Then run:

```bash
npm run verify:seo   # invariants: uniqueness, word count, orphans, link integrity
npm run build
```

### Two guard rails

- **`localOnly: true`** means the copy claims the file never leaves the device.
  Those variations are skipped for server-side tools, so `/pdf-to-word-secure`
  does not exist and returns a 404. Set it on any variation whose copy makes a
  privacy claim.
- **`available: false`** on a tool means no landing pages are generated for it.
  This is why the three "coming soon" tools have no variations — a page that
  cannot do the job should not try to rank for it.

---

## Adding a tool

1. Add the id to `ToolId` in [`src/tools/types.ts`](../src/tools/types.ts).
2. Add the descriptor to [`src/tools/registry.ts`](../src/tools/registry.ts) —
   accepted formats, limits, option schema, related tools. Keep `blurb` under
   50 characters; it is what keeps generated meta descriptions inside the
   ~155-character budget.
3. Add the execution function to
   [`src/tools/runners.ts`](../src/tools/runners.ts), using a dynamic `import()`
   so heavy libraries stay out of other pages' bundles.
4. Add its copy to
   [`src/seo/landing/toolContent.ts`](../src/seo/landing/toolContent.ts) —
   intro, benefits, steps, features, use cases, FAQs, a technical section and an
   honest `limitations` string.
5. Create the parent route at `src/app/<slug>/page.tsx`:

   ```tsx
   import CanonicalToolPage, { canonicalMetadata } from "../../components/landing/CanonicalToolPage";

   export const metadata = canonicalMetadata("<slug>");

   export default function Page() {
     return <CanonicalToolPage slug="<slug>" />;
   }
   ```

Every applicable variation page is generated from that point on.

---

## Architecture

```
src/tools/
  types.ts          ToolDefinition, OptionField, RunContext, RunResult
  registry.ts       tool metadata — no browser APIs, safe on the server
  runners.ts        tool id → execution, all engines behind dynamic import()
  engine/
    blob.ts         download helpers, WinAnsi sanitising, byte formatting
    pdf.ts          merge, split, rotate, watermark, sign, add text (pdf-lib)
    raster.ts       PDF→images, images→PDF, size-targeted compression (pdf.js)
    office.ts       Excel→PDF, Word→PDF, PDF→Word (API)

src/components/tool/
  ToolWorkspace.tsx orchestrator — the only interactive surface on any tool page
  FileDropzone.tsx  drag & drop, click, keyboard; validation feedback
  OptionsForm.tsx   renders a tool's option schema
  SelectedFiles.tsx reorder / rotate / remove, gated by the tool's declaration
  ResultPanel.tsx   preview, per-file and bulk download

src/components/landing/
  LandingPageView.tsx   the one template behind every tool page (server component)
  CanonicalToolPage.tsx wiring for the parent tool routes

src/seo/
  schema.ts             JSON-LD builders
  JsonLdScript.tsx      server-rendered <script type="application/ld+json">
  nextMetadata.ts       Metadata objects, incl. buildLandingMetadata
  landing/
    variations.ts       ← the file you edit to add pages
    toolContent.ts      per-tool source copy
    generate.ts         composes tool + content + variation into a LandingPage
    types.ts            LandingPage shape

src/app/
  [slug]/page.tsx   all 243 variation pages (generateStaticParams, dynamicParams: false)
  <tool>/page.tsx   13 parent tool routes
  sitemap.ts        generated from the catalogue
  robots.ts

src/analytics/track.ts  reusable event tracking

scripts/
  verify-engine.mts  38 engine assertions against real PDFs
  verify-seo.mts     14 catalogue invariants
```

### Routing

`src/app/[slug]/page.tsx` serves every variation. Next.js resolves static
segments before dynamic ones, so `/merge-pdf` and `/about` keep their own route
files and are never shadowed. `dynamicParams = false` means a slug outside the
catalogue returns a real 404 rather than rendering an empty page.

### Bundle

The whole point of one template is one client chunk. All 243 landing pages share
the `/[slug]` build output, and page-specific JS is ~144 bytes each. The heavy
libraries — pdf-lib, pdf.js, xlsx, jsPDF, mammoth, html2canvas — are behind
dynamic imports in `runners.ts`, so a page only downloads the library its tool
needs, and only when the user actually presses the button.

All page copy is rendered by React Server Components. Only `ToolWorkspace` and
its children ship to the browser.

---

## SEO output per page

| | |
|---|---|
| Title | Unique, ≤ 70 characters |
| Meta description | Unique, ≤ 160 characters |
| Canonical | Self-referencing — each page targets its own long-tail phrase |
| Open Graph | type, title, description, url, siteName, image, locale |
| Twitter | `summary_large_image` |
| JSON-LD | BreadcrumbList, SoftwareApplication + WebApplication, HowTo, FAQPage |
| Site-wide JSON-LD | WebSite and Organization, from the layout |
| Word count | 1,113–1,997, averaging 1,677 |
| Internal links | Parent tool, 4 related tools, 6 rotating sibling variations, home, help, privacy |

Sibling links use a **rotating window** rather than a fixed one. A fixed window
would leave every variation past the first few with no inbound links at all;
rotating gives each page at least 6 inbound links, so the whole set is reachable
by crawling and not only via the sitemap. `npm run verify:seo` asserts this.

Structured data is generated from the same objects the page renders, so the
markup cannot drift out of sync with the visible content.

---

## Analytics

[`src/analytics/track.ts`](../src/analytics/track.ts) pushes to `window.dataLayer`
and forwards to `gtag` when present. With no analytics installed it is a no-op —
it can never break a page.

Events: `upload_started`, `upload_completed`, `upload_rejected`,
`processing_started`, `processing_completed`, `processing_failed`,
`processing_cancelled`, `processing_retried`, `download_clicked`,
`download_all_clicked`, `tool_reset`.

Every event carries `tool`, `page` and `variation`, so landing-page conversion
can be compared against the parent tool page. Payloads never include file names
or file contents.

---

## Accessibility

- The dropzone is a real control: `role="button"`, keyboard-reachable, responds
  to Enter and Space, with an `aria-describedby` hint. The underlying
  `<input type="file">` stays in the DOM, visually hidden.
- Progress and status live in an `aria-live="polite"` region.
- Options are a `<fieldset>` with labels bound by `htmlFor`, and `aria-describedby`
  wiring help text to its control.
- File list is an `<ol>` so the processing order is announced; every icon-only
  button has an `aria-label` naming its file.
- Breadcrumbs use `<nav aria-label="Breadcrumb">` with `aria-current="page"`.
- FAQs are a `<dl>`; steps are an `<ol>`; one `<h1>` per page with an ordered
  heading hierarchy below it.

---

## Verification

```bash
npm run verify         # both suites — 52 assertions
npm run verify:engine  # 38 engine assertions against generated PDFs
npm run verify:seo     # 14 catalogue invariants
npm run build          # prerenders all 284 routes
```

`verify:seo` is the one to run after editing `variations.ts`. It fails the build
on duplicate titles, descriptions, H1s or slugs; any page under 1,000 words;
titles over 70 or descriptions over 160 characters; orphan pages; broken internal
links; and any local-only variation leaking onto a server-side tool.

`verify:engine` covers the parts of the engine that run in Node — page range
parsing, merge ordering and cumulative rotation, split modes, watermark and
signature placement, character sanitising, and image-to-PDF layout including
recovery from mislabelled file extensions. The pdf.js paths (image conversion and
compression) need a browser and are not covered here.
