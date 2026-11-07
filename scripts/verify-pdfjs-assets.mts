import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
for (const asset of ["pdf.mjs", "pdf.worker.min.mjs"]) {
  await access(path.join(root, "node_modules/pdfjs-dist/build", asset));
}

const raster = await readFile(path.join(root, "src/tools/engine/raster.ts"), "utf8");
const viewer = await readFile(path.join(root, "src/components/tool/PdfResultViewer.tsx"), "utf8");
assert.match(raster, /\/pdfjs\/pdf\.mjs/);
assert.match(viewer, /\/pdfjs\/pdf\.mjs/);
assert.match(await readFile(path.join(root, "package.json"), "utf8"), /sync:pdfjs-assets/);

console.log("PDF.js browser assets are present in the public static directory.");
