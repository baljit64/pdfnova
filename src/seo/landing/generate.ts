/**
 * The landing page generator.
 *
 * Composes a tool definition, its source copy and a variation into a fully
 * resolved `LandingPage`. Adding pages is a matter of editing `variations.ts`
 * or a tool's `related` list — nothing here needs to change.
 */
import { SITE_URL } from "../config";
import { AVAILABLE_TOOL_IDS, TOOLS, getTool } from "../../tools/registry";
import type { ToolDefinition, ToolId } from "../../tools/types";
import { getToolContent } from "./toolContent";
import { VARIATIONS, getVariation, variationAppliesTo } from "./variations";
import type { ContentBlock, LandingPage, ListItem, RelatedLink } from "./types";

/** Marks the parent tool route, which is its own canonical. */
export const CANONICAL_VARIATION = "canonical";

const SITE_SUFFIX = " | PDFNova";
const MAX_TITLE_LENGTH = 65;

/** Sibling variation links per page. Enough that every page has inbound links. */
const SIBLING_LINK_COUNT = 6;

/** Append the brand only when it does not push the title past a sensible length. */
function withBrand(title: string): string {
  return title.length + SITE_SUFFIX.length <= MAX_TITLE_LENGTH ? `${title}${SITE_SUFFIX}` : title;
}

function privacySection(tool: ToolDefinition): ContentBlock {
  if (tool.serverSide) {
    return {
      heading: "Privacy",
      paragraphs: [
        `${tool.name} is the one tool on PDFNova that cannot run on your own device, and we would rather be direct about that than let you assume otherwise. Reconstructing an editable document from a PDF requires layout analysis that is not practical in a browser, so your file is sent to a conversion service, processed there, and returned to you.`,
        "The transfer happens over an encrypted HTTPS connection in both directions. The file passes through PDFNova's API route only to reach the conversion service — it is not written to disk here, not logged, and not retained after the response has been sent.",
        "If a document is sensitive enough that you would rather it never left your device at all, this is the tool to avoid. Every other tool on this site processes files entirely in your browser, and those pages say so because it is true of them.",
      ],
    };
  }

  return {
    heading: "Privacy",
    paragraphs: [
      `Your files are not uploaded. When you add a ${tool.acceptLabel} file, your browser reads it from your device into the memory of the tab you are looking at, and the ${tool.name.toLowerCase()} operation runs there using your own processor. Nothing is transmitted to any server at any point.`,
      "That means there is no file for anyone to store, no retention policy to trust, and no deletion schedule to take on faith. The document exists only in the memory of an open browser tab, and it is released the moment you close it, reload the page, or press start over.",
      "The site uses standard anonymous analytics to count page views and how often each tool is used. Those events record which tool ran and whether it succeeded — never a file name, never file contents, and never anything that could identify a document or the person processing it.",
      "No account is required, so no personal information is collected. There is no profile, no history and nothing tied to an identity, because no identity was ever created.",
    ],
  };
}

