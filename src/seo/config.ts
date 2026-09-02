/** Preferred production origin. Canonicals, sitemaps and structured data all use it. */
export const SITE_URL = "https://www.pdfnova.in";
export const HOME_URL = `${SITE_URL}/`;

function googleVerificationToken(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  const contentValue = trimmed.match(/content=["']([^"']+)["']/i)?.[1];
  const token = (contentValue ?? trimmed).trim();

  // `google123.html` belongs to Google's HTML-file verification method and is
  // not a valid value for the Metadata API's verification meta tag.
  return token && !/\.html$/i.test(token) ? token : undefined;
}

export const GOOGLE_SITE_VERIFICATION = googleVerificationToken(
  process.env.GOOGLE_SITE_VERIFICATION
);

export const BRAND_ASSETS = {
  logo: `${SITE_URL}/assets/pdf-nova-logo-horizontal.png`,
  appIcon: `${SITE_URL}/assets/pdf-nova-app-icon-light.png`,
  socialImage: `${SITE_URL}/assets/pdf-nova-banner-dark.png`,
} as const;

export const DEFAULT_TITLE =
  "PDFNova – Free Online PDF Tools | Merge, Compress, Convert & Edit";
export const DEFAULT_DESCRIPTION =
  "Use PDFNova's free PDF tools to merge PDF files, compress PDF documents, convert PDF to Word, create JPG to PDF files, and edit PDFs online.";

export interface RouteMeta {
  title: string;
  description: string;
  /** Whether this route belongs in search results and the XML sitemap. */
  indexable: boolean;
}

/**
 * SEO policy for non-generated routes.
 *
 * Functional tool metadata comes from the landing-page catalogue so tool copy,
 * headings and metadata cannot drift. Blog article metadata comes from posts.ts.
 */
export const ROUTE_META: Record<string, RouteMeta> = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    indexable: true,
  },
  "/convert-pdf": {
    title: "Convert PDF Online – PDF to Word, JPG & More | PDFNova",
    description:
      "Choose a PDFNova converter for PDF to Word, PDF to JPG, PDF to PNG, JPG to PDF and other available document formats.",
    indexable: true,
  },
  "/help": {
    title: "PDF Tool Help & Frequently Asked Questions | PDFNova",
    description:
      "Find instructions and answers for merging, splitting, compressing and converting files with PDFNova's online PDF tools.",
    indexable: true,
  },
  "/blog": {
    title: "PDF Guides, Tips & Tutorials | PDFNova Blog",
    description:
      "Read practical PDF guides about compressing, merging, splitting, converting and handling documents with appropriate care.",
    indexable: true,
  },
  "/about": {
    title: "About PDFNova – Online PDF Tools",
    description:
      "Learn about PDFNova and its collection of browser-based tools for merging, splitting, compressing, converting and editing PDFs.",
    indexable: true,
  },
  "/privacy": {
    title: "Privacy Policy | PDFNova",
    description:
      "Read how PDFNova handles site usage data and how local and server-assisted PDF tools process files.",
    indexable: true,
  },
  "/terms": {
    title: "Terms of Use | PDFNova",
    description:
      "Read the terms that apply when using PDFNova's online PDF and document tools.",
    indexable: true,
  },
  "/contact": {
    title: "Contact PDFNova",
    description:
      "Contact PDFNova with questions, feedback or requests related to its PDF tools and guides.",
    indexable: true,
  },
  "/login": {
    title: "Login | PDFNova",
    description: "Access the PDFNova login page.",
    indexable: false,
  },
  "/pdf-to-excel": {
    title: "PDF to Excel Converter – Coming Soon | PDFNova",
    description:
      "PDFNova's PDF to Excel converter is under development. Explore the PDF tools that are currently available.",
    indexable: false,
  },
  "/pdf-to-powerpoint": {
    title: "PDF to PowerPoint Converter – Coming Soon | PDFNova",
    description:
      "PDFNova's PDF to PowerPoint converter is under development. Explore the PDF tools that are currently available.",
    indexable: false,
  },
  "/powerpoint-to-pdf": {
    title: "PowerPoint to PDF Converter – Coming Soon | PDFNova",
    description:
      "PDFNova's PowerPoint to PDF converter is under development. Explore the PDF tools that are currently available.",
    indexable: false,
  },
};

export const INDEXABLE_STATIC_PATHS = Object.entries(ROUTE_META)
  .filter(([, meta]) => meta.indexable)
  .map(([path]) => path);
