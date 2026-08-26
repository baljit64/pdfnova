import { rm } from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const buildDirectory = path.join(workspace, ".next");

if (path.dirname(buildDirectory) !== workspace || path.basename(buildDirectory) !== ".next") {
  throw new Error("Refusing to clean an unexpected build directory.");
}

await rm(buildDirectory, { recursive: true, force: true });
console.log("Removed generated .next output.");
