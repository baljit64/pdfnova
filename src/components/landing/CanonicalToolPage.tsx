/**
 * Wiring for the parent tool routes (/merge-pdf, /compress-pdf, …).
 *
 * Each working tool route resolves its centralized SEO copy and renders the
 * shared server template with the shared tool workspace.
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