function securitySection(tool: ToolDefinition): ContentBlock {
  if (tool.serverSide) {
    return {
      heading: "Security",
      paragraphs: [
        "The page is served over HTTPS, and the file transfer to and from the conversion service is encrypted in both directions. Your document is streamed through rather than stored, so no copy is written to disk on PDFNova's side.",
        "Uploads are validated before they are forwarded: the file must be a PDF and must be within the size limit. Anything else is rejected with a clear message rather than being passed on.",
        "For documents where the transfer itself is the concern, the alternative is to keep the PDF as a PDF — the merge, split, compress, rotate, watermark, sign and image conversion tools all run entirely on your device and never transmit anything.",
      ],
    };
  }

  return {
    heading: "Security",
    paragraphs: [
      "The strongest security property this tool has is structural: your file never travels anywhere, so there is no transmission to intercept and no server-side copy to breach. This is not a policy that could change — it is a consequence of where the code runs.",
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

function buildRelated(
  tool: ToolDefinition,
  variationId: string,
  slugsForTool: string[]
): RelatedLink[] {
  const links: RelatedLink[] = [];

  // Always point back at the parent tool so no landing page is an orphan.
  if (variationId !== CANONICAL_VARIATION) {
    links.push({
      label: tool.name,
      href: `/${tool.slug}`,
      description: `The main ${tool.name.toLowerCase()} page, with the same tool and every option.`,
    });
  }

  for (const relatedId of tool.related) {
    const related = TOOLS[relatedId];
    if (!related?.available) continue;
    links.push({
      label: related.name,
      href: `/${related.slug}`,
      description: related.tagline,
    });
  }

  // Sibling variations, taken as a window that rotates with this page's own
  // position. A fixed window would leave every variation past the first few with
  // no inbound links at all; rotating means each one is linked from several
  // others, so the whole set is reachable by crawling rather than only via the
  // sitemap.
  const ownSlug = `${tool.slug}${variationSuffix(variationId)}`;
  const start = Math.max(0, slugsForTool.indexOf(ownSlug)) + 1;

  for (let offset = 0; offset < SIBLING_LINK_COUNT && offset < slugsForTool.length; offset++) {
    const sibling = slugsForTool[(start + offset) % slugsForTool.length];
    if (sibling === ownSlug) continue;

    const variation = VARIATIONS.find(
      (candidate) => `${tool.slug}${candidate.slugSuffix}` === sibling
    );
    if (!variation) continue;

    links.push({
      label: `${tool.name} — ${variation.label}`,
      href: `/${sibling}`,
      description: variation.description(tool),
    });
  }

  return links;
}

function variationSuffix(variationId: string): string {
  if (variationId === CANONICAL_VARIATION) return "";
  return getVariation(variationId)?.slugSuffix ?? "";
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
function buildCanonicalPage(tool: ToolDefinition, slugsForTool: string[]): LandingPage {
  const content = getToolContent(tool.id);

  const draft: Omit<LandingPage, "wordCount"> = {
    slug: tool.slug,
    path: `/${tool.slug}`,
    toolId: tool.id,
    variationId: CANONICAL_VARIATION,
    isCanonical: true,
    targetKeyword: tool.keywords[0],
    title: withBrand(`${tool.name} Online Free — ${tool.acceptLabel} Tool`),
    description: `${tool.blurb} Free, no signup, no watermark. ${tool.serverSide ? "Converted securely and returned in seconds." : "Runs in your browser — files never leave your device."}`,
    h1: tool.name,
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
    related: buildRelated(tool, CANONICAL_VARIATION, slugsForTool),
    breadcrumbs: [
      { name: "Home", url: SITE_URL },
      { name: tool.name, url: `${SITE_URL}/${tool.slug}` },
    ],
  };

  return { ...draft, wordCount: countWords(draft) };
}

/** Build one variation page for a tool. */
function buildVariationPage(
  tool: ToolDefinition,
  variationId: string,
  slugsForTool: string[]
): LandingPage | null {
  const variation = getVariation(variationId);
  if (!variation || !variationAppliesTo(variation, tool)) return null;

  const content = getToolContent(tool.id);
  const slug = `${tool.slug}${variation.slugSuffix}`;

  const draft: Omit<LandingPage, "wordCount"> = {
    slug,
    path: `/${slug}`,
    toolId: tool.id,
    variationId: variation.id,
    isCanonical: false,
    targetKeyword: variation.keyword(tool),
    title: withBrand(variation.titlePrefix(tool)),
    description: variation.description(tool),
    h1: variation.h1(tool),
    // The variation's angle leads; the tool's own introduction follows it.
    intro: [...variation.lead(tool), ...content.intro],
    sections: [
      variation.section(tool),
      content.technical,
      privacySection(tool),
      securitySection(tool),
      limitationsSection(tool),
    ],
    // Variation-specific advantages first — they are what this page is about.
    benefits: [...variation.benefits(tool), ...content.benefits],
    steps: content.steps,
    features: content.features,
    useCases: content.useCases,
    faqs: [...variation.faqs(tool), ...content.faqs],
    related: buildRelated(tool, variation.id, slugsForTool),
    breadcrumbs: [
      { name: "Home", url: SITE_URL },
      { name: tool.name, url: `${SITE_URL}/${tool.slug}` },
      { name: variation.label, url: `${SITE_URL}/${slug}` },
    ],
  };

  return { ...draft, wordCount: countWords(draft) };
}

/** Every variation slug that applies to a tool, in catalogue order. */
function variationSlugsFor(tool: ToolDefinition): string[] {
  return VARIATIONS.filter((variation) => variationAppliesTo(variation, tool)).map(
    (variation) => `${tool.slug}${variation.slugSuffix}`
  );
}

let cachedPages: LandingPage[] | null = null;
let cachedIndex: Map<string, LandingPage> | null = null;

/** Every landing page in the site, canonical tool pages included. Built once. */
export function getAllLandingPages(): LandingPage[] {
  if (cachedPages) return cachedPages;

  const pages: LandingPage[] = [];

  for (const toolId of AVAILABLE_TOOL_IDS) {
    const tool = getTool(toolId);
    const slugsForTool = variationSlugsFor(tool);

    pages.push(buildCanonicalPage(tool, slugsForTool));

    for (const variation of VARIATIONS) {
      const page = buildVariationPage(tool, variation.id, slugsForTool);
      if (page) pages.push(page);
    }
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

/** Variation pages only — the slugs the dynamic `[slug]` route serves. */
export function getVariationLandingPages(): LandingPage[] {
  return getAllLandingPages().filter((page) => !page.isCanonical);
}

export function getLandingPagesForTool(toolId: ToolId): LandingPage[] {
  return getAllLandingPages().filter((page) => page.toolId === toolId);
}
