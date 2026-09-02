/**
 * The landing page generator.
 *
 * Composes a tool definition, its source copy and canonical search metadata
 * into a fully resolved `LandingPage`.
 */
import { HOME_URL, SITE_URL } from "../config";
import { AVAILABLE_TOOL_IDS, TOOLS, getTool } from "../../tools/registry";
import type { ToolDefinition, ToolId } from "../../tools/types";
import { getToolContent } from "./toolContent";
import type { ContentBlock, LandingPage, ListItem, RelatedLink } from "./types";
import { getToolSeo } from "./toolSeo";

/** Identifies the canonical tool experience in analytics. */
export const CANONICAL_VARIATION = "canonical";

function privacySection(tool: ToolDefinition): ContentBlock {
  if (tool.processingType !== "client") {
    return {
      heading: "Privacy",
      paragraphs: [
        `${tool.name} uses server-assisted document conversion because preserving editable structure and office-document layout is not practical in a browser. Your file is sent to a conversion service, processed there, and returned to you.`,
        "The file passes through PDFNova's API route and is submitted to CloudConvert for processing. The transfer uses HTTPS, but the document leaves your device and is handled by that third-party service, so review the privacy requirements that apply to your document before using this converter.",
        "If a document must not leave your device, avoid server-assisted tools and use one of the tools explicitly labelled as on-device.",
      ],
    };
  }

  return {
    heading: "Privacy",
    paragraphs: [
      `When you add a ${tool.acceptLabel} file, your browser reads it into the current tab and the ${tool.name.toLowerCase()} operation runs on your device. The tool's processing code does not upload the selected document to PDFNova's API.`,
      "The document is held in browser memory while the tool is open. Closing or reloading the page clears that working state; PDFNova does not provide a server-side document history for these local tools.",
      "The site uses Vercel Analytics for site-usage measurement. That analytics integration is separate from document processing and the tool code does not include file names or file contents in tool events.",
      "No account is required to use the tool, and processed documents are not attached to a PDFNova profile.",
    ],
  };
}

function securitySection(tool: ToolDefinition): ContentBlock {
  if (tool.processingType !== "client") {
    return {
      heading: "Security",
      paragraphs: [
        "The page is served over HTTPS, and the requests to and from CloudConvert use HTTPS. This protects the transfer in transit, but it does not make a server-assisted conversion equivalent to on-device processing.",
        `The API validates the submitted ${tool.acceptLabel} file and enforces the tool's ${tool.maxFileSizeMB} MB limit before forwarding it.`,
        "For documents where the transfer itself is the concern, use an on-device tool or a trusted desktop application instead.",
      ],
    };
  }

  return {
    heading: "Security",
    paragraphs: [
      "The current implementation performs this document operation in your browser. Because the tool code does not send the selected file to PDFNova's API, there is no PDFNova server-side document copy created by the operation.",
      "You can verify it in about thirty seconds. Open your browser's developer tools with F12, select the Network tab, and use the tool. You will see the page's scripts load — including the PDF libraries, which are fetched on demand the first time a tool runs — and then nothing further. No request carrying your document is ever made.",
      "For a stronger test, disconnect from the network once the page has loaded. The tool will keep working exactly as before, which is only possible because nothing is being sent.",
      "Uploaded files are validated in the browser before anything runs: the extension must match what the tool accepts, the file must not be empty, and it must be within the size limit. Malformed documents produce a clear error and a retry option rather than a silent failure.",
    ],
  };
}

function limitationsSection(tool: ToolDefinition): ContentBlock {
  const content = getToolContent(tool.id);
  return {
    heading: "What this tool does not do",
    paragraphs: [
      `Being clear about limits is more useful than a feature list that quietly omits them. ${content.limitations}`,
      `If you need capabilities beyond that — redaction, PDF/A conformance, OCR, or scripted batch processing across thousands of documents — dedicated desktop software genuinely earns its licence fee, and this is not trying to replace it. For the specific job of producing a ${tool.outputNoun}, everything you need is on this page.`,
    ],
  };
}

function buildRelated(tool: ToolDefinition): RelatedLink[] {
  const links: RelatedLink[] = [];
  for (const relatedId of tool.related) {
    const related = TOOLS[relatedId];
    if (!related?.available) continue;
    links.push({
      label: related.name,
      href: `/${related.slug}`,
      description: related.tagline,
    });
  }

  return links;
}

function countWords(page: Omit<LandingPage, "wordCount">): number {
  const parts: string[] = [
    page.h1,
    page.description,
    ...page.intro,
    ...page.sections.flatMap((section) => [section.heading, ...section.paragraphs]),
    ...flattenList(page.benefits),
    ...flattenList(page.steps),
    ...flattenList(page.features),
    ...flattenList(page.useCases),
    ...page.faqs.flatMap((faq) => [faq.question, faq.answer]),
  ];
  return parts.join(" ").trim().split(/\s+/).length;
}

function flattenList(items: ListItem[]): string[] {
  return items.flatMap((item) => [item.title, item.body]);
}

/** Build the parent tool page — the canonical page for a tool. */
function buildCanonicalPage(tool: ToolDefinition): LandingPage {
  const content = getToolContent(tool.id);
  const seo = getToolSeo(tool.id);

  const draft: Omit<LandingPage, "wordCount"> = {
    slug: tool.slug,
    path: `/${tool.slug}`,
    toolId: tool.id,
    variationId: CANONICAL_VARIATION,
    isCanonical: true,
    targetKeyword: tool.keywords[0],
    title: seo.title,
    description: seo.description,
    h1: seo.h1,
    intro: content.intro,
    sections: [
      content.technical,
      privacySection(tool),
      securitySection(tool),
      limitationsSection(tool),
    ],
    benefits: content.benefits,
    steps: content.steps,
    features: content.features,
    useCases: content.useCases,
    faqs: content.faqs,
    related: buildRelated(tool),
    breadcrumbs: [
      { name: "Home", url: HOME_URL },
      { name: "PDF Tools", url: `${SITE_URL}/#all-tools` },
      { name: tool.name, url: `${SITE_URL}/${tool.slug}` },
    ],
  };

  return { ...draft, wordCount: countWords(draft) };
}

let cachedPages: LandingPage[] | null = null;
let cachedIndex: Map<string, LandingPage> | null = null;

/** Every canonical tool landing page in the site. Built once. */
export function getAllLandingPages(): LandingPage[] {
  if (cachedPages) return cachedPages;

  const pages: LandingPage[] = [];

  for (const toolId of AVAILABLE_TOOL_IDS) {
    const tool = getTool(toolId);
    pages.push(buildCanonicalPage(tool));
  }

  cachedPages = pages;
  return pages;
}

function index(): Map<string, LandingPage> {
  if (!cachedIndex) {
    cachedIndex = new Map(getAllLandingPages().map((page) => [page.slug, page]));
  }
  return cachedIndex;
}

export function getLandingPage(slug: string): LandingPage | undefined {
  return index().get(slug);
}

/** Canonical pages for working tools — the tool URLs eligible for indexing. */
export function getCanonicalLandingPages(): LandingPage[] {
  return getAllLandingPages();
}

export function getLandingPagesForTool(toolId: ToolId): LandingPage[] {
  return getAllLandingPages().filter((page) => page.toolId === toolId);
}
