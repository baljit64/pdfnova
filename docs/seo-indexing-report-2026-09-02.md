# PDFNova indexing report — 2 September 2026

## Executive summary

Google Search Console reports exactly **17 URLs** as **“Discovered – currently not indexed.”** Every exported row has `Last crawled = 1970-01-01`, which is a missing/never-crawled timestamp rather than a real crawl date. Google has discovered these URLs but has not yet fetched them.

The **Coming Soon label is not the cause**. None of PDFNova's three Coming Soon routes appears among the 17 affected URLs. Those unfinished routes are intentionally marked `noindex, follow` and excluded from the sitemap:

- `/pdf-to-excel`
- `/pdf-to-powerpoint`
- `/powerpoint-to-pdf`

The most likely explanation is crawl scheduling for a new or recently changed site. Search Console first recorded all 17 affected pages on **28 August 2026**, only five days before this export. A sitemap helps discovery but does not guarantee crawling or indexing.

## Implementation status

Technical remediation is **implemented and live as of 2 September 2026**:

- All 17 affected URLs return HTTP `200` with `index, follow`.
- Every affected URL has one self-referencing canonical and one H1.
- The sitemap contains exactly 33 canonical, indexable URLs.
- The three unfinished Coming Soon routes emit `noindex, follow` and are absent from the sitemap.
- All 13 functional tools have normal crawlable links from the homepage.
- 240 legacy keyword-variation URLs permanently redirect to their canonical tool pages.
- `robots.txt` permits public crawling and references the canonical sitemap.

The remaining work is in Google Search Console: resubmit the sitemap, request indexing for the priority URLs, start **Validate fix**, and allow Google time to recrawl. Those external actions cannot be performed from the repository.

## Affected URLs

### Blog pages (6)

| URL | Last crawled |
| --- | --- |
| `/blog` | Never recorded |
| `/blog/add-watermark-to-pdf-professionally` | Never recorded |
| `/blog/are-online-pdf-tools-safe` | Never recorded |
| `/blog/convert-pdf-to-word-without-formatting-problems` | Never recorded |
| `/blog/merge-pdf-files-in-the-right-order` | Never recorded |
| `/blog/split-pdf-and-extract-pages` | Never recorded |

### Tool and static pages (11)

| URL | Last crawled |
| --- | --- |
| `/compress-pdf` | Never recorded |
| `/contact` | Never recorded |
| `/edit-pdf` | Never recorded |
| `/excel-to-pdf` | Never recorded |
| `/jpg-to-pdf` | Never recorded |
| `/pdf-to-image` | Never recorded |
| `/pdf-to-jpg` | Never recorded |
| `/rotate-pdf` | Never recorded |
| `/sign-pdf` | Never recorded |
| `/split-pdf` | Never recorded |
| `/word-to-pdf` | Never recorded |

## Diagnosis

The export identifies a **crawl-prioritization state**, not a penalty or an indexing rejection following a crawl:

- Google has discovered the URLs.
- Search Console has no recorded crawl date for any of them.
- The affected list contains no Coming Soon URL.
- The live affected pages return HTTP `200`, permit indexing, and use self-referencing canonicals.
- The live `robots.txt` permits public crawling and references the sitemap.

Two factors may have slowed progress:

1. **Recency:** all affected URLs entered this report on 28 August 2026. Google says crawling can take from a few days to a few weeks and that submitting a sitemap or crawl request does not guarantee inclusion.
2. **Previous legacy URL expansion:** an earlier production version exposed many generated keyword-variation URLs. The deployed implementation now permanently redirects those URLs to a smaller set of canonical tools, but Google still needs time to observe and process the cleanup.

## Recommended actions

1. ~~Deploy the SEO changes.~~ **Completed and verified live on 2 September 2026.**
2. ~~Verify the 17 affected pages return `200`, `index, follow`, and the intended self-canonical URL.~~ **Completed.**
3. Resubmit `https://www.pdfnova.in/sitemap.xml` in Search Console.
4. Use URL Inspection and **Request indexing** for a small priority group: `/compress-pdf`, `/split-pdf`, `/jpg-to-pdf`, `/pdf-to-jpg`, `/word-to-pdf`, and `/blog`.
5. Start **Validate fix** for the “Discovered – currently not indexed” issue.
6. Allow several days to a few weeks. If these URLs still show no crawl date after two to three weeks, review Search Console Crawl Stats, server access logs for Googlebot, internal-link depth, and external discovery signals.
7. Keep the three unfinished Coming Soon routes out of the sitemap and `noindex` until their tools are functional and contain useful indexable content.

## Sources

- Google Search Central, [Crawling and indexing FAQ](https://developers.google.com/search/help/crawling-index-faq)
- Google Search Central, [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- Google Search Central, [Ask Google to recrawl your URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- Google Search Central, [Technical requirements](https://developers.google.com/search/docs/essentials/technical)

## Evidence reviewed

- Search Console export: `pdfnova.in-Coverage-Drilldown-2026-09-02.zip`
- Exported issue: `Discovered – currently not indexed`
- Exported affected-pages date: `2026-08-28`
- Exported URL count: `17`
- Live sitemap, robots directives, HTTP responses, canonical tags, and page-level robots metadata reviewed on 2 September 2026
