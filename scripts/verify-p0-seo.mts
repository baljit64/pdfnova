import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BLOG_POSTS } from "../src/blog/posts";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import { BRAND_ASSETS, ROUTE_META, SITE_URL } from "../src/seo/config";
import { getAllLandingPages, getVariationLandingPages } from "../src/seo/landing/generate";
import { buildLandingMetadata, buildMetadata } from "../src/seo/nextMetadata";

type RobotsValue = { index?: boolean; follow?: boolean } | string | null | undefined;

function robotsValue(value: unknown): RobotsValue {
  return (value as { robots?: RobotsValue }).robots;
}

function isNoIndex(value: RobotsValue): boolean {
  return typeof value === "object" && value !== null && value.index === false && value.follow === true;
}

const checks: Array<[string, () => void | Promise<void>]> = [
  ["uses the preferred production origin", () => {
    assert.equal(SITE_URL, "https://www.pdfnova.in");
  }],
  ["keeps static titles and descriptions unique and free of absolute security claims", () => {
    const entries = Object.values(ROUTE_META);
    assert.equal(new Set(entries.map((entry) => entry.title)).size, entries.length);
    assert.equal(new Set(entries.map((entry) => entry.description)).size, entries.length);
    assert.equal(entries.some((entry) => /100% secure/i.test(entry.description)), false);
  }],
  ["marks login and unfinished tools noindex, follow", () => {
    for (const path of ["/login", "/pdf-to-excel", "/pdf-to-powerpoint", "/powerpoint-to-pdf"]) {
      assert.equal(isNoIndex(robotsValue(buildMetadata(path))), true, path);
    }
  }],
  ["marks generated variation pages noindex, follow", () => {
    const variation = getVariationLandingPages()[0];
    assert.ok(variation);
    assert.equal(isNoIndex(robotsValue(buildLandingMetadata(variation))), true);
  }],
  ["sitemap contains canonical functional pages and blog posts only", () => {
    const urls = sitemap().map((entry) => entry.url);
    const expectedToolUrls = getAllLandingPages()
      .filter((page) => page.isCanonical)
      .map((page) => `${SITE_URL}${page.path}`);
    const expectedBlogUrls = BLOG_POSTS.map((post) => `${SITE_URL}/blog/${post.slug}`);

    for (const url of [...expectedToolUrls, ...expectedBlogUrls]) assert.ok(urls.includes(url), url);
    assert.equal(urls.some((url) => getVariationLandingPages().some((page) => url === `${SITE_URL}${page.path}`)), false);
    for (const path of ["/login", "/pdf-to-excel", "/pdf-to-powerpoint", "/powerpoint-to-pdf"]) {
      assert.equal(urls.includes(`${SITE_URL}${path}`), false, path);
    }
    assert.ok(urls.includes(`${SITE_URL}/`));
    assert.equal(new Set(urls).size, urls.length);
    assert.equal(urls.every((url) => url.startsWith(`${SITE_URL}/`)), true);
    assert.equal(urls.some((url) => url.includes("pdfnova.com")), false);
    assert.equal(urls.some((url) => url.startsWith("https://pdfnova.in")), false);
  }],
  ["robots allows public pages and points to the preferred sitemap", () => {
    const value = robots();
    assert.equal(value.sitemap, `${SITE_URL}/sitemap.xml`);
    assert.equal(value.host, SITE_URL);
    assert.deepEqual(value.rules, [{ userAgent: "*", allow: "/", disallow: "/api/" }]);
  }],
  ["homepage and converter expose normal crawlable links", async () => {
    const [home, converter] = await Promise.all([
      readFile(new URL("../src/views/Home/index.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/views/ConvertPDF.tsx", import.meta.url), "utf8"),
    ]);
    assert.equal(home.includes("router.push"), false);
    assert.equal(converter.includes("router.push"), false);
    assert.match(converter, /^\s*["']use client["'];/);
    assert.match(home, /<Link\s+href=\{tool\.path\}/);
    assert.match(converter, /<Link href="\/pdf-to-image"/);
  }],
  ["registers brand logo, favicons and installable app icons", async () => {
    const [navbar, layout, schema, manifest] = await Promise.all([
      readFile(new URL("../src/components/Navbar.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/seo/schema.ts", import.meta.url), "utf8"),
      readFile(new URL("../src/app/manifest.ts", import.meta.url), "utf8"),
    ]);
    assert.match(navbar, /pdf-nova-logo-horizontal\.png/);
    for (const asset of [
      "favicon.ico",
      "favicon-16x16.png",
      "favicon-32x32.png",
      "favicon-48x48.png",
      "apple-touch-icon.png",
    ]) assert.match(layout, new RegExp(asset.replace(".", "\\.")));
    assert.match(layout, /manifest\.webmanifest/);
    assert.match(manifest, /android-chrome-192x192\.png/);
    assert.match(manifest, /android-chrome-512x512\.png/);
    assert.match(schema, /BRAND_ASSETS\.appIcon/);
    assert.equal(BRAND_ASSETS.appIcon, `${SITE_URL}/assets/pdf-nova-app-icon-light.png`);
  }],
];

let failures = 0;
for (const [name, check] of checks) {
  try {
    await check();
    console.log(`ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`not ok - ${name}`);
    console.error(error instanceof Error ? error.message : error);
  }
}

if (failures > 0) {
  console.error(`\n${failures} P0 SEO check(s) failed.`);
  process.exit(1);
}

console.log(`\n${checks.length} P0 SEO checks passed.`);
