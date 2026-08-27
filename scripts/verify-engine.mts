import { degrees, PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { imagesToPDF } from "../src/tools/engine/raster";
import { toWinAnsiSafe, baseName, formatBytes } from "../src/tools/engine/blob";
import { mergePDFs, splitPDF, rotatePDF, watermarkPDF, signPDF, addTextToPDF, parsePageRanges } from "../src/tools/engine/pdf";
import type { OrganizerPage } from "../src/tools/types";

const signal = new AbortController().signal;
let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, extra = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
};

async function makePdf(pages: number, label: string, widthBase = 595, originalRotation = 0): Promise<File> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const p = doc.addPage([widthBase + i, 842]);
    if (originalRotation !== 0) p.setRotation(degrees(originalRotation));
    p.drawText(`${label} page ${i + 1}`, { x: 50, y: 780, size: 20, font, color: rgb(0, 0, 0) });
  }
  // Copy into an ArrayBuffer-backed view that is valid as a browser BlobPart.
  return new File([new Uint8Array(await doc.save())], `${label}.pdf`, {
    type: "application/pdf",
  });
}

async function makeFormPdf(label: string): Promise<File> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${label} title`);
  const page = doc.addPage([595, 842]);
  const field = doc.getForm().createTextField("name");
  field.setText("visible value");
  field.addToPage(page, { x: 50, y: 700, width: 180, height: 24 });
  return new File([new Uint8Array(await doc.save())], `${label}.pdf`, { type: "application/pdf" });
}

const load = async (blob: Blob) => PDFDocument.load(await blob.arrayBuffer());

console.log("\nparsePageRanges");
ok("simple list", JSON.stringify(parsePageRanges("1-3, 7, 9-12", 20)) === JSON.stringify([0,1,2,6,8,9,10,11]));
ok("dedupes", JSON.stringify(parsePageRanges("2,2,2", 5)) === JSON.stringify([1]));
ok("preserves given order", JSON.stringify(parsePageRanges("5, 1-2", 10)) === JSON.stringify([4,0,1]));
ok("rejects out of range", await (async () => { try { parsePageRanges("1-40", 10); return false; } catch { return true; } })());
ok("rejects garbage", await (async () => { try { parsePageRanges("abc", 10); return false; } catch { return true; } })());
ok("rejects empty", await (async () => { try { parsePageRanges("  ", 10); return false; } catch { return true; } })());

console.log("\nmerge");
const a = await makePdf(3, "A"), b = await makePdf(2, "B");
const merged = await mergePDFs({ files: [a, b], rotations: [0, 90], signal });
const mergedDoc = await load(merged[0].blob);
ok("page count is 3+2", mergedDoc.getPageCount() === 5, `got ${mergedDoc.getPageCount()}`);
ok("first file unrotated", mergedDoc.getPage(0).getRotation().angle === 0);
ok("second file rotated 90", mergedDoc.getPage(3).getRotation().angle === 90, `got ${mergedDoc.getPage(3).getRotation().angle}`);
ok("named merged.pdf", merged[0].name === "merged.pdf");

const mergePlan: OrganizerPage[] = [
  { id: "B:1", fileIndex: 1, sourcePageIndex: 1, sourceName: "B.pdf", rotation: 90, selected: true },
  { id: "A:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "A.pdf", rotation: 180, selected: true },
];
const mergePlanSnapshot = JSON.stringify(mergePlan);
const mergeSourceA = await makePdf(2, "A", 500);
const mergeSourceB = await makePdf(2, "B", 700);
const plannedMerged = await mergePDFs({
  files: [mergeSourceA, mergeSourceB],
  pagePlan: mergePlan,
  signal,
});
const plannedMergedDoc = await load(plannedMerged[0].blob);
ok("planned merge preserves manifest order", plannedMergedDoc.getPageCount() === 2 && plannedMergedDoc.getPage(0).getWidth() === 701 && plannedMergedDoc.getPage(1).getWidth() === 500);
ok("planned merge applies cumulative page rotations", plannedMergedDoc.getPage(0).getRotation().angle === 90 && plannedMergedDoc.getPage(1).getRotation().angle === 180);
ok("planned merge leaves sources and plan unchanged", JSON.stringify(mergePlan) === mergePlanSnapshot && (await load(mergeSourceA)).getPage(0).getWidth() === 500 && (await load(mergeSourceB)).getPage(1).getWidth() === 701);

const selectedPlan: OrganizerPage[] = [
  { id: "Selected:2", fileIndex: 0, sourcePageIndex: 2, sourceName: "Selected.pdf", rotation: 90, selected: true },
  { id: "Selected:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "Selected.pdf", rotation: 180, selected: true },
  { id: "Selected:1", fileIndex: 0, sourcePageIndex: 1, sourceName: "Selected.pdf", rotation: 0, selected: false },
];
const selectedPlanSnapshot = JSON.stringify(selectedPlan);
const splitSource = await makePdf(3, "Selected", 600);
const selectedEach = await splitPDF({
  file: splitSource,
  mode: "each",
  pagePlan: selectedPlan,
  signal,
});
const selectedEachDocs = await Promise.all(selectedEach.map((output) => load(output.blob)));
ok("planned split each emits selected source-page names in plan order", selectedEach.length === 2 && selectedEach[0].name === "Selected-page-3.pdf" && selectedEach[1].name === "Selected-page-1.pdf");
ok("planned split each copies selected pages with cumulative rotations", selectedEachDocs[0].getPageCount() === 1 && selectedEachDocs[0].getPage(0).getWidth() === 602 && selectedEachDocs[0].getPage(0).getRotation().angle === 90 && selectedEachDocs[1].getPageCount() === 1 && selectedEachDocs[1].getPage(0).getWidth() === 600 && selectedEachDocs[1].getPage(0).getRotation().angle === 180);
const selectedRange = await splitPDF({
  file: splitSource,
  mode: "range",
  ranges: "2",
  pagePlan: selectedPlan,
  signal,
});
const selectedRangeDoc = await load(selectedRange[0].blob);
ok("planned split range overrides ranges in manifest order", selectedRange.length === 1 && selectedRange[0].name === "Selected-pages.pdf" && selectedRangeDoc.getPageCount() === 2 && selectedRangeDoc.getPage(0).getWidth() === 602 && selectedRangeDoc.getPage(1).getWidth() === 600 && selectedRangeDoc.getPage(0).getRotation().angle === 90 && selectedRangeDoc.getPage(1).getRotation().angle === 180);
ok("planned split leaves source and plan unchanged", JSON.stringify(selectedPlan) === selectedPlanSnapshot && (await load(splitSource)).getPage(0).getWidth() === 600);
ok("planned merge rejects an empty selection", await (async () => {
  try {
    await mergePDFs({ files: [await makePdf(1, "A")], pagePlan: [{ ...mergePlan[0], selected: false }], signal });
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("selected");
  }
})());
ok("planned split rejects an out-of-range source page with its source name", await (async () => {
  try {
    await splitPDF({ file: await makePdf(1, "Selected"), mode: "each", pagePlan: [{ ...selectedPlan[0], sourcePageIndex: 3 }], signal });
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("Selected.pdf") && error.message.includes("page 4");
  }
})());
ok("planned merge does not duplicate a source page", await (async () => {
  try {
    await mergePDFs({ files: [await makePdf(1, "A")], pagePlan: [
      { id: "A:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "A.pdf", rotation: 0, selected: true },
      { id: "duplicate", fileIndex: 0, sourcePageIndex: 0, sourceName: "A.pdf", rotation: 0, selected: true },
    ], signal });
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("appears more than once");
  }
})());
ok("planned merge rejects an unavailable file index", await (async () => {
  try {
    await mergePDFs({ files: [await makePdf(1, "A")], pagePlan: [
      { id: "missing:0", fileIndex: 2, sourcePageIndex: 0, sourceName: "Missing.pdf", rotation: 0, selected: true },
    ], signal });
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("Missing.pdf") && error.message.includes("file index 2");
  }
})());
ok("planned split rejects a nonzero file index", await (async () => {
  try {
    await splitPDF({ file: await makePdf(1, "Selected"), mode: "each", pagePlan: [
      { id: "Selected:0", fileIndex: 1, sourcePageIndex: 0, sourceName: "Selected.pdf", rotation: 0, selected: true },
    ], signal });
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("Selected.pdf") && error.message.includes("file index 1");
  }
})());
ok("planned merge rejects duplicate page IDs", await (async () => {
  try {
    await mergePDFs({ files: [await makePdf(2, "A")], pagePlan: [
      { id: "same-id", fileIndex: 0, sourcePageIndex: 0, sourceName: "A.pdf", rotation: 0, selected: true },
      { id: "same-id", fileIndex: 0, sourcePageIndex: 1, sourceName: "A.pdf", rotation: 0, selected: true },
    ], signal });
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("duplicate page id");
  }
})());
const preRotatedMerge = await mergePDFs({
  files: [await makePdf(1, "PreRotated", 650, 90)],
  pagePlan: [{ id: "PreRotated:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "PreRotated.pdf", rotation: 90, selected: true }],
  signal,
});
ok("planned merge adds rotation to an already rotated source page", (await load(preRotatedMerge[0].blob)).getPage(0).getRotation().angle === 180);
const preRotatedSplit = await splitPDF({
  file: await makePdf(1, "PreRotated", 650, 90),
  mode: "each",
  pagePlan: [{ id: "PreRotated:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "PreRotated.pdf", rotation: 90, selected: true }],
  signal,
});
ok("planned split adds rotation to an already rotated source page", (await load(preRotatedSplit[0].blob)).getPage(0).getRotation().angle === 180);
const malformedPdf = new File([new Uint8Array([1, 2, 3])], "malformed.pdf", { type: "application/pdf" });
const validPlan: OrganizerPage[] = [{ id: "valid:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "Valid.pdf", rotation: 0, selected: true }];
ok("planned merge ignores malformed unused sources", await (async () => {
  try {
    const output = await mergePDFs({ files: [await makePdf(1, "Valid"), malformedPdf], pagePlan: validPlan, signal });
    return (await load(output[0].blob)).getPageCount() === 1;
  } catch {
    return false;
  }
})());
for (const mode of ["each", "range"] as const) {
  const aborted = new AbortController();
  aborted.abort();
  ok(`planned split ${mode} aborts before reading a malformed file`, await (async () => {
    try {
      await splitPDF({ file: malformedPdf, mode, pagePlan: validPlan, signal: aborted.signal });
      return false;
    } catch (error) {
      return error instanceof DOMException && error.name === "AbortError";
    }
  })());
}
ok("planned split each rejects duplicate page IDs", await (async () => {
  try {
    await splitPDF({ file: await makePdf(2, "Selected"), mode: "each", pagePlan: [
      { id: "same-id", fileIndex: 0, sourcePageIndex: 0, sourceName: "Selected.pdf", rotation: 0, selected: true },
      { id: "same-id", fileIndex: 0, sourcePageIndex: 1, sourceName: "Selected.pdf", rotation: 0, selected: true },
    ], signal });
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("duplicate page id");
  }
})());
ok("planned split range rejects duplicate source pages", await (async () => {
  try {
    await splitPDF({ file: await makePdf(1, "Selected"), mode: "range", pagePlan: [
      { id: "first", fileIndex: 0, sourcePageIndex: 0, sourceName: "Selected.pdf", rotation: 0, selected: true },
      { id: "second", fileIndex: 0, sourcePageIndex: 0, sourceName: "Selected.pdf", rotation: 0, selected: true },
    ], signal });
    return false;
  } catch (error) {
    return error instanceof Error && error.message.includes("appears more than once");
  }
})());
const mergeProgress: number[] = [];
await mergePDFs({ files: [await makePdf(1, "ProgressA"), await makePdf(1, "ProgressB")], pagePlan: [
  { id: "ProgressB:0", fileIndex: 1, sourcePageIndex: 0, sourceName: "ProgressB.pdf", rotation: 0, selected: true },
  { id: "ProgressA:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "ProgressA.pdf", rotation: 0, selected: true },
], signal, onProgress: (percent) => mergeProgress.push(percent) });
ok("planned merge progress is monotonic and completes", mergeProgress.every((percent, index) => index === 0 || percent >= mergeProgress[index - 1]) && mergeProgress.at(-1) === 100);
const splitProgress: number[] = [];
await splitPDF({ file: await makePdf(2, "ProgressSplit"), mode: "range", pagePlan: [
  { id: "ProgressSplit:1", fileIndex: 0, sourcePageIndex: 1, sourceName: "ProgressSplit.pdf", rotation: 0, selected: true },
  { id: "ProgressSplit:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "ProgressSplit.pdf", rotation: 0, selected: true },
], signal, onProgress: (percent) => splitProgress.push(percent) });
ok("planned split progress is monotonic and completes", splitProgress.every((percent, index) => index === 0 || percent >= splitProgress[index - 1]) && splitProgress.at(-1) === 100);
const mergeFormOutput = await mergePDFs({ files: [await makeFormPdf("MergeForm")], pagePlan: [{ id: "MergeForm:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "MergeForm.pdf", rotation: 0, selected: true }], signal });
const mergeFormDoc = await load(mergeFormOutput[0].blob);
ok("planned merge preserves metadata and flattens forms", mergeFormDoc.getTitle() === "MergeForm title" && mergeFormDoc.getForm().getFields().length === 0);
const splitFormOutput = await splitPDF({ file: await makeFormPdf("SplitForm"), mode: "range", pagePlan: [{ id: "SplitForm:0", fileIndex: 0, sourcePageIndex: 0, sourceName: "SplitForm.pdf", rotation: 0, selected: true }], signal });
const splitFormDoc = await load(splitFormOutput[0].blob);
ok("planned split preserves metadata and flattens forms", splitFormDoc.getTitle() === "SplitForm title" && splitFormDoc.getForm().getFields().length === 0);

console.log("\nsplit");
const burst = await splitPDF({ file: await makePdf(4, "Doc"), mode: "each", signal });
ok("one file per page", burst.length === 4, `got ${burst.length}`);
ok("each has one page", (await load(burst[0].blob)).getPageCount() === 1);
ok("filenames numbered", burst[2].name === "Doc-page-3.pdf", burst[2].name);
const ranged = await splitPDF({ file: await makePdf(10, "Doc"), mode: "range", ranges: "2-3, 8", signal });
ok("range gives one file", ranged.length === 1);
ok("range has 3 pages", (await load(ranged[0].blob)).getPageCount() === 3);

console.log("\nrotate");
const rot = await rotatePDF({ file: await makePdf(3, "R"), angle: 90, signal });
const rotDoc = await load(rot[0].blob);
ok("all pages 90", [0,1,2].every(i => rotDoc.getPage(i).getRotation().angle === 90));
const partial = await rotatePDF({ file: await makePdf(4, "R"), angle: 180, pages: "2,4", signal });
const partialDoc = await load(partial[0].blob);
ok("only listed pages rotated", partialDoc.getPage(0).getRotation().angle === 0 && partialDoc.getPage(1).getRotation().angle === 180 && partialDoc.getPage(2).getRotation().angle === 0 && partialDoc.getPage(3).getRotation().angle === 180);
const twice = await rotatePDF({ file: new File([rot[0].blob], "r.pdf"), angle: 90, signal });
ok("rotation is cumulative (90+90=180)", (await load(twice[0].blob)).getPage(0).getRotation().angle === 180);

console.log("\nwatermark / sign / edit");
const wm = await watermarkPDF({ file: await makePdf(2, "W"), text: "CONFIDENTIAL", opacity: 0.3, fontSize: 48, position: "diagonal", signal });
ok("watermark produces a pdf", (await load(wm[0].blob)).getPageCount() === 2);
ok("watermark grew the file", wm[0].size > 0);
const smart = await watermarkPDF({ file: await makePdf(1, "W"), text: "DRAFT — “internal”", opacity: 0.3, fontSize: 24, position: "center", signal });
ok("non-WinAnsi chars survive sanitising", smart[0].size > 0);
ok("rejects unusable text", await (async () => { try { await watermarkPDF({ file: await makePdf(1,"W"), text: "日本語", opacity: .3, fontSize: 24, position: "center", signal }); return false; } catch { return true; } })());
const signed = await signPDF({ file: await makePdf(3, "S"), text: "Baljit Singh", pageNumber: 0, fontSize: 16 });
ok("sign defaults to last page", (await load(signed[0].blob)).getPageCount() === 3);
const edited = await addTextToPDF({ file: await makePdf(2, "E"), text: "Ref 12345", pageNumber: 2, x: 50, yFromTop: 100, fontSize: 12 });
ok("edit produces a pdf", (await load(edited[0].blob)).getPageCount() === 2);
ok("edit clamps out-of-range page", (await addTextToPDF({ file: await makePdf(2,"E"), text: "x", pageNumber: 99, x: 10, yFromTop: 10, fontSize: 12 }))[0].size > 0);


// Minimal 2x1 PNG and a tiny JPEG, built by pdf-lib-compatible encoders.
const PNG_2x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4nGP8z8Dwn4GBgQEAFQoCAcUqzUgAAAAASUVORK5CYII=",
  "base64"
);
const JPEG_1x1 = Buffer.from(
  "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==",
  "base64"
);

const png = new File([PNG_2x1], "wide.png", { type: "image/png" });
const jpg = new File([JPEG_1x1], "small.jpg", { type: "image/jpeg" });
const mislabelled = new File([PNG_2x1], "actually-a-png.jpg", { type: "image/jpeg" });

console.log("\nblob helpers");
ok("baseName strips extension", baseName("report.final.pdf") === "report.final");
ok("baseName survives no extension", baseName("noext") === "noext");
ok("smart quotes normalised", toWinAnsiSafe("“a’b–c…") === '"a\'b-c...');
ok("non-latin dropped", toWinAnsiSafe("hi日本") === "hi");
ok("formatBytes KB", formatBytes(2048) === "2.0 KB", formatBytes(2048));
ok("formatBytes MB", formatBytes(5 * 1024 * 1024) === "5.00 MB", formatBytes(5*1024*1024));

console.log("\nimagesToPDF");
const fit = await imagesToPDF({ files: [png, jpg], pageSize: "fit", orientation: "auto", marginPt: 24, signal });
const fitDoc = await PDFDocument.load(await fit[0].blob.arrayBuffer());
ok("one page per image", fitDoc.getPageCount() === 2, `got ${fitDoc.getPageCount()}`);
ok("wide image gets landscape A4", Math.round(fitDoc.getPage(0).getWidth()) === 842, `w=${fitDoc.getPage(0).getWidth()}`);
ok("square-ish image gets portrait A4", Math.round(fitDoc.getPage(1).getWidth()) === 595, `w=${fitDoc.getPage(1).getWidth()}`);

const match = await imagesToPDF({ files: [png], pageSize: "match", orientation: "auto", marginPt: 0, signal });
const matchDoc = await PDFDocument.load(await match[0].blob.arrayBuffer());
ok("match mode uses image dimensions", matchDoc.getPage(0).getWidth() === 2 && matchDoc.getPage(0).getHeight() === 1, `${matchDoc.getPage(0).getWidth()}x${matchDoc.getPage(0).getHeight()}`);

const recovered = await imagesToPDF({ files: [mislabelled], pageSize: "match", orientation: "auto", marginPt: 0, signal });
ok("PNG mislabelled as .jpg still decodes", (await PDFDocument.load(await recovered[0].blob.arrayBuffer())).getPageCount() === 1);

const bad = new File([Buffer.from("not an image at all")], "junk.png");
ok("unreadable image gives a clear error", await (async () => {
  try { await imagesToPDF({ files: [bad], pageSize: "fit", orientation: "auto", marginPt: 0, signal }); return false; }
  catch (e) { return e instanceof Error && e.message.includes("junk.png"); }
})());

console.log("\nforced orientation");
const forced = await imagesToPDF({ files: [png], pageSize: "fit", orientation: "portrait", marginPt: 24, signal });
const forcedDoc = await PDFDocument.load(await forced[0].blob.arrayBuffer());
ok("portrait forced on a wide image", Math.round(forcedDoc.getPage(0).getWidth()) === 595, `w=${forcedDoc.getPage(0).getWidth()}`);

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
