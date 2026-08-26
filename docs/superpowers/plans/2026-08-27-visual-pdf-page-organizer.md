# Visual PDF Page Organizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a browser-only, 100-page visual organizer to Merge PDF and Split PDF with page selection, reordering, rotation, removal, and correct exported output.

**Architecture:** A pure manifest module owns immutable page operations and range synchronization. A preview hook prepares bounded PDF.js thumbnails and reconciles them by stable file identity, while a controlled dnd-kit component renders all interactions. `ToolWorkspace` passes the manifest through `RunContext.pagePlan`, and the pdf-lib engine consumes that plan without changing other tools.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.9, Ant Design 6, pdf.js 5, pdf-lib 1.17, dnd-kit, Playwright, tsx verification scripts.

---

## File structure

- Create `src/tools/page-organizer.ts`: manifest types, immutable operations, reconciliation, page-limit validation, and range synchronization.
- Create `scripts/verify-page-organizer.mts`: fast Node-side behavior checks for every pure manifest operation.
- Modify `src/tools/types.ts`: add the optional serializable `RunContext.pagePlan` contract.
- Modify `src/tools/engine/pdf.ts`: execute merge and split from a page plan, including cumulative rotations.
- Modify `scripts/verify-engine.mts`: verify actual PDF order, selection, filenames, and rotation.
- Modify `src/tools/engine/raster.ts`: count up to 100 pages before rendering and prepare multi-file thumbnails sequentially.
- Create `src/components/tool/usePdfPageOrganizer.ts`: stable file identities, async preparation, reconciliation, aborts, and object-URL cleanup.
- Create `src/components/tool/PdfPageOrganizer.tsx`: controlled sortable grid and accessible page controls.
- Modify `src/components/tool/ToolWorkspace.tsx`: organizer lifecycle, range synchronization, run gating, and `pagePlan` plumbing.
- Modify `src/tools/runners.ts`: forward `pagePlan` to merge and split.
- Modify `src/tools/registry.ts`: remove conflicting file-level merge transforms and rename split output modes.
- Create `tests/e2e/page-organizer.spec.ts`: browser coverage for merge, split, mobile controls, downloads, and the 100-page limit.
- Modify `package.json` and `package-lock.json`: add dnd-kit and include organizer checks in `npm run verify`.

### Task 1: Pure page-manifest behavior

**Files:**
- Create: `scripts/verify-page-organizer.mts`
- Create: `src/tools/page-organizer.ts`
- Modify: `src/tools/types.ts:27-69`
- Modify: `package.json:8-20`

- [ ] **Step 1: Write the failing manifest verification script**

Create `scripts/verify-page-organizer.mts`. Dynamically import the absent module so the first run produces assertion failures rather than a module-resolution crash:

```ts
type OrganizerModule = Record<string, (...args: never[]) => unknown>;

let organizer: OrganizerModule = {};
try {
  organizer = await import("../src/tools/page-organizer") as unknown as OrganizerModule;
} catch {
  // The first red run intentionally reaches assertions with no implementation.
}

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
const build = organizer.buildOrganizerPages as ((value: typeof sources) => Array<Record<string, unknown>>) | undefined;
const pages = build?.(sources) ?? [];

ok("builds pages in file and page order", pages.map((page) => page.id).join(",") === "a:0,a:1,b:0,b:1");
ok("new pages start selected and unrotated", pages.every((page) => page.selected === true && page.rotation === 0));

const reorder = organizer.reorderOrganizerPages as ((value: typeof pages, active: string, over: string) => typeof pages) | undefined;
const reordered = reorder?.(pages, "b:0", "a:1") ?? [];
ok("reorders immutably", reordered.map((page) => page.id).join(",") === "a:0,b:0,a:1,b:1" && pages[1]?.id === "a:1");

const rotate = organizer.rotateOrganizerPage as ((value: typeof pages, id: string) => typeof pages) | undefined;
const rotated = rotate?.(pages, "a:1") ?? [];
ok("rotates one page clockwise", rotated[1]?.rotation === 90 && rotated[0]?.rotation === 0);

const toggle = organizer.toggleOrganizerPage as ((value: typeof pages, id: string) => typeof pages) | undefined;
const selected = toggle?.(pages, "a:1") ?? [];
ok("toggles one selected page", selected[1]?.selected === false && selected[0]?.selected === true);

const format = organizer.formatSelectedPageRange as ((value: typeof pages) => string) | undefined;
ok("compacts ascending page ranges", format?.(pages.slice(0, 2)) === "1-2");
ok("preserves reordered page ranges", format?.([pages[1], pages[0]]) === "2, 1");

const apply = organizer.applyPageRangeExpression as ((value: typeof pages, expression: string) => typeof pages) | undefined;
const ranged = apply?.(pages.slice(0, 2), "2, 1") ?? [];
ok("applies range order without losing pages", ranged.map((page) => `${page.sourcePageIndex}:${page.selected}`).join(",") === "1:true,0:true");

const reconcile = organizer.reconcileOrganizerPages as ((current: typeof pages, prepared: typeof pages, known: Set<string>) => typeof pages) | undefined;
const edited = pages.filter((page) => page.id !== "a:1");
if (edited[0]) edited[0] = { ...edited[0], rotation: 90 };
const withNewFile = build?.([...sources, { fileKey: "c", fileIndex: 2, sourceName: "c.pdf", pageCount: 1 }]) ?? [];
const reconciled = reconcile?.(edited, withNewFile, new Set(pages.map((page) => String(page.id)))) ?? [];
ok("reconciles additions without restoring removed pages", reconciled.map((page) => page.id).join(",") === "a:0,b:0,b:1,c:0" && reconciled[0]?.rotation === 90);

const assertLimit = organizer.assertOrganizerPageLimit as ((count: number, limit?: number) => void) | undefined;
ok("accepts exactly 100 pages", (() => { try { assertLimit?.(100); return Boolean(assertLimit); } catch { return false; } })());
ok("rejects 101 pages", (() => { try { assertLimit?.(101); return false; } catch (error) { return error instanceof Error && error.message.includes("100"); } })());

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
```

