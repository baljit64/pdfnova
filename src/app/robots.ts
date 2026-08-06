import type { MetadataRoute } from "next";
import { SITE_URL } from "../seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing here is worth a crawl budget: no content, and the API is POST-only.
        disallow: ["/api/", "/login"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
