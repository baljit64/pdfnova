import type { MetadataRoute } from "next";
import { SITE_URL } from "../seo/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Login stays crawlable so search engines can read its noindex directive.
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