- [ ] **Step 2: Run the script and verify red**

Run:

```bash
npx tsx scripts/verify-page-organizer.mts
```

Expected: exit code 1 with manifest assertions reported as `FAIL`.

- [ ] **Step 3: Implement the minimal manifest module**

Add `OrganizerPage` to `src/tools/types.ts`:

```ts
export interface OrganizerPage {
  id: string;
  fileIndex: number;
  sourcePageIndex: number;
  sourceName: string;
  rotation: 0 | 90 | 180 | 270;
  selected: boolean;
}
```

Create `src/tools/page-organizer.ts`:

```ts
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

export function buildOrganizerPages(sources: OrganizerSource[]): OrganizerPage[] {
  return sources.flatMap((source) =>
    Array.from({ length: source.pageCount }, (_, sourcePageIndex) => ({
      id: `${source.fileKey}:${sourcePageIndex}`,
      fileIndex: source.fileIndex,
      sourcePageIndex,
      sourceName: source.sourceName,
      rotation: 0 as const,
      selected: true,
    }))
  );
}

export function reconcileOrganizerPages(
  current: OrganizerPage[],
  prepared: OrganizerPage[],
  previouslyLoadedIds: ReadonlySet<string>
): OrganizerPage[] {
  const preparedById = new Map(prepared.map((page) => [page.id, page]));
  const preserved = current.flatMap((page) => {
    const fresh = preparedById.get(page.id);
    return fresh ? [{ ...page, fileIndex: fresh.fileIndex, sourceName: fresh.sourceName }] : [];
  });
  return [...preserved, ...prepared.filter((page) => !previouslyLoadedIds.has(page.id))];
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
  return from < 0 || to < 0 || to >= pages.length ? pages : reorderOrganizerPages(pages, id, pages[to].id);
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

export function formatSelectedPageRange(pages: OrganizerPage[]): string {
  const numbers = selectedOrganizerPages(pages).map((page) => page.sourcePageIndex + 1);
  const parts: string[] = [];
  for (let index = 0; index < numbers.length; index += 1) {
    const start = numbers[index];
    let end = start;
    while (index + 1 < numbers.length && numbers[index + 1] === end + 1) end = numbers[++index];
    parts.push(start === end ? String(start) : `${start}-${end}`);
  }
  return parts.join(", ");
}

export function applyPageRangeExpression(pages: OrganizerPage[], expression: string): OrganizerPage[] {
  const indices = parsePageRanges(expression, pages.length);
  const bySourceIndex = new Map(pages.map((page) => [page.sourcePageIndex, page]));
  const selectedSet = new Set(indices);
  const selectedSlots = pages
    .map((page, index) => selectedSet.has(page.sourcePageIndex) ? index : -1)
    .filter((index) => index >= 0);
  const next = pages.map((page) => ({ ...page, selected: false }));
  indices.forEach((sourcePageIndex, index) => {
    const page = bySourceIndex.get(sourcePageIndex);
    if (page) next[selectedSlots[index]] = { ...page, selected: true };
  });
  return next;
}
```

