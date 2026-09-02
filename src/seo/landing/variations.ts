/**
 * Historical route inventory used only to preserve old URLs with redirects.
 *
 * These entries used to generate long-tail landing pages. New keyword variants
 * must not be added: improve the canonical tool page or publish a useful guide.
 */
import type { ToolDefinition, ToolId } from "../../tools/types";

export interface LegacyVariationDefinition {
  id: string;
  slugSuffix: string;
  localOnly?: boolean;
  onlyTools?: ToolId[];
}

const variation = (
  id: string,
  slugSuffix: string,
  options: Pick<LegacyVariationDefinition, "localOnly" | "onlyTools"> = {}
): LegacyVariationDefinition => ({ id, slugSuffix, ...options });

export const VARIATIONS: LegacyVariationDefinition[] = [
  variation("online", "-online"),
  variation("free", "-free"),
  variation("without-signup", "-without-signup"),
  variation("unlimited", "-unlimited"),
  variation("fast", "-fast", { localOnly: true }),
  variation("secure", "-secure", { localOnly: true }),
  variation("without-upload", "-without-upload", { localOnly: true }),
  variation("browser", "-browser"),
  variation("without-losing-quality", "-without-losing-quality"),
  variation("no-watermark", "-no-watermark"),
  variation("mac", "-on-mac"),
  variation("windows", "-on-windows"),
  variation("linux", "-on-linux"),
  variation("iphone", "-on-iphone"),
  variation("android", "-on-android"),
  variation("chromebook", "-on-chromebook"),
  variation("mobile", "-mobile"),
  variation("desktop", "-desktop"),
  variation("under-100kb", "-under-100kb", { onlyTools: ["compress-pdf"] }),
  variation("under-500kb", "-under-500kb", { onlyTools: ["compress-pdf"] }),
  variation("under-1mb", "-under-1mb", { onlyTools: ["compress-pdf"] }),
  variation("under-2mb", "-under-2mb", { onlyTools: ["compress-pdf"] }),
  variation("under-5mb", "-under-5mb", { onlyTools: ["compress-pdf"] }),
  variation("lossless", "-lossless", { onlyTools: ["compress-pdf"] }),
  variation("extract-pages", "-extract-pages", { onlyTools: ["split-pdf"] }),
  variation("permanently", "-permanently", { onlyTools: ["rotate-pdf"] }),
  variation("high-resolution", "-high-resolution", {
    onlyTools: ["pdf-to-jpg", "pdf-to-image"],
  }),
  variation("multiple-files", "-multiple-files", {
    onlyTools: ["merge-pdf", "jpg-to-pdf"],
  }),
];

export function variationAppliesTo(
  candidate: LegacyVariationDefinition,
  tool: ToolDefinition
): boolean {
  if (candidate.onlyTools && !candidate.onlyTools.includes(tool.id)) return false;
  if (candidate.localOnly && tool.processingType !== "client") return false;
  return tool.available;
}
