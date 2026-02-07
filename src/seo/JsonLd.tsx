import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL, ROUTE_META } from "./config";

/**
 * Injects JSON-LD for WebSite and (on homepage) Organization.
 * Helps search engines understand the site and tools (SoftwareApplication).
 */
export default function JsonLd() {
  const { pathname } = useLocation();

  useEffect(() => {
    const path = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    const meta = ROUTE_META[path];

    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "PDFNova",
      url: SITE_URL,
      description:
        "Free online PDF tools: merge, split, compress, convert PDF to Word, Excel, JPG. Add watermark, sign PDF. No signup. 100% secure.",
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    };

    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PDFNova",
      url: SITE_URL,
      description: "Free PDF tools online – merge, split, compress, convert PDFs.",
      founder: { "@type": "Person", name: "Baljit Singh" },
    };

    const removeExisting = () => {
      document.querySelectorAll('script[type="application/ld+json"][data-seo-jsonld]').forEach((el) => el.remove());
    };

    removeExisting();

    const scripts: object[] = [websiteSchema];
    if (path === "" || path === "/") {
      scripts.push(organizationSchema);
    }

    if (meta) {
      const toolSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: meta.title.split("|")[0].trim(),
        description: meta.description,
        applicationCategory: "UtilitiesApplication",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        url: `${SITE_URL}${path || "/"}`,
      };
      scripts.push(toolSchema);
    }

    scripts.forEach((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo-jsonld", "true");
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });

    return removeExisting;
  }, [pathname]);

  return null;
}
