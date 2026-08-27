import {
  applyPageRangeExpression,
  assertOrganizerPageLimit,
  buildOrganizerPages,
  duplicateOrganizerInputError,
  formatSelectedPageRange,
  moveOrganizerPage,
  organizerPreviewStatus,
  pruneInactiveOrganizerSources,
  reconcileOrganizerPages,
  removeOrganizerPage,
  reorderOrganizerPages,
  rotateOrganizerPage,
  selectedOrganizerPages,
  toggleOrganizerPage,
} from "../src/tools/page-organizer";
import type { OrganizerPage } from "../src/tools/types";

let pass = 0;
let fail = 0;
const ok = (name: string, condition: boolean) => {
  if (condition) {
    pass += 1;
    console.log(`  ok   ${name}`);
  } else {
    fail += 1;
    console.log(`  FAIL ${name}`);
  }
};

const sources = [
  { fileKey: "a", fileIndex: 0, sourceName: "a.pdf", pageCount: 2 },
  { fileKey: "b", fileIndex: 1, sourceName: "b.pdf", pageCount: 2 },
];
const pages = buildOrganizerPages(sources);

ok("builds pages in file and page order", pages.map((page) => page.id).join(",") === "a:0,a:1,b:0,b:1");
ok("new pages start selected and unrotated", pages.length === 4 && pages.every((page) => page.selected === true && page.rotation === 0));

const reordered = reorderOrganizerPages(pages, "b:0", "a:1");
ok("reorders immutably", reordered.map((page) => page.id).join(",") === "a:0,b:0,a:1,b:1" && pages[1]?.id === "a:1");

const movedLeft = moveOrganizerPage(reordered, "b:0", -1);
const movedRight = moveOrganizerPage(movedLeft, "b:0", 1);
const leftBound = moveOrganizerPage(pages, "a:0", -1);
const rightBound = moveOrganizerPage(pages, "b:1", 1);
ok("moves pages left and right", movedLeft.map((page) => page.id).join(",") === "b:0,a:0,a:1,b:1" && movedRight.map((page) => page.id).join(",") === "a:0,b:0,a:1,b:1");
ok("handles movement bounds", leftBound.map((page) => page.id).join(",") === "a:0,a:1,b:0,b:1" && rightBound.map((page) => page.id).join(",") === "a:0,a:1,b:0,b:1");

const rotated90 = rotateOrganizerPage(pages, "a:1");
const rotated180 = rotateOrganizerPage(rotated90, "a:1");
const rotated270 = rotateOrganizerPage(rotated180, "a:1");
const rotated0 = rotateOrganizerPage(rotated270, "a:1");
ok("rotates one page clockwise", rotated90[1]?.rotation === 90 && rotated90[0]?.rotation === 0);
ok("cycles rotation by 90 degrees", rotated180[1]?.rotation === 180 && rotated270[1]?.rotation === 270 && rotated0[1]?.rotation === 0);

const deselected = toggleOrganizerPage(pages, "a:1");
ok("toggles one selected page", deselected[1]?.selected === false && deselected[0]?.selected === true && pages[1]?.selected === true);

const removed = removeOrganizerPage(pages, "a:1");
ok("removes only target page", removed.map((page) => page.id).join(",") === "a:0,b:0,b:1" && pages.length === 4);

ok("returns selected pages", selectedOrganizerPages(deselected).map((page) => page.id).join(",") === "a:0,b:0,b:1");

const splitPages = buildOrganizerPages([{ fileKey: "a", fileIndex: 0, sourceName: "a.pdf", pageCount: 4 }]);
ok("compacts ascending page ranges", formatSelectedPageRange(splitPages.slice(0, 2)) === "1-2");
ok("preserves reordered page ranges", formatSelectedPageRange([splitPages[1], splitPages[0]]) === "2, 1");