Add the optional property to `RunContext`:

```ts
pagePlan?: OrganizerPage[];
```

Add these scripts to `package.json`:

```json
"verify:organizer": "tsx scripts/verify-page-organizer.mts",
"verify": "npm run verify:organizer && npm run verify:engine && npm run verify:excel && npm run verify:landing && npm run verify:seo"
```

- [ ] **Step 4: Verify green and build**

```bash
npm run verify:organizer
npm run build
```

Expected: all organizer assertions and the production build pass.

- [ ] **Step 5: Commit**

```bash
git add package.json scripts/verify-page-organizer.mts src/tools/page-organizer.ts src/tools/types.ts
git commit -m "feat: add PDF page organizer manifest"
```

### Task 2: Page-plan PDF execution

**Files:**
- Modify: `scripts/verify-engine.mts:7-55`
- Modify: `src/tools/engine/pdf.ts:42-176`
- Modify: `src/tools/runners.ts:14-45`

- [ ] **Step 1: Add failing engine assertions**

Change `makePdf` to accept `widthBase = 595` and create each page at `[widthBase + i, 842]`. Add these checks:

```ts
const planA = await makePdf(2, "Plan-A", 500);
const planB = await makePdf(2, "Plan-B", 700);
const mergePlan = [
  { id: "b:1", fileIndex: 1, sourcePageIndex: 1, sourceName: "Plan-B.pdf", rotation: 90 as const, selected: true },
  { id: "a:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "Plan-A.pdf", rotation: 180 as const, selected: true },
];
const plannedMerge = await mergePDFs({ files: [planA, planB], pagePlan: mergePlan, signal });
const plannedMergeDoc = await load(plannedMerge[0].blob);
ok("page plan controls cross-file merge order", plannedMergeDoc.getPage(0).getWidth() === 701 && plannedMergeDoc.getPage(1).getWidth() === 500);
ok("page plan applies merge rotation", plannedMergeDoc.getPage(0).getRotation().angle === 90 && plannedMergeDoc.getPage(1).getRotation().angle === 180);

const splitSource = await makePdf(3, "Selected", 600);
const splitPlan = [
  { id: "s:2", fileIndex: 0, sourcePageIndex: 2, sourceName: "Selected.pdf", rotation: 90 as const, selected: true },
  { id: "s:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "Selected.pdf", rotation: 180 as const, selected: true },
  { id: "s:1", fileIndex: 0, sourcePageIndex: 1, sourceName: "Selected.pdf", rotation: 0 as const, selected: false },
];
const selectedEach = await splitPDF({ file: splitSource, mode: "each", pagePlan: splitPlan, signal });
ok("split each exports only selected pages", selectedEach.length === 2);
ok("split each follows visual order in filenames", selectedEach.map((output) => output.name).join(",") === "Selected-page-3.pdf,Selected-page-1.pdf");
ok("split each applies page rotation", (await load(selectedEach[0].blob)).getPage(0).getRotation().angle === 90);
const selectedCombined = await splitPDF({ file: splitSource, mode: "range", pagePlan: splitPlan, signal });
const selectedCombinedDoc = await load(selectedCombined[0].blob);
ok("split combined follows visual order", selectedCombinedDoc.getPage(0).getWidth() === 602 && selectedCombinedDoc.getPage(1).getWidth() === 600);
ok("split combined applies page rotation", selectedCombinedDoc.getPage(1).getRotation().angle === 180);
```

- [ ] **Step 2: Verify red**

```bash
npm run verify:engine
```

Expected: the new order, selection, and rotation assertions fail because the engine ignores `pagePlan`.

- [ ] **Step 3: Implement page-plan merge and split**

Import `OrganizerPage`, add `pagePlan?: OrganizerPage[]` to `MergeParams` and `SplitParams`, and add:

```ts
function selectedPlan(pagePlan?: OrganizerPage[]): OrganizerPage[] | undefined {
  if (!pagePlan) return undefined;
  const selected = pagePlan.filter((page) => page.selected);
  if (selected.length === 0) throw new Error("Select at least one page to continue.");
  return selected;
}

function applyPlannedRotation(
  page: import("pdf-lib").PDFPage,
  rotation: OrganizerPage["rotation"],
  degrees: typeof import("pdf-lib").degrees
): void {
  if (rotation !== 0) page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
}
```

