import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const workspace = process.cwd();
const buildDirectory = path.join(workspace, ".next");

if (path.dirname(buildDirectory) !== workspace || path.basename(buildDirectory) !== ".next") {
  throw new Error("Refusing to clean an unexpected build directory.");
}

// Build providers can mount .next/cache. Preserve it and its parent so cleaning
// generated output never attempts to remove a mounted directory.
const entries = await readdir(buildDirectory).catch((error) => {
  if (error.code === "ENOENT") return [];
  throw error;
});

await Promise.all(
  entries
    .filter((entry) => entry !== "cache")
    .map((entry) => rm(path.join(buildDirectory, entry), { recursive: true, force: true })),
);
console.log("Removed generated .next output (preserved .next/cache).");
