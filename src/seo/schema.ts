/**
 * Structured data builders.
 *
 * Every landing page emits Breadcrumb, FAQ, SoftwareApplication/WebApplication
 * and HowTo markup, generated from the same content the page renders — so the
 * markup can never drift out of sync with what a visitor actually sees.
 */
import { BRAND_ASSETS, HOME_URL, SITE_URL } from "./config";
import type { LandingPage } from "./landing/types";
import type { ToolDefinition } from "../tools/types";

type Schema = Record<string, unknown>;

export function websiteSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "PDFNova",
    url: HOME_URL,
    description:
      "Online tools to merge, split, compress, rotate, watermark, sign and convert PDF files.",
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function organizationSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "PDFNova",
    url: HOME_URL,
    logo: BRAND_ASSETS.appIcon,
    description: "Online PDF tools for merging, splitting, compressing and converting documents.",
  };
}

export function breadcrumbSchema(page: LandingPage): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumbs.map((crumb, position) => ({
      "@type": "ListItem",
      position: position + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function faqSchema(page: LandingPage): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/**
 * Google treats WebApplication as a subtype of SoftwareApplication, so a single
 * node declaring both types satisfies each without duplicating the entity.
 */
export function applicationSchema(page: LandingPage, tool: ToolDefinition): Schema {
  return {
    "@context": "https://schema.org",
    "@type": ["SoftwareApplication", "WebApplication"],
    "@id": `${SITE_URL}${page.path}#app`,
    name: page.h1,
    url: `${SITE_URL}${page.path}`,
    description: page.description,
    applicationCategory: "UtilitiesApplication",
    applicationSubCategory: "PDF Tool",
    operatingSystem: "Any — runs in a web browser",
    browserRequirements: "Requires a modern browser with JavaScript enabled",
    permissions: tool.processingType !== "client"
      ? "Files are sent to a conversion service over an encrypted connection"
      : "No permissions required — files are processed locally in the browser",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    featureList: page.features.map((feature) => feature.title),
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

export function howToSchema(page: LandingPage, tool: ToolDefinition): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to ${tool.verb} a ${tool.acceptLabel} file`,
    description: page.description,
    totalTime: "PT1M",
    supply: [{ "@type": "HowToSupply", name: `A ${tool.acceptLabel} file` }],
    tool: [{ "@type": "HowToTool", name: "A web browser" }],
    step: page.steps.map((step, position) => ({
      "@type": "HowToStep",
      position: position + 1,
      name: step.title,
      text: step.body,
      url: `${SITE_URL}${page.path}#how-to`,
    })),
  };
}

/** Everything a landing page emits, in one array. */
export function landingPageSchemas(page: LandingPage, tool: ToolDefinition): Schema[] {
  return [
    breadcrumbSchema(page),
    applicationSchema(page, tool),
    howToSchema(page, tool),
    faqSchema(page),
  ];
}
