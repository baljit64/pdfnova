import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLOUDCONVERT_API = "https://api.cloudconvert.com/v2";

async function waitForJob(jobId: string, apiKey: string) {
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${CLOUDCONVERT_API}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
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
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing CLOUDCONVERT_API_KEY" },
      { status: 500 }
    );
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!file.type.includes("pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const jobRes = await fetch(`${CLOUDCONVERT_API}/jobs`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tasks: {
        "import-1": {
          operation: "import/base64",
          file: base64,
          filename: file.name,
        },
        "convert-1": {
          operation: "convert",
          input: "import-1",
          input_format: "pdf",
          output_format: "docx",
        },
        "export-1": {
          operation: "export/url",
          input: "convert-1",
          inline: false,
        },
      },
    }),
  });

  if (!jobRes.ok) {
    const msg = await jobRes.text();
    return NextResponse.json({ error: msg || "Failed to start conversion." }, { status: 500 });
  }

  const jobData = await jobRes.json();
  const jobId = jobData?.data?.id;
  if (!jobId) {
    return NextResponse.json({ error: "Invalid conversion job." }, { status: 500 });
  }

  const completed = await waitForJob(jobId, apiKey);
  type ExportTask = {
    name?: string;
    result?: { files?: Array<{ url?: string }> };
  };
  const tasks = completed?.data?.tasks as ExportTask[] | undefined;
  const exportTask = tasks?.find((t) => t.name === "export-1");
  const fileUrl = exportTask?.result?.files?.[0]?.url;
  if (!fileUrl) {
    return NextResponse.json({ error: "Failed to retrieve converted file." }, { status: 500 });
  }

  const fileRes = await fetch(fileUrl);
  if (!fileRes.ok) {
    return NextResponse.json({ error: "Failed to download converted file." }, { status: 500 });
  }

  const blob = await fileRes.arrayBuffer();
  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${file.name.replace(/\.pdf$/i, "")}.docx"`,
    },
  });
}
