import { parsePageRanges } from "./engine/pdf";
import type { OrganizerPage } from "./types";

export const ORGANIZER_PAGE_LIMIT = 100;

export interface OrganizerSource {
  fileKey: string;
  fileIndex: number;
  sourceName: string;
  pageCount: number;
}

export function assertOrganizerPageLimit(count: number, limit = ORGANIZER_PAGE_LIMIT): void {
  if (count > limit) {
    throw new Error(`The visual page organizer supports up to ${limit} pages per job. This job has ${count} pages.`);
  }
}

function organizerFileKey(pageId: string): string {
  const separator = pageId.lastIndexOf(":");
  return separator < 0 ? pageId : pageId.slice(0, separator);
}

/**
 * Drops state for sources that have been explicitly removed while retaining
 * page-level removals (known IDs) for sources that are still active.
 */
export function pruneInactiveOrganizerSources(
  current: OrganizerPage[],
  knownIds: ReadonlySet<string>,
  activeFileKeys: ReadonlySet<string>
): { pages: OrganizerPage[]; knownIds: Set<string> } {
  return {
    pages: current.filter((page) => activeFileKeys.has(organizerFileKey(page.id))),
    knownIds: new Set([...knownIds].filter((id) => activeFileKeys.has(organizerFileKey(id)))),
  };
}

/** Returns a user-safe error when the same File identity is supplied twice. */
export function duplicateOrganizerInputError(fileKeys: readonly string[]): string | null {
  const seen = new Set<string>();
  for (const fileKey of fileKeys) {
    if (seen.has(fileKey)) {
      return "The same PDF was added more than once. Remove the duplicate and try again.";
    }
    seen.add(fileKey);
  }
  return null;
}

export interface OrganizerPreviewError {
  signature: string;
  message: string;
}

/** Derives visible preview status without allowing a stale request to leak UI state. */
export function organizerPreviewStatus(
  sourceSignature: string,
  readySignature: string | null,
  settledSignature: string | null,
  error: OrganizerPreviewError | null
): { loading: boolean; ready: boolean; error: string | null } {
  const active = sourceSignature !== "";
  return {
    loading: active && settledSignature !== sourceSignature,
    ready: active && readySignature === sourceSignature,
    error: active && error?.signature === sourceSignature ? error.message : null,
  };
}

export function buildOrganizerPages(sources: OrganizerSource[]): OrganizerPage[] {
  return sources.flatMap((source) =>
    Array.from({ length: source.pageCount }, (_, sourcePageIndex): OrganizerPage => ({
      id: `${source.fileKey}:${sourcePageIndex}`,
      fileIndex: source.fileIndex,
      sourcePageIndex,
      sourceName: source.sourceName,
      rotation: 0,
      selected: true,
    }))
  );
}

export function reconcileOrganizerPages(
  current: OrganizerPage[],
  prepared: OrganizerPage[],
  previouslyLoadedIds: ReadonlySet<string>,
): OrganizerPage[] {
  const preparedById = new Map(prepared.map((page) => [page.id, page]));
  const preserved = current.flatMap((page) => {
    const fresh = preparedById.get(page.id);
    return fresh
      ? [{ ...page, fileIndex: fresh.fileIndex, sourceName: fresh.sourceName }]
      : [];
  });
  const preservedIds = new Set(preserved.map((page) => page.id));
  const appended = prepared.filter((page) => !previouslyLoadedIds.has(page.id) && !preservedIds.has(page.id));
  return [...preserved, ...appended];
}

export function reorderOrganizerPages(pages: OrganizerPage[], activeId: string, overId: string): OrganizerPage[] {
  const from = pages.findIndex((page) => page.id === activeId);
  const to = pages.findIndex((page) => page.id === overId);
  if (from < 0 || to < 0 || from === to) return pages;

  const next = [...pages];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function moveOrganizerPage(pages: OrganizerPage[], id: string, delta: -1 | 1): OrganizerPage[] {
  const from = pages.findIndex((page) => page.id === id);
  const to = from + delta;
  if (from < 0 || to < 0 || to >= pages.length) return pages;
  return reorderOrganizerPages(pages, id, pages[to].id);
}

export function rotateOrganizerPage(pages: OrganizerPage[], id: string): OrganizerPage[] {
  return pages.map((page) => page.id === id
    ? { ...page, rotation: ((page.rotation + 90) % 360) as OrganizerPage["rotation"] }
    : page);
}

export function removeOrganizerPage(pages: OrganizerPage[], id: string): OrganizerPage[] {
  return pages.filter((page) => page.id !== id);
}

export function toggleOrganizerPage(pages: OrganizerPage[], id: string): OrganizerPage[] {
  return pages.map((page) => page.id === id ? { ...page, selected: !page.selected } : page);
}

export function selectedOrganizerPages(pages: OrganizerPage[]): OrganizerPage[] {
  return pages.filter((page) => page.selected);
}

/** Formats selection for Split PDF's single-source manifest. */
export function formatSelectedPageRange(pages: OrganizerPage[]): string {
  const numbers = selectedOrganizerPages(pages).map((page) => page.sourcePageIndex + 1);
  const parts: string[] = [];

  for (let index = 0; index < numbers.length; index += 1) {
    const start = numbers[index];
    let end = start;
    while (index + 1 < numbers.length && numbers[index + 1] === end + 1) {
      end = numbers[++index];
    }
    parts.push(start === end ? String(start) : `${start}-${end}`);
  }

  return parts.join(", ");
}

/**
 * Applies a 1-based range expression to Split PDF's single-source manifest.
 * Requested pages become the leading selected pages in expression order; all
 * other pages remain present, unselected, and retain their relative order.
 */
export function applyPageRangeExpression(pages: OrganizerPage[], expression: string): OrganizerPage[] {
  const indices = parsePageRanges(expression, pages.length);
  const bySourceIndex = new Map(pages.map((page) => [page.sourcePageIndex, page]));
  const requested = indices.map((sourcePageIndex) => {
    const page = bySourceIndex.get(sourcePageIndex);
    if (!page) {
      throw new Error(`Page ${sourcePageIndex + 1} does not exist — the PDF has ${pages.length} pages.`);
    }
    return page;
  });
  const requestedIds = new Set(requested.map((page) => page.id));
  const remaining = pages.filter((page) => !requestedIds.has(page.id));
  return [
    ...requested.map((page) => ({ ...page, selected: true })),
    ...remaining.map((page) => ({ ...page, selected: false })),
  ];
}
