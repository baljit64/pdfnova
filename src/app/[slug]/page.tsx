/**
 * The single route behind every SEO landing page.
 *
 * `generateStaticParams` enumerates the generated catalogue, so all of them are
 * prerendered at build time. `dynamicParams = false` means anything not in the
 * catalogue still returns a real 404 rather than being served by this route.
 *
 * Existing static routes such as /merge-pdf and /about take precedence over this
 * dynamic segment, so nothing here shadows them.
 */
import { notFound } from "next/navigation";
import LandingPageView from "../../components/landing/LandingPageView";
import { getLandingPage, getVariationLandingPages } from "../../seo/landing/generate";
import { buildLandingMetadata } from "../../seo/nextMetadata";
import type { Metadata } from "next";

export const dynamicParams = false;

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams(): { slug: string }[] {
  return getVariationLandingPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};
  return buildLandingMetadata(page);
}

export default async function Page({ params }: RouteParams) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  return <LandingPageView page={page} />;
}
