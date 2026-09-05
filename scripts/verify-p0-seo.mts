import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { BLOG_POSTS } from "../src/blog/posts";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";
import { ADSENSE_METADATA } from "../src/seo/adsense";
import { BRAND_ASSETS, ROUTE_META, SITE_URL } from "../src/seo/config";
import { getAllLandingPages } from "../src/seo/landing/generate";
import { LEGACY_TOOL_REDIRECTS } from "../src/seo/legacyRedirects";
import { buildLandingMetadata, buildMetadata } from "../src/seo/nextMetadata";

type RobotsValue = { index?: boolean; follow?: boolean } | string | null | undefined;

function robotsValue(value: unknown): RobotsValue {
  return (value as { robots?: RobotsValue }).robots;
}

function isNoIndex(value: RobotsValue): boolean {
  return typeof value === "object" && value !== null && value.index === false && value.follow === true;
}

const checks: Array<[string, () => void | Promise<void>]> = [
  ["publishes the authorized AdSense seller record", async () => {
    const adsTxt = await readFile(new URL("../public/ads.txt", import.meta.url), "utf8");
    assert.equal(
      adsTxt.trim(),
      "google.com, pub-6001922368771371, DIRECT, f08c47fec0942fa0",
    );
  }],
  ["publishes the Google AdSense account metadata", () => {
    assert.deepEqual(ADSENSE_METADATA, {
      "google-adsense-account": "ca-pub-6001922368771371",
    });
  }],
  ["loads the configured Google Analytics tag and discloses analytics use", async () => {
    const [layout, privacy] = await Promise.all([
      readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/views/Privacy.tsx", import.meta.url), "utf8"),
    ]);

    assert.match(layout, /G-CR1LR4LDL9/);
    assert.match(layout, /googletagmanager\.com\/gtag\/js/);
    assert.match(layout, /gtag\('config', '\$\{GOOGLE_ANALYTICS_ID\}'\)/);
    assert.match(privacy, /Google Analytics/);
    assert.doesNotMatch(privacy, /does not currently include Google Analytics/);
  }],
  ["uses the preferred production origin", () => {
    assert.equal(SITE_URL, "https://www.pdfnova.in");
  }],
  ["keeps static titles and descriptions unique and free of absolute security claims", () => {
    const entries = Object.values(ROUTE_META);
    assert.equal(new Set(entries.map((entry) => entry.title)).size, entries.length);
    assert.equal(new Set(entries.map((entry) => entry.description)).size, entries.length);
    assert.equal(entries.some((entry) => /100% secure/i.test(entry.description)), false);
  }],
  ["marks auth entry pages and unfinished tools noindex, follow", () => {
    for (const path of ["/login", "/signup", "/pdf-to-excel", "/pdf-to-powerpoint", "/powerpoint-to-pdf"]) {
      assert.equal(isNoIndex(robotsValue(buildMetadata(path))), true, path);
    }
  }],
  ["keeps canonical working tools indexable", () => {
    for (const page of getAllLandingPages()) {
      assert.equal(isNoIndex(robotsValue(buildLandingMetadata(page))), false, page.path);
    }
  }],
  ["sitemap contains canonical functional pages and blog posts only", () => {
    const urls = sitemap().map((entry) => entry.url);
    const expectedToolUrls = getAllLandingPages()
      .filter((page) => page.isCanonical)
      .map((page) => `${SITE_URL}${page.path}`);
    const expectedBlogUrls = BLOG_POSTS.map((post) => `${SITE_URL}/blog/${post.slug}`);

    for (const url of [...expectedToolUrls, ...expectedBlogUrls]) assert.ok(urls.includes(url), url);
    assert.equal(urls.some((url) => LEGACY_TOOL_REDIRECTS.some((redirect) => url === `${SITE_URL}/${redirect.slug}`)), false);
    for (const path of ["/login", "/signup", "/pdf-to-excel", "/pdf-to-powerpoint", "/powerpoint-to-pdf"]) {
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
    const [home, converter, toolCard] = await Promise.all([
      readFile(new URL("../src/views/Home/index.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/views/ConvertPDF.tsx", import.meta.url), "utf8"),
      readFile(new URL("../src/components/tools/ToolCard.tsx", import.meta.url), "utf8"),
    ]);
    assert.equal(home.includes("router.push"), false);
    assert.equal(converter.includes("router.push"), false);
    assert.match(home, /<ToolCard/);
    assert.match(converter, /<ToolCard/);
    assert.match(toolCard, /<Link href=\{href\}/);
    assert.match(home, /href=\{`\/\$\{tool\.id\}`\}/);
    assert.match(converter, /href=\{`\/\$\{tool\.id\}`\}/);
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
  ["keeps example credentials empty and trust links genuine", async () => {
    const [environment, footer] = await Promise.all([
      readFile(new URL("../.env.example", import.meta.url), "utf8"),
      readFile(new URL("../src/components/Footer.tsx", import.meta.url), "utf8"),
    ]);

    for (const key of [
      "GOOGLE_SITE_VERIFICATION",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "CLOUDCONVERT_API_KEY",
      "CONTACT_FORM_ENDPOINT",
    ]) {
      assert.match(environment, new RegExp(`^${key}=\\s*$`, "m"), key);
    }
    assert.doesNotMatch(footer, /https:\/\/(facebook|twitter|youtube)\.com/);
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
