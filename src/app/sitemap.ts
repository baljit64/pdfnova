/**
 * Sitemap, generated from the landing page catalogue.
 *
 * Adding a variation in `variations.ts` puts its pages in here automatically —
 * there is no list to keep in sync by hand.
 */
import type { MetadataRoute } from "next";
import { SITE_URL } from "../seo/config";
import { getAllLandingPages } from "../seo/landing/generate";
import { TOOLS } from "../tools/registry";

/** Pages that are not tool pages but still belong in the sitemap. */
const STATIC_PATHS: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" },
  { path: "/convert-pdf", priority: 0.7, changeFrequency: "monthly" },
  { path: "/help", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.5, changeFrequency: "yearly" },
  { path: "/contact", priority: 0.5, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.4, changeFrequency: "yearly" },
];

/** Tools that are not shipped yet still have a route, but rank for nothing. */
const COMING_SOON_PATHS = ["/pdf-to-excel", "/pdf-to-powerpoint", "/powerpoint-to-pdf"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries = STATIC_PATHS.map((entry) => ({
    url: `${SITE_URL}${entry.path === "/" ? "" : entry.path}`,
    lastModified,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));

  const toolEntries = getAllLandingPages().map((page) => ({
    url: `${SITE_URL}${page.path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    // Parent tool pages outrank their variations in our own priority signal.
    priority: page.isCanonical ? 0.9 : 0.6,
  }));

  const comingSoonEntries = COMING_SOON_PATHS.filter(
    (path) => !TOOLS[path.slice(1) as keyof typeof TOOLS]?.available
  ).map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.3,
  }));

  return [...staticEntries, ...toolEntries, ...comingSoonEntries];
}
