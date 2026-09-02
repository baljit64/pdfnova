import { AVAILABLE_TOOL_IDS, getTool } from "../tools/registry";
import { VARIATIONS, variationAppliesTo } from "./landing/variations";

export interface LegacyToolRedirect {
  slug: string;
  destination: string;
}

/**
 * Previous releases exposed long-tail keyword variants of each tool page.
 * Preserve those URLs, but consolidate every signal into the useful canonical
 * tool instead of continuing to publish near-duplicate landing pages.
 */
export const LEGACY_TOOL_REDIRECTS: LegacyToolRedirect[] = AVAILABLE_TOOL_IDS.flatMap(
  (toolId) => {
    const tool = getTool(toolId);
    return VARIATIONS.filter((variation) => variationAppliesTo(variation, tool)).map(
      (variation) => ({
        slug: `${tool.slug}${variation.slugSuffix}`,
        destination: `/${tool.slug}`,
      })
    );
  }
);

const REDIRECT_BY_SLUG = new Map(
  LEGACY_TOOL_REDIRECTS.map((redirect) => [redirect.slug, redirect.destination])
);

export function getLegacyToolRedirect(slug: string): string | undefined {
  return REDIRECT_BY_SLUG.get(slug);
}