For planned merge, copy source documents sequentially and add copied pages in manifest order:

```ts
const plan = selectedPlan(pagePlan);
if (plan) {
  const copiedById = new Map<string, import("pdf-lib").PDFPage>();
  const metadataFileIndex = plan[0].fileIndex;
  for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
    const entries = plan.filter((page) => page.fileIndex === fileIndex);
    if (entries.length === 0) continue;
    assertNotAborted(signal);
    const source = await PDFDocument.load(await files[fileIndex].arrayBuffer());
    preserveFormAppearance(source);
    if (fileIndex === metadataFileIndex) copyMetadata(source, merged);
    for (const entry of entries) {
      if (entry.sourcePageIndex < 0 || entry.sourcePageIndex >= source.getPageCount()) {
        throw new Error(`${entry.sourceName} no longer contains page ${entry.sourcePageIndex + 1}.`);
      }
    }
    const copied = await merged.copyPages(source, entries.map((entry) => entry.sourcePageIndex));
    entries.forEach((entry, index) => copiedById.set(entry.id, copied[index]));
  }
  for (const entry of plan) {
    const copied = copiedById.get(entry.id);
    if (!copied) throw new Error(`Could not copy page ${entry.sourcePageIndex + 1} from ${entry.sourceName}.`);
    merged.addPage(copied);
    applyPlannedRotation(copied, entry.rotation, degrees);
  }
} else {
  for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
    assertNotAborted(signal);
    onProgress(Math.round((fileIndex / files.length) * 90), `Adding ${files[fileIndex].name}`);
    const source = await PDFDocument.load(await files[fileIndex].arrayBuffer());
    preserveFormAppearance(source);
    if (fileIndex === 0) copyMetadata(source, merged);
    const copied = await merged.copyPages(source, source.getPageIndices());
    const rotation = rotations[fileIndex] ?? 0;
    for (const page of copied) {
      merged.addPage(page);
      if (rotation !== 0) {
        page.setRotation(degrees((page.getRotation().angle + rotation) % 360));
      }
    }
  }
}
```

For split, destructure `degrees`, derive `entries` from the plan or existing input, and use the same entries in both modes:

```ts
const plan = selectedPlan(pagePlan);
const entries = plan ?? (mode === "range"
  ? parsePageRanges(ranges?.trim() || "", pageCount).map((sourcePageIndex) => ({ sourcePageIndex, rotation: 0 as const }))
  : Array.from({ length: pageCount }, (_, sourcePageIndex) => ({ sourcePageIndex, rotation: 0 as const })));

if (mode === "range") {
  const doc = await PDFDocument.create();
  copyMetadata(source, doc);
  const copied = await doc.copyPages(source, entries.map((entry) => entry.sourcePageIndex));
  copied.forEach((page, index) => {
    doc.addPage(page);
    applyPlannedRotation(page, entries[index].rotation, degrees);
  });
  const blob = pdfBlob(await doc.save());
  return [{ name: `${stem}-pages.pdf`, blob, kind: "pdf", size: blob.size }];
}
```

In each mode, loop `entries`, copy `entry.sourcePageIndex`, rotate it, and name it `${stem}-page-${entry.sourcePageIndex + 1}.pdf`.

Forward `ctx.pagePlan` from both runners:

```ts
pagePlan: ctx.pagePlan,
```

- [ ] **Step 4: Verify green**

```bash
npm run verify:engine
npm run verify:organizer
```

Expected: both focused suites pass, including legacy behavior.

- [ ] **Step 5: Commit**

```bash
git add scripts/verify-engine.mts src/tools/engine/pdf.ts src/tools/runners.ts
git commit -m "feat: execute PDF page organizer plans"
```

### Task 3: Browser acceptance tests first

**Files:**
- Create: `tests/e2e/page-organizer.spec.ts`

- [ ] **Step 1: Write the browser tests before UI code**

Create the test file with a width-coded PDF fixture and a downloaded-PDF helper:

```ts
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument, StandardFonts } from "pdf-lib";

async function pdfFixture(label: string, widths: number[]): Promise<Buffer> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < widths.length; index += 1) {
    const page = document.addPage([widths[index], 400]);
    page.drawText(`${label} ${index + 1}`, { x: 30, y: 340, size: 18, font });
  }
  return Buffer.from(await document.save());
}

async function downloadedPdf(page: import("@playwright/test").Page, buttonName: RegExp) {
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: buttonName }).click(),
  ]);
  const path = await download.path();
  if (!path) throw new Error("Playwright did not expose the downloaded file.");
  return PDFDocument.load(await readFile(path));
}
```

