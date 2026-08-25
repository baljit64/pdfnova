import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ASSETS = {
  "pdf.mjs": "build/pdf.mjs",
  "pdf.worker.min.mjs": "build/pdf.worker.min.mjs",
} as const;

type AssetName = keyof typeof ASSETS;

function isAssetName(asset: string): asset is AssetName {
  return asset in ASSETS;
}

/** Serve the immutable PDF.js browser modules without routing them through webpack. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ asset: string }> }
) {
  const { asset } = await params;
  if (!isAssetName(asset)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contents = await readFile(path.join(process.cwd(), "node_modules", "pdfjs-dist", ASSETS[asset]));
  return new NextResponse(contents, {
    headers: {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
