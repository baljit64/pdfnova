import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { imagesToPDF } from "../src/tools/engine/raster";
import { toWinAnsiSafe, baseName, formatBytes } from "../src/tools/engine/blob";
import { mergePDFs, splitPDF, rotatePDF, watermarkPDF, signPDF, addTextToPDF, parsePageRanges } from "../src/tools/engine/pdf";

const signal = new AbortController().signal;
let pass = 0, fail = 0;
const ok = (name: string, cond: boolean, extra = "") => {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name} ${extra}`); }
};

async function makePdf(pages: number, label: string): Promise<File> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const p = doc.addPage([595, 842]);
    p.drawText(`${label} page ${i + 1}`, { x: 50, y: 780, size: 20, font, color: rgb(0, 0, 0) });
  }
  // Copy into an ArrayBuffer-backed view that is valid as a browser BlobPart.
  return new File([new Uint8Array(await doc.save())], `${label}.pdf`, {
    type: "application/pdf",
  });
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
