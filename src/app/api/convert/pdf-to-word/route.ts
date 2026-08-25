import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLOUDCONVERT_API = "https://api.cloudconvert.com/v2";
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 6;

type RateLimitEntry = { count: number; resetAt: number };
const requestLimits = new Map<string, RateLimitEntry>();

function clientKey(req: Request): string {
  return req.headers.get("cf-connecting-ip")
    ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

/** Per-instance backstop. Deployments that need shared global limits should add a durable store. */
function takeRateLimit(req: Request): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const key = clientKey(req);
  const entry = requestLimits.get(key);
  if (!entry || entry.resetAt <= now) {
    requestLimits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  entry.count += 1;
  return { allowed: true };
}

function looksLikePdf(bytes: ArrayBuffer): boolean {
  const signature = new Uint8Array(bytes.slice(0, 5));
  return signature.length === 5 && String.fromCharCode(...signature) === "%PDF-";
}

function outputFilename(name: string): string {
  const stem = name.replace(/\.pdf$/i, "") || "converted-document";
  return `${stem.replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 120)}.docx`;
}

async function waitForJob(jobId: string, apiKey: string) {
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${CLOUDCONVERT_API}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error("Failed to check conversion status.");
    const data = await res.json();
    const status = data?.data?.status;
    if (status === "finished") return data;
    if (status === "error") throw new Error("Conversion failed on server.");
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Conversion timed out. Try again.");
}

export async function POST(req: Request) {
  const limit = takeRateLimit(req);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many conversion requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey) {
      console.error("PDF to Word is unavailable: CLOUDCONVERT_API_KEY is not configured.");
      return NextResponse.json({ error: "PDF to Word is temporarily unavailable." }, { status: 503 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose a PDF file to convert." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "PDF to Word accepts files up to 25 MB." }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (!looksLikePdf(arrayBuffer)) {
      return NextResponse.json({ error: "Only valid PDF files are supported." }, { status: 400 });
    }
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const jobRes = await fetch(`${CLOUDCONVERT_API}/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          "import-1": { operation: "import/base64", file: base64, filename: file.name },
          "convert-1": {
            operation: "convert",
            input: "import-1",
            input_format: "pdf",
            output_format: "docx",
          },
          "export-1": { operation: "export/url", input: "convert-1", inline: false },
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!jobRes.ok) throw new Error("CloudConvert did not accept the conversion job.");

    const jobData = await jobRes.json();
    const jobId = jobData?.data?.id;
    if (!jobId) throw new Error("CloudConvert returned an invalid conversion job.");

    const completed = await waitForJob(jobId, apiKey);
    type ExportTask = { name?: string; result?: { files?: Array<{ url?: string }> } };
    const tasks = completed?.data?.tasks as ExportTask[] | undefined;
    const fileUrl = tasks?.find((task) => task.name === "export-1")?.result?.files?.[0]?.url;
    if (!fileUrl) throw new Error("CloudConvert did not return an output file.");

    const fileRes = await fetch(fileUrl, { signal: AbortSignal.timeout(30_000) });
    if (!fileRes.ok) throw new Error("CloudConvert output download failed.");

    const blob = await fileRes.arrayBuffer();
    return new NextResponse(blob, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${outputFilename(file.name)}"`,
      },
    });
  } catch (error) {
    console.error("PDF to Word conversion failed.", error);
    return NextResponse.json(
      { error: "Conversion failed. Please check the PDF and try again shortly." },
      { status: 502 }
    );
  }
}