const ranged = applyPageRangeExpression(splitPages, "2, 1");
ok("applies range order without losing pages", ranged.map((page) => `${page.id}:${page.selected}`).join(",") === "a:1:true,a:0:true,a:2:false,a:3:false");
ok("rejects invalid ranges through parser", (() => {
  try {
    applyPageRangeExpression(pages, "1-99");
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("does not exist");
  }
})());
const singleSource = buildOrganizerPages([{ fileKey: "a", fileIndex: 0, sourceName: "a.pdf", pageCount: 3 }]);
const singleReordered = reorderOrganizerPages(singleSource, "a:1", "a:0");
const singleRanged = applyPageRangeExpression(singleReordered, "2, 1");
ok("resolves ranges by source page after visual reorder", singleRanged.map((page) => `${page.id}:${page.selected}`).join(",") === "a:1:true,a:0:true,a:2:false" && singleReordered.map((page) => page.id).join(",") === "a:1,a:0,a:2" && singleReordered.every((page) => page.selected));

const edited: OrganizerPage[] = pages
  .filter((page) => page.id !== "a:1")
  .map((page): OrganizerPage => page.id === "a:0" ? { ...page, rotation: 90 } : page);
const renamedSources = [
  { fileKey: "a", fileIndex: 4, sourceName: "renamed-a.pdf", pageCount: 2 },
  { fileKey: "b", fileIndex: 5, sourceName: "b.pdf", pageCount: 2 },
  { fileKey: "c", fileIndex: 6, sourceName: "c.pdf", pageCount: 1 },
];
const withNewFile = buildOrganizerPages(renamedSources);
const reconciled = reconcileOrganizerPages(edited, withNewFile, new Set(pages.map((page) => String(page.id))));
ok("reconciles additions without restoring removed pages", reconciled.map((page) => page.id).join(",") === "a:0,b:0,b:1,c:0" && reconciled[0]?.rotation === 90);
ok("reconciles source metadata while preserving order", reconciled[0]?.fileIndex === 4 && reconciled[0]?.sourceName === "renamed-a.pdf");
const staleHistory = reconcileOrganizerPages(pages, withNewFile, new Set());
ok("does not duplicate current pages with stale history", staleHistory.map((page) => page.id).join(",") === "a:0,a:1,b:0,b:1,c:0");

const sourceRemoved = reconcileOrganizerPages(pages, buildOrganizerPages([sources[1]]), new Set(pages.map((page) => String(page.id))));
ok("drops pages from removed source files", sourceRemoved.map((page) => page.id).join(",") === "b:0,b:1");

ok("accepts exactly 100 pages", (() => { try { assertOrganizerPageLimit(100); return true; } catch { return false; } })());
ok("rejects 101 pages", (() => { try { assertOrganizerPageLimit(101); return false; } catch (error) { return error instanceof Error && error.message.includes("100"); } })());

const sourcePurge = pruneInactiveOrganizerSources(
  pages.filter((page) => page.id !== "a:1"),
  new Set(pages.map((page) => page.id)),
  new Set(["a"])
);
ok("purges removed sources from pages and known IDs before preview work",
  sourcePurge.pages.map((page) => page.id).join(",") === "a:0" &&
  [...sourcePurge.knownIds].join(",") === "a:0,a:1"
);
const failedPreview = organizerPreviewStatus(
  "0:file-1",
  null,
  "0:file-1",
  { signature: "0:file-1", message: "Could not read broken.pdf. Malformed PDF." }
);
const supersededPreview = organizerPreviewStatus(
  "0:file-2",
  null,
  "0:file-1",
  { signature: "0:file-1", message: "Could not read broken.pdf. Malformed PDF." }
);
ok("failed preview is settled, not ready, and exposes its exact current-signature error",
  failedPreview.loading === false &&
  failedPreview.ready === false &&
  failedPreview.error === "Could not read broken.pdf. Malformed PDF." &&
  supersededPreview.loading === true &&
  supersededPreview.ready === false &&
  supersededPreview.error === null
);
ok("rejects duplicate File references without rejecting distinct File identities",
  duplicateOrganizerInputError(["file-1", "file-1"]) === "The same PDF was added more than once. Remove the duplicate and try again." &&
  duplicateOrganizerInputError(["file-1", "file-2"]) === null
);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
