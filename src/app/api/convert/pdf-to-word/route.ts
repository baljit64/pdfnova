import { NextResponse } from "next/server";
import { cloudConvertFile } from "../../../../lib/cloudconvert";
import { takeRateLimit } from "../../../../lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const OCR_LANGUAGES = new Set(["eng", "hin", "spa", "fra", "deu"]);

function looksLikePdf(bytes: ArrayBuffer): boolean {
  const signature = new Uint8Array(bytes.slice(0, 5));
  return signature.length === 5 && String.fromCharCode(...signature) === "%PDF-";
}

function outputFilename(name: string): string {
  const stem = name.replace(/\.pdf$/i, "") || "converted-document";
  return `${stem.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120)}.docx`;
}

export async function POST(request: Request) {
  const limit = await takeRateLimit(request, "pdf-to-word");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many conversion requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a PDF file to convert." }, { status: 400 });
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "PDF to Word accepts files up to 25 MB." }, { status: 413 });
    }
    if (!looksLikePdf(await file.arrayBuffer())) {
      return NextResponse.json({ error: "Only valid PDF files are supported." }, { status: 400 });
    }

    const useOcr = form.get("ocr") === "on";
    const requestedLanguage = String(form.get("ocrLanguage") ?? "eng");
    const language = OCR_LANGUAGES.has(requestedLanguage) ? requestedLanguage : "eng";
    const output = await cloudConvertFile({
      file,
      inputFormat: "pdf",
      outputFormat: "docx",
      intermediateTask: useOcr ? { operation: "pdf/ocr", language: [language] } : undefined,
    });

    return new NextResponse(output, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${outputFilename(file.name)}"`,
      },
    });
  } catch (error) {
    console.error("PDF to Word conversion failed.", error);
    const unavailable = error instanceof Error && error.message.includes("not configured");
    return NextResponse.json(
      { error: unavailable ? "PDF to Word is temporarily unavailable." : "Conversion failed. Please check the PDF and try again shortly." },
      { status: unavailable ? 503 : 502 }
    );
  }
}
