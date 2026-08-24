import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import net from "node:net";
import { BLOG_POSTS } from "../src/blog/posts";
import { INDEXABLE_STATIC_PATHS, ROUTE_META, SITE_URL } from "../src/seo/config";
import {
  getCanonicalLandingPages,
  getVariationLandingPages,
} from "../src/seo/landing/generate";

interface PageExpectation {
  path: string;
  title: string;
  description: string;
  canonical: string;
}

function reservePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not reserve a local port."));
        return;
      }
      server.close((error) => (error ? reject(error) : resolve(address.port)));
    });
  });
}

function absoluteUrl(path: string): string {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

function tags(html: string, name: string): string[] {
  return html.match(new RegExp(`<${name}\\b[^>]*>`, "gi")) ?? [];
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: "&",
    quot: '"',
    apos: "'",
    lt: "<",
    gt: ">",
  };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (_, entity: string) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    return named[entity.toLowerCase()] ?? `&${entity};`;
  });
}

function attribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"));
  return match ? decodeHtml(match[1]) : undefined;
}

function metaContent(html: string, name: string): string[] {
  return tags(html, "meta")
    .filter((tag) => attribute(tag, "name")?.toLowerCase() === name.toLowerCase())
    .map((tag) => attribute(tag, "content") ?? "");
}

function metaPropertyContent(html: string, property: string): string[] {
  return tags(html, "meta")
    .filter((tag) => attribute(tag, "property")?.toLowerCase() === property.toLowerCase())
    .map((tag) => attribute(tag, "content") ?? "");
}

function jsonLdTypes(html: string): string[] {
  const values: string[] = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)) {
    const parsed = JSON.parse(decodeHtml(match[1])) as Record<string, unknown> | Record<string, unknown>[];
    for (const schema of Array.isArray(parsed) ? parsed : [parsed]) {
      const type = schema["@type"];
      if (Array.isArray(type)) values.push(...type.map(String));
      else if (type) values.push(String(type));
    }
  }
  return values;
}

function canonicalHrefs(html: string): string[] {
  return tags(html, "link")
    .filter((tag) => attribute(tag, "rel")?.toLowerCase() === "canonical")
    .map((tag) => attribute(tag, "href") ?? "");
}

function titleContents(html: string): string[] {
  return [...html.matchAll(/<title>(.*?)<\/title>/gis)].map((match) => decodeHtml(match[1]));
}

async function waitForServer(origin: string): Promise<void> {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(origin, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // The process is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the production server.");
}

async function mapInBatches<T>(items: T[], size: number, run: (item: T) => Promise<void>) {
  for (let index = 0; index < items.length; index += size) {
    await Promise.all(items.slice(index, index + size).map(run));
  }
}

function requestWithHost(port: number, path: string, host: string): Promise<http.IncomingMessage> {
  return new Promise((resolve, reject) => {
    const request = http.get(
      { hostname: "127.0.0.1", port, path, headers: { host } },
      (response) => resolve(response)
    );
    request.once("error", reject);
  });
}

const canonicalTools = getCanonicalLandingPages();
const indexablePages: PageExpectation[] = [
  ...INDEXABLE_STATIC_PATHS.map((path) => ({
    path,
    title: ROUTE_META[path].title,
    description: ROUTE_META[path].description,
    // Next.js serializes the root canonical origin without its optional slash.
    canonical: path === "/" ? SITE_URL : absoluteUrl(path),
  })),
  ...canonicalTools.map((page) => ({
    path: page.path,
    title: page.title,
    description: page.description,
    canonical: absoluteUrl(page.path),
  })),
  ...BLOG_POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    title: `${post.title} | PDFNova`,
    description: post.excerpt,
    canonical: absoluteUrl(`/blog/${post.slug}`),
  })),
];

assert.equal(new Set(indexablePages.map((page) => page.path)).size, indexablePages.length);
assert.equal(new Set(indexablePages.map((page) => page.title)).size, indexablePages.length);
assert.equal(new Set(indexablePages.map((page) => page.description)).size, indexablePages.length);