Add four tests:

```ts
test("merge organizer reorders, rotates, removes, and exports pages", async ({ page }) => {
  await page.goto("/merge-pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First", [301, 302]) },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second", [401, 402]) },
  ]);
  await expect(page.getByRole("heading", { name: "Arrange 4 pages" })).toBeVisible();
  await page.getByRole("button", { name: "Move second.pdf page 1 left" }).click();
  await page.getByRole("button", { name: "Rotate second.pdf page 1 clockwise" }).click();
  await page.getByRole("button", { name: "Remove first.pdf page 2" }).click();
  await page.getByRole("button", { name: "Merge PDFs" }).click();
  const output = await downloadedPdf(page, /Download merged\.pdf/);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([301, 401, 402]);
  expect(output.getPage(1).getRotation().angle).toBe(90);
});

test("split organizer exports selected pages separately", async ({ page }) => {
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "pages.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Page", [301, 302, 303]),
  });
  await expect(page.getByRole("heading", { name: "Choose and arrange 3 pages" })).toBeVisible();
  await page.getByRole("button", { name: "Deselect pages.pdf page 2" }).click();
  await page.getByRole("button", { name: "Move pages.pdf page 3 left" }).click();
  await page.getByRole("button", { name: "Split PDF" }).click();
  await expect(page.getByRole("button", { name: "Download all 2 as ZIP" })).toBeVisible();
});

test("split organizer exports one combined PDF in visual order", async ({ page }) => {
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "pages.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Page", [301, 302, 303]),
  });
  await expect(page.getByRole("heading", { name: "Choose and arrange 3 pages" })).toBeVisible();
  await page.getByRole("button", { name: "Deselect pages.pdf page 2" }).click();
  await page.getByRole("button", { name: "Move pages.pdf page 3 left" }).click();
  await page.getByLabel("One combined PDF").check();
  await page.getByRole("button", { name: "Split PDF" }).click();
  const output = await downloadedPdf(page, /Download pages-pages\.pdf/);
  expect(output.getPages().map((item) => item.getWidth())).toEqual([301, 303]);
});

test("visual organizer rejects 101 pages before showing a partial grid", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "The page cap is viewport independent.");
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "too-many.pdf",
    mimeType: "application/pdf",
    buffer: await pdfFixture("Page", Array.from({ length: 101 }, (_, index) => 300 + index)),
  });
  await expect(page.getByText(/supports up to 100 pages per job/)).toBeVisible();
  await expect(page.getByRole("list", { name: "PDF pages" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Split PDF" })).toBeDisabled();
});
```

- [ ] **Step 2: Verify browser red**

```bash
npm run build
npx playwright test tests/e2e/page-organizer.spec.ts --project=chromium
```

Expected: tests fail waiting for organizer headings.

### Task 4: Bounded preview lifecycle

**Files:**
- Modify: `src/tools/engine/raster.ts:19-172`
- Create: `src/components/tool/usePdfPageOrganizer.ts`

- [ ] **Step 1: Add multi-file thumbnail preparation**

Import `assertOrganizerPageLimit`. Define:

```ts
export interface PdfOrganizerInput {
  file: File;
  fileKey: string;
  fileIndex: number;
}

export interface PdfOrganizerThumbnail {
  id: string;
  fileIndex: number;
  sourcePageIndex: number;
  sourceName: string;
  blob: Blob;
}
```

Implement `renderPdfOrganizerThumbnails(inputs, signal)` with this exact sequence:

1. Load every input sequentially.
2. Add `pdf.numPages` to a running total.
3. Call `assertOrganizerPageLimit(total)` before any canvas rendering.
4. Destroy each counting document in `finally`.
5. Load inputs sequentially again.
6. Render every page at scale `0.28`, JPEG quality `0.72`.
7. Set canvas dimensions to zero immediately after blob creation.
8. Return IDs `${fileKey}:${sourcePageIndex}` and destroy each document in `finally`.
9. Wrap PDF open failures as `Could not read ${file.name}. ${detail}`.
10. Call `assertNotAborted(signal)` before every load and page.

The returned item is:

