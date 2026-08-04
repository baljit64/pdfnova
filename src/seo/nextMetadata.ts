import type { Metadata } from "next";
import { SITE_URL, DEFAULT_DESCRIPTION, DEFAULT_TITLE, ROUTE_META } from "./config";

const OG_IMAGE = `${SITE_URL}/assets/hero.png`;

export function buildMetadata(path: string): Metadata {
  const meta = ROUTE_META[path] ?? {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  };

  const url = `${SITE_URL}${path === "/" ? "" : path}`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
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
