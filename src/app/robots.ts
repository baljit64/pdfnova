import type { MetadataRoute } from "next";
import { SITE_URL } from "../seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing here is worth a crawl budget: no content, and the API is POST-only.
        // Login stays crawlable so search engines can read its noindex directive.
        disallow: "/api/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