```ts
thumbnails.push({
  id: `${input.fileKey}:${sourcePageIndex}`,
  fileIndex: input.fileIndex,
  sourcePageIndex,
  sourceName: input.file.name,
  blob,
});
```

- [ ] **Step 2: Add the lifecycle hook**

Create `src/components/tool/usePdfPageOrganizer.ts` with this public return value:

```ts
{
  pages: OrganizerPage[];
  setPages: Dispatch<SetStateAction<OrganizerPage[]>>;
  thumbnailUrls: Record<string, string>;
  error: string | null;
  loading: boolean;
  ready: boolean;
  sourceSignature: string;
}
```

Use a `WeakMap<File, string>` plus an incrementing counter for stable file IDs. In one effect:

```ts
const controller = new AbortController();
let urls: string[] = [];
setError(null);
setReadySignature("");

import("../../tools/engine/raster")
  .then(({ renderPdfOrganizerThumbnails }) => renderPdfOrganizerThumbnails(inputs, controller.signal))
  .then((thumbnails) => {
    if (controller.signal.aborted) return;
    const prepared: OrganizerPage[] = thumbnails.map((item) => ({
      id: item.id,
      fileIndex: item.fileIndex,
      sourcePageIndex: item.sourcePageIndex,
      sourceName: item.sourceName,
      rotation: 0,
      selected: true,
    }));
    const nextUrls = Object.fromEntries(thumbnails.map((item) => {
      const url = URL.createObjectURL(item.blob);
      urls.push(url);
      return [item.id, url];
    }));
    setPages((current) => reconcileOrganizerPages(current, prepared, knownIds.current));
    knownIds.current = new Set(prepared.map((item) => item.id));
    setThumbnailUrls(nextUrls);
    setReadySignature(signature);
  })
  .catch((caught) => {
    if (!controller.signal.aborted) {
      setPages([]);
      setThumbnailUrls({});
      setError(caught instanceof Error ? caught.message : "Could not prepare page previews.");
    }
  });

return () => {
  controller.abort();
  urls.forEach((url) => URL.revokeObjectURL(url));
};
```

When disabled or empty, clear pages, URLs, known IDs, and ready state. Derive `loading` from `readySignature !== signature` so a file update cannot briefly run with stale pages.

- [ ] **Step 3: Type-check**

```bash
npm run build
```

Expected: build passes; browser tests remain red until the component is integrated.

### Task 5: Sortable component and workspace integration

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/tool/PdfPageOrganizer.tsx`
- Modify: `src/components/tool/ToolWorkspace.tsx:1-458`
- Modify: `src/tools/registry.ts:33-92`

- [ ] **Step 1: Install dnd-kit**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Implement `PdfPageOrganizer`**

Use `DndContext`, `closestCenter`, pointer/touch/keyboard sensors, `sortableKeyboardCoordinates`, `SortableContext`, `rectSortingStrategy`, `useSortable`, and `CSS.Transform.toString`.

Public props:

```ts
interface Props {
  mode: "merge" | "split";
  pages: OrganizerPage[];
  thumbnailUrls: Record<string, string>;
  disabled?: boolean;
  onChange: (pages: OrganizerPage[]) => void;
}
```

The wrapper and heading are:

```tsx
<section className="mt-6" aria-label="Visual PDF page organizer">
  <h2 className="text-base font-semibold text-gray-900">
    {mode === "merge" ? `Arrange ${pages.length} pages` : `Choose and arrange ${pages.length} pages`}
  </h2>
  <p className="text-sm text-gray-500">
    {mode === "merge"
      ? "Drag pages or use the arrow buttons to set the final PDF order."
      : `${pages.filter((page) => page.selected).length} of ${pages.length} pages selected.`}
  </p>
  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <SortableContext items={pages.map((page) => page.id)} strategy={rectSortingStrategy}>
      <ol aria-label="PDF pages" className="mt-3 grid max-h-[560px] grid-cols-2 gap-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-4 lg:grid-cols-6">
        {pages.map((page, index) => <SortablePageCard key={page.id} page={page} index={index} />)}
      </ol>
    </SortableContext>
  </DndContext>
  <p className="sr-only" aria-live="polite">{announcement}</p>
