import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "../blog/posts";
import { INDEXABLE_STATIC_PATHS, SITE_URL } from "../seo/config";
import { getCanonicalLandingPages } from "../seo/landing/generate";

function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

/** Only canonical, useful and indexable URLs belong in the sitemap. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = INDEXABLE_STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
  }));

  const toolEntries = getCanonicalLandingPages().map((page) => ({
    url: absoluteUrl(page.path),
  }));

  const blogEntries = BLOG_POSTS.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: new Date(`${post.updatedAt ?? post.publishedAt}T00:00:00.000Z`),
  }));

  return [...staticEntries, ...toolEntries, ...blogEntries];
}
