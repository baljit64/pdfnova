import type { ToolId } from "../../tools/types";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ContentBlock {
  heading: string;
  paragraphs: string[];
}

export interface ListItem {
  title: string;
  body: string;
}

export interface RelatedLink {
  label: string;
  href: string;
  description: string;
}

export interface Breadcrumb {
  name: string;
  url: string;
}

/** Everything a landing page needs, fully resolved. Built on the server. */
export interface LandingPage {
  /** Route segment, e.g. "merge-pdf-on-mac". */
  slug: string;
  /** Absolute path, e.g. "/merge-pdf-on-mac". */
  path: string;
  toolId: ToolId;
  variationId: string;
  /** True for the parent tool route, which is its own canonical. */
  isCanonical: boolean;
  targetKeyword: string;
  title: string;
  description: string;
  h1: string;
  /** Paragraphs shown above the tool, kept short so the tool stays near the top. */
  intro: string[];
  /** Long-form sections rendered below the tool. */
  sections: ContentBlock[];
  benefits: ListItem[];
  steps: ListItem[];
  features: ListItem[];
  useCases: ListItem[];
  faqs: FaqItem[];
  related: RelatedLink[];
  breadcrumbs: Breadcrumb[];
  /** Approximate word count of the rendered copy, used by the docs and tests. */
  wordCount: number;
}