</section>
```

Every card must expose:

```tsx
aria-label={`Drag ${page.sourceName} page ${page.sourcePageIndex + 1}`}
aria-label={`${page.selected ? "Deselect" : "Select"} ${page.sourceName} page ${page.sourcePageIndex + 1}`}
aria-label={`Move ${page.sourceName} page ${page.sourcePageIndex + 1} left`}
aria-label={`Move ${page.sourceName} page ${page.sourcePageIndex + 1} right`}
aria-label={`Rotate ${page.sourceName} page ${page.sourcePageIndex + 1} clockwise`}
aria-label={`Remove ${page.sourceName} page ${page.sourcePageIndex + 1}`}
```

Use the pure manifest functions for all changes. Render remove only in merge mode, render selection state only in split mode, and never allow the last merge page to be removed. Show the rotation value as text. After button movement/removal, focus the nearest remaining card with a `data-page-id` selector. Put all status text in the polite live region.

- [ ] **Step 3: Integrate state into `ToolWorkspace`**

Call the hook unconditionally:

```ts
const organizerMode = tool.id === "merge-pdf" ? "merge" : tool.id === "split-pdf" ? "split" : null;
const organizer = usePdfPageOrganizer(files, Boolean(organizerMode) && files.length > 0);
const [rangeError, setRangeError] = useState<string | null>(null);
const initializedSplitSource = useRef("");
```

Initialize Split PDF once per source:

```ts
useEffect(() => {
  if (organizerMode !== "split" || !organizer.ready || organizer.pages.length === 0) return;
  if (initializedSplitSource.current === organizer.sourceSignature) return;
  initializedSplitSource.current = organizer.sourceSignature;
  setOptions((current) => ({ ...current, ranges: formatSelectedPageRange(organizer.pages) }));
  setRangeError(null);
}, [organizer.pages, organizer.ready, organizer.sourceSignature, organizerMode]);
```

In `updateOption`, validate `ranges` and preserve pages on invalid input:

```ts
setOptions((current) => ({ ...current, [key]: value }));
if (tool.id === "split-pdf" && key === "ranges" && organizer.ready) {
  try {
    organizer.setPages(applyPageRangeExpression(organizer.pages, String(value)));
    setRangeError(null);
  } catch (caught) {
    setRangeError(caught instanceof Error ? caught.message : "Enter a valid page range.");
  }
}
```

On visual changes:

```ts
organizer.setPages(nextPages);
if (tool.id === "split-pdf") {
  const range = formatSelectedPageRange(nextPages);
  setOptions((current) => ({ ...current, ranges: range }));
  setRangeError(range ? null : "Select at least one page to continue.");
}
```

Gate Run:

```ts
const organizerCanRun = !organizerMode || (
  organizer.ready &&
  !organizer.error &&
  organizer.pages.some((page) => page.selected) &&
  !rangeError
);
```

Pass:

```ts
pagePlan: organizerMode ? organizer.pages : undefined,
```

Render a spinner during preparation, an `Alert` for preview/range errors, and `PdfPageOrganizer` when ready. Reset split initialization/error on file replacement and full reset. Pass `minFiles={0}` to `SelectedFiles` only for merge so source removal can go below two.

- [ ] **Step 4: Update registry choices**

For Merge PDF:

```ts
fileListControls: { remove: true },
```

For Split PDF:

```ts
choices: [
  { label: "One PDF per selected page", value: "each" },
  { label: "One combined PDF", value: "range" },
],
```

Set `ranges.defaultValue` to `""` and help to `Choose pages visually or enter page numbers. The order you enter is the output order.`

- [ ] **Step 5: Verify browser green**

```bash
npm run build
npx playwright test tests/e2e/page-organizer.spec.ts --project=chromium
```

Expected: all four organizer tests pass.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/components/tool/PdfPageOrganizer.tsx src/components/tool/usePdfPageOrganizer.ts src/components/tool/ToolWorkspace.tsx src/tools/engine/raster.ts src/tools/registry.ts tests/e2e/page-organizer.spec.ts
git commit -m "feat: add visual PDF page organizer"
```

### Task 6: Mobile and state regressions

**Files:**
- Modify: `tests/e2e/page-organizer.spec.ts`
- Modify only after a failing test: `src/components/tool/PdfPageOrganizer.tsx`
- Modify only after a failing test: `src/components/tool/usePdfPageOrganizer.ts`
- Modify only after a failing test: `src/components/tool/ToolWorkspace.tsx`

- [ ] **Step 1: Add regression tests**

Add:

