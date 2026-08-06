/**
 * Wiring for the parent tool routes (/merge-pdf, /compress-pdf, …).
 *
 * These render exactly the same template as the generated landing pages, using
 * the canonical page from the generator — so the parent route and every
 * variation share one implementation and one tool.
 */
import { notFound } from "next/navigation";
import LandingPageView from "./LandingPageView";
import { getLandingPage } from "../../seo/landing/generate";
import { buildLandingMetadata } from "../../seo/nextMetadata";
import type { Metadata } from "next";

/** Metadata for a parent tool route. Call at module scope in the route file. */
export function canonicalMetadata(slug: string): Metadata {
  const page = getLandingPage(slug);
  return page ? buildLandingMetadata(page) : {};
}

export default function CanonicalToolPage({ slug }: { slug: string }) {
  const page = getLandingPage(slug);
  if (!page) notFound();

  return <LandingPageView page={page} />;
}
