import { NextResponse } from "next/server";
import { cloudConvertFile } from "../../../../lib/cloudconvert";
import { takeRateLimit } from "../../../../lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 40 * 1024 * 1024;

function hasWordSignature(bytes: ArrayBuffer, extension: "doc" | "docx"): boolean {
  const signature = new Uint8Array(bytes.slice(0, 8));
  if (extension === "docx") {
    return signature[0] === 0x50 && signature[1] === 0x4b;
  }
  const compoundFile = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  return compoundFile.every((value, index) => signature[index] === value);
}

export async function POST(request: Request) {
  const limit = await takeRateLimit(request, "word-to-pdf");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many conversion requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a Word document to convert." }, { status: 400 });
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "Word to PDF accepts files up to 40 MB." }, { status: 413 });
    }
    const extension = file.name.toLowerCase().endsWith(".docx") ? "docx"
      : file.name.toLowerCase().endsWith(".doc") ? "doc" : null;
    if (!extension) return NextResponse.json({ error: "Only DOC and DOCX files are supported." }, { status: 400 });
    if (!hasWordSignature(await file.arrayBuffer(), extension)) {
      return NextResponse.json({ error: "The selected file is not a valid Word document." }, { status: 400 });
    }

    const output = await cloudConvertFile({ file, inputFormat: extension, outputFormat: "pdf" });
    const stem = file.name.replace(/\.docx?$/i, "") || "converted-document";
    return new NextResponse(output, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${stem.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120)}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Word to PDF conversion failed.", error);
    const unavailable = error instanceof Error && error.message.includes("not configured");
    return NextResponse.json(
      { error: unavailable ? "Word to PDF is temporarily unavailable." : "Conversion failed. Please check the document and try again." },
      { status: unavailable ? 503 : 502 }
    );
  }
}
