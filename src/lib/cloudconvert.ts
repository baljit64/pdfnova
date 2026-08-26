import "server-only";

const CLOUDCONVERT_API = "https://api.cloudconvert.com/v2";
type Task = Record<string, unknown>;

async function waitForJob(jobId: string, apiKey: string) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const response = await fetch(`${CLOUDCONVERT_API}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15_000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to check conversion status.");
    const payload = await response.json();
    if (payload?.data?.status === "finished") return payload;
    if (payload?.data?.status === "error") throw new Error("Conversion failed on server.");
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  throw new Error("Conversion timed out. Try again.");
}

export async function cloudConvertFile({
  file,
  inputFormat,
  outputFormat,
  intermediateTask,
}: {
  file: File;
  inputFormat: string;
  outputFormat: string;
  intermediateTask?: Task;
}): Promise<ArrayBuffer> {
  const apiKey = process.env.CLOUDCONVERT_API_KEY;
  if (!apiKey) throw new Error("The conversion service is not configured.");

  const tasks: Record<string, Task> = {
    "import-1": {
      operation: "import/base64",
      file: Buffer.from(await file.arrayBuffer()).toString("base64"),
      filename: file.name,
    },
  };
  const conversionInput = intermediateTask ? "intermediate-1" : "import-1";
  if (intermediateTask) tasks[conversionInput] = { ...intermediateTask, input: "import-1" };
  tasks["convert-1"] = {
    operation: "convert",
    input: conversionInput,
    input_format: inputFormat,
    output_format: outputFormat,
  };
  tasks["export-1"] = { operation: "export/url", input: "convert-1", inline: false };

  const jobResponse = await fetch(`${CLOUDCONVERT_API}/jobs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ tasks }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!jobResponse.ok) throw new Error("The conversion service did not accept the job.");
  const job = await jobResponse.json();
  const jobId = job?.data?.id;
  if (!jobId) throw new Error("The conversion service returned an invalid job.");

  const completed = await waitForJob(jobId, apiKey);
  type ExportTask = { name?: string; result?: { files?: Array<{ url?: string }> } };
  const exportUrl = (completed?.data?.tasks as ExportTask[] | undefined)
    ?.find((task) => task.name === "export-1")?.result?.files?.[0]?.url;
  if (!exportUrl) throw new Error("The conversion service returned no output file.");

  const output = await fetch(exportUrl, { signal: AbortSignal.timeout(30_000), cache: "no-store" });
  if (!output.ok) throw new Error("The converted file could not be downloaded.");
  return output.arrayBuffer();
}