const noindexPaths = [
  "/login",
  "/pdf-to-excel",
  "/pdf-to-powerpoint",
  "/powerpoint-to-pdf",
  ...getVariationLandingPages().map((page) => page.path),
];

const port = await reservePort();
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  cwd: process.cwd(),
  env: process.env,
  stdio: ["ignore", "pipe", "pipe"],
});

let serverError = "";
const renderedHtml = new Map<string, string>();
server.stderr.on("data", (chunk) => {
  serverError += String(chunk);
});

try {
  await waitForServer(origin);

  await mapInBatches(indexablePages, 12, async (page) => {
    const response = await fetch(`${origin}${page.path}`);
    assert.equal(response.status, 200, page.path);
    const html = await response.text();
    renderedHtml.set(page.path, html);

    assert.deepEqual(titleContents(html), [page.title], `${page.path}: title`);
    assert.deepEqual(metaContent(html, "description"), [page.description], `${page.path}: description`);
    assert.deepEqual(canonicalHrefs(html), [page.canonical], `${page.path}: canonical`);
    assert.equal(tags(html, "h1").length, 1, `${page.path}: H1 count`);
    assert.equal(metaContent(html, "robots").some((value) => /noindex/i.test(value)), false, `${page.path}: robots`);
  });
  console.log(`ok - ${indexablePages.length} indexable pages have unique metadata, one canonical and one H1`);

  await mapInBatches(noindexPaths, 12, async (path) => {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    renderedHtml.set(path, html);
    assert.equal(metaContent(html, "robots").some((value) => /noindex/i.test(value) && /follow/i.test(value)), true, path);
  });
  console.log(`ok - ${noindexPaths.length} preserved non-SEO routes emit noindex, follow`);

  const representativePaths = [
    "/",
    "/merge-pdf",
    "/compress-pdf",
    "/blog",
    `/blog/${BLOG_POSTS[0].slug}`,
  ];
  for (const path of representativePaths) {
    const html = renderedHtml.get(path);
    assert.ok(html, path);
    assert.equal(metaPropertyContent(html, "og:title").length, 1, `${path}: og:title`);
    assert.deepEqual(
      metaPropertyContent(html, "og:url"),
      [path === "/" ? SITE_URL : absoluteUrl(path)],
      `${path}: og:url`
    );
    assert.deepEqual(metaContent(html, "twitter:card"), ["summary_large_image"], `${path}: twitter:card`);
    assert.match(html, /https:\/\/www\.pdfnova\.in/);
    assert.doesNotMatch(html, /https?:\/\/(?:www\.)?pdfnova\.com|https?:\/\/[^"'\s]*vercel\.app/);
  }

  const homeSchemaTypes = jsonLdTypes(renderedHtml.get("/") ?? "");
  assert.ok(homeSchemaTypes.includes("Organization"));
  assert.ok(homeSchemaTypes.includes("WebSite"));
  const toolSchemaTypes = jsonLdTypes(renderedHtml.get("/merge-pdf") ?? "");
  for (const type of ["BreadcrumbList", "SoftwareApplication", "WebApplication", "HowTo", "FAQPage"])
    assert.ok(toolSchemaTypes.includes(type), type);
  assert.ok(jsonLdTypes(renderedHtml.get(`/blog/${BLOG_POSTS[0].slug}`) ?? "").includes("BlogPosting"));
  assert.match(
    renderedHtml.get("/merge-pdf") ?? "",
    /href=["']\/blog\/merge-pdf-files-in-the-right-order["']/
  );
  console.log("ok - representative pages emit Open Graph, Twitter, JSON-LD and contextual guide links");

  const knownPagePaths = new Set([...indexablePages.map((page) => page.path), ...noindexPaths]);
  for (const [sourcePath, html] of renderedHtml) {
    for (const tag of tags(html, "a")) {
      const href = attribute(tag, "href");
      if (!href?.startsWith("/") || href.startsWith("//")) continue;
      const linkedPath = new URL(href, SITE_URL).pathname.replace(/\/$/, "") || "/";
      assert.ok(knownPagePaths.has(linkedPath), `${sourcePath} links to missing ${linkedPath}`);
    }
  }
  console.log(`ok - internal anchors from ${renderedHtml.size} rendered pages target known routes`);

  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemapXml = await sitemapResponse.text();
  const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(new Set(sitemapUrls), new Set(indexablePages.map((page) => absoluteUrl(page.path))));
  assert.equal(sitemapUrls.length, indexablePages.length);
  console.log(`ok - sitemap contains exactly ${sitemapUrls.length} canonical indexable URLs`);

  const robotsResponse = await fetch(`${origin}/robots.txt`);
  assert.equal(robotsResponse.status, 200);
  const robotsText = await robotsResponse.text();
  assert.match(robotsText, /User-Agent: \*/i);
  assert.match(robotsText, /Allow: \//i);
  assert.match(robotsText, new RegExp(`Sitemap: ${SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/sitemap\\.xml`));
  assert.doesNotMatch(robotsText, /Disallow: \/login/i);
  console.log("ok - robots.txt allows public crawling and references the canonical sitemap");

  const homeHtml = await (await fetch(origin)).text();
  const homeHrefs = new Set(tags(homeHtml, "a").map((tag) => attribute(tag, "href")));
  for (const tool of canonicalTools) assert.ok(homeHrefs.has(tool.path), tool.path);
  console.log(`ok - homepage links to all ${canonicalTools.length} functional tools with anchors`);

  const headLinks = tags(homeHtml, "link").map((tag) => ({
    rel: attribute(tag, "rel"),
    href: attribute(tag, "href"),
  }));
  for (const href of [
    "/assets/favicon.ico",
    "/assets/favicon-16x16.png",
    "/assets/favicon-32x32.png",
    "/assets/favicon-48x48.png",
    "/assets/apple-touch-icon.png",
  ]) assert.ok(headLinks.some((link) => link.href === href), href);
  assert.ok(headLinks.some((link) => link.rel === "manifest" && link.href === "/manifest.webmanifest"));
  assert.ok(tags(homeHtml, "img").some((tag) => attribute(tag, "alt") === "PDFNova"));
  assert.ok(homeHtml.includes(`${SITE_URL}/assets/pdf-nova-app-icon-light.png`));

  const manifestResponse = await fetch(`${origin}/manifest.webmanifest`);
  assert.equal(manifestResponse.status, 200);
  const manifest = await manifestResponse.json() as { icons?: Array<{ src?: string }> };
  assert.deepEqual(
    manifest.icons?.map((icon) => icon.src),
    ["/assets/android-chrome-192x192.png", "/assets/android-chrome-512x512.png"]
  );
  console.log("ok - logo, favicons, Apple touch icon and Android manifest icons are rendered");

  for (const path of ["/random-nonexistent-page", "/abc123", "/does-not-exist"]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 404, path);
  }
  console.log("ok - invalid routes return HTTP 404");

  const redirectResponse = await requestWithHost(port, "/merge-pdf", "pdfnova.in");
  assert.equal(redirectResponse.statusCode, 308);
  assert.equal(redirectResponse.headers.location, `${SITE_URL}/merge-pdf`);
  redirectResponse.resume();
  console.log("ok - non-www host redirects directly to the preferred HTTPS origin");

  if (process.env.GOOGLE_SITE_VERIFICATION) {
    assert.deepEqual(metaContent(homeHtml, "google-site-verification"), [process.env.GOOGLE_SITE_VERIFICATION]);
    console.log("ok - Google Search Console verification metadata is present");
  } else {
    console.log("ok - Google Search Console verification hook is ready (set GOOGLE_SITE_VERIFICATION)");
  }
} catch (error) {
  if (serverError) console.error(serverError);
  throw error;
} finally {
  server.kill("SIGTERM");
}
