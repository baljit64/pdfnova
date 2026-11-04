import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const config = await readFile(path.join(root, "next.config.js"), "utf8");
const canonicalRoute = await readFile(
  path.join(root, "src/app/api/pdfjs/[asset]/route.ts"),
  "utf8"
);
const legacyRoute = await readFile(
  path.join(root, "src/app/api/pdfs/[asset]/route.ts"),
  "utf8"
);

for (const asset of ["pdf.mjs", "pdf.worker.min.mjs"]) {
  await access(path.join(root, "node_modules/pdfjs-dist/build", asset));
  assert.ok(canonicalRoute.includes(asset), `canonical route must serve ${asset}`);
  assert.ok(config.includes(`./node_modules/pdfjs-dist/build/${asset}`));
}

assert.match(legacyRoute, /from ["']\.\.\/\.\.\/pdfjs\/\[asset\]\/route["']/);
assert.match(legacyRoute, /export \{ GET, runtime \}/);
assert.match(config, /["']\/api\/pdfjs\/\[asset\]["']/);
assert.match(config, /["']\/api\/pdfs\/\[asset\]["']/);

console.log("PDF.js assets are present, traced for Vercel, and available on both route paths.");