```ts
test("move controls remain available at a mobile viewport", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "Mobile-only check.");
  await page.goto("/merge-pdf");
  await page.locator('input[type="file"]').setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First", [301]) },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second", [401]) },
  ]);
  await expect(page.getByRole("button", { name: "Move second.pdf page 1 left" })).toBeVisible();
  await page.getByRole("button", { name: "Move second.pdf page 1 left" }).click();
  await expect(page.getByText(/Moved to output position 1/)).toBeAttached();
});

test("adding a merge file preserves edits and appends pages", async ({ page }) => {
  await page.goto("/merge-pdf");
  const input = page.locator('input[type="file"]');
  await input.setInputFiles([
    { name: "first.pdf", mimeType: "application/pdf", buffer: await pdfFixture("First", [301, 302]) },
    { name: "second.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Second", [401]) },
  ]);
  await page.getByRole("button", { name: "Remove first.pdf page 2" }).click();
  await page.getByRole("button", { name: "Rotate second.pdf page 1 clockwise" }).click();
  await input.setInputFiles({ name: "third.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Third", [501]) });
  await expect(page.getByRole("heading", { name: "Arrange 3 pages" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove first.pdf page 2" })).toHaveCount(0);
  await expect(page.getByText("90°")).toBeVisible();
});

test("invalid split range keeps the last valid visual state", async ({ page }) => {
  await page.goto("/split-pdf");
  await page.locator('input[type="file"]').setInputFiles({
    name: "pages.pdf", mimeType: "application/pdf", buffer: await pdfFixture("Page", [301, 302, 303]),
  });
  await page.getByLabel("Pages to extract").fill("3, 1");
  await expect(page.getByText("2 of 3 pages selected.")).toBeVisible();
  await page.getByLabel("Pages to extract").fill("99");
  await expect(page.getByText(/Page 99 does not exist/)).toBeVisible();
  await expect(page.getByText("2 of 3 pages selected.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Split PDF" })).toBeDisabled();
});
```

- [ ] **Step 2: Run each test and make only test-proven fixes**

```bash
npx playwright test tests/e2e/page-organizer.spec.ts --project=chromium --grep "adding a merge file"
npx playwright test tests/e2e/page-organizer.spec.ts --project=chromium --grep "invalid split range"
npx playwright test tests/e2e/page-organizer.spec.ts --project=mobile-chromium --grep "mobile viewport"
```

Expected: if a test fails, verify its failure is behavioral, patch only the responsible module, and rerun. Do not change production code for tests that pass immediately.

- [ ] **Step 3: Run both projects**

```bash
npx playwright test tests/e2e/page-organizer.spec.ts
```

Expected: desktop and mobile projects pass with only declared project skips.

- [ ] **Step 4: Commit regression coverage**

```bash
git add tests/e2e/page-organizer.spec.ts src/components/tool/PdfPageOrganizer.tsx src/components/tool/usePdfPageOrganizer.ts src/components/tool/ToolWorkspace.tsx
git commit -m "test: harden PDF page organizer interactions"
```

### Task 7: Full verification

**Files:**
- Verify: `docs/superpowers/specs/2026-08-26-visual-pdf-page-organizer-design.md`
- Verify: all Task 1-6 files

- [ ] **Step 1: Check repository hygiene**

```bash
git diff --check
git status --short
```

Expected: no whitespace errors and no unrelated changes.

- [ ] **Step 2: Run all deterministic verification**

```bash
npm run verify
```

Expected: organizer, engine, Excel, landing, and SEO checks pass.

- [ ] **Step 3: Run a clean production build**

```bash
npm run build
```

Expected: compilation, type checking, and static generation pass.

- [ ] **Step 4: Run the complete browser suite**

```bash
npx playwright test
```

Expected: smoke and organizer suites pass in desktop and mobile projects.

- [ ] **Step 5: Audit design coverage**

Confirm from code and test evidence:

- Only Merge and Split mount the organizer.
- Source totals above 100 fail before any thumbnail grid is shown.
- Stable IDs preserve page edits across source additions and file reordering.
- Removed pages do not return when a source is added.
- Merge honors cross-file order, removal, and cumulative rotation.
- Split honors selected-page individual and combined output order.
- Valid range text synchronizes order; invalid text preserves the last valid visual state and disables Run.
- Pointer, touch, keyboard dragging, explicit buttons, focus restoration, accessible names, and live announcements exist.
- Abort controllers, PDF.js documents, canvases, and object URLs are released.
- Existing selectors and non-organizer tools remain unchanged.

- [ ] **Step 6: Confirm verification did not create tracked changes**

```bash
git status --short
```

Expected: verification creates no tracked changes, so no final commit is needed. Never add Playwright traces, screenshots, or unrelated workspace files.
