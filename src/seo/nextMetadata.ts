import type { Metadata } from "next";
import { BRAND_ASSETS, SITE_URL, ROUTE_META } from "./config";
import type { LandingPage } from "./landing/types";

const OG_IMAGE = BRAND_ASSETS.socialImage;

export function buildMetadata(path: string): Metadata {
  const meta = ROUTE_META[path];
  if (!meta) throw new Error(`Missing SEO configuration for ${path}`);

  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    robots: { index: meta.indexable, follow: true },
    openGraph: {
      type: "website",
      title: meta.title,
      description: meta.description,
      url,
      siteName: "PDFNova",
      images: [{ url: OG_IMAGE }],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [OG_IMAGE],
    },
    metadataBase: new URL(SITE_URL),
  };
}

/** Metadata for canonical tool pages and their preserved variation routes. */
export function buildLandingMetadata(page: LandingPage): Metadata {
  const url = `${SITE_URL}${page.path}`;

  return {
    title: page.title,
    description: page.description,
    keywords: [page.targetKeyword],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title: page.title,
      description: page.description,
      url,
      siteName: "PDFNova",
      images: [{ url: OG_IMAGE, alt: page.h1 }],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [OG_IMAGE],
    },
    // Variation routes remain usable and crawlable, but P0 indexing is limited
    // to the canonical functional tool page for each tool.
    robots: { index: page.isCanonical, follow: true },
    metadataBase: new URL(SITE_URL),
  };
}
