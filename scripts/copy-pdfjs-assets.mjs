import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "node_modules/pdfjs-dist/build");
const destination = path.join(root, "public/pdfjs");

await mkdir(destination, { recursive: true });
for (const asset of ["pdf.mjs", "pdf.worker.min.mjs"]) {
  await copyFile(path.join(source, asset), path.join(destination, asset));
}
