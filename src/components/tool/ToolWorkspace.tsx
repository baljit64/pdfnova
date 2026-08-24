"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Progress } from "antd";
import { getRunner } from "../../tools/runners";
import { defaultOptions } from "../../tools/registry";
import { formatBytes } from "../../tools/engine/blob";
import { track } from "../../analytics/track";
import FileDropzone from "./FileDropzone";
import OptionsForm from "./OptionsForm";
import ResultPanel from "./ResultPanel";
import SelectedFiles from "./SelectedFiles";
import type {
  OptionValue,
  OptionValues,
  ToolDefinition,
  ToolOutput,
} from "../../tools/types";

interface Props {
  tool: ToolDefinition;
  /** Route this instance is mounted on, for analytics attribution. */
  page: string;
  /** Landing variation id, or "canonical" on the parent tool route. */
  variation: string;
}

type Phase = "idle" | "running" | "done" | "error";

const ROTATION_STEPS = [0, 90, 180, 270];

/**
 * The single interactive surface for every PDFNova tool.
 *
 * `/merge-pdf` and `/merge-pdf-on-mac` render this same component with the same
 * tool descriptor, so a landing page is never a degraded copy of the real tool.
 */
export default function ToolWorkspace({ tool, page, variation }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [rotations, setRotations] = useState<number[]>([]);
  const [options, setOptions] = useState<OptionValues>(() => defaultOptions(tool));
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<ToolOutput[]>([]);
  const [notice, setNotice] = useState<string | undefined>();
  const [rejection, setRejection] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const urlsRef = useRef<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);

  const analyticsBase = useMemo(
    () => ({ tool: tool.id, page, variation }),
    [tool.id, page, variation]
  );

  const releaseUrls = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
    setUrls([]);
  }, []);

  // Object URLs outlive a single render, so they are revoked explicitly.
  useEffect(() => releaseUrls, [releaseUrls]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const validate = useCallback(
    (incoming: File[], existingCount: number): { accepted: File[]; problem?: string } => {
      const accepted: File[] = [];
      const problems: string[] = [];

      for (const file of incoming) {
        const name = file.name.toLowerCase();
        if (!tool.extensions.some((extension) => name.endsWith(extension))) {
          problems.push(`${file.name} is not a ${tool.acceptLabel} file.`);
          continue;
        }
        if (file.size === 0) {
          problems.push(`${file.name} is empty.`);
          continue;
        }
        if (file.size > tool.maxFileSizeMB * 1024 * 1024) {
          problems.push(
            `${file.name} is ${formatBytes(file.size)} — the limit is ${tool.maxFileSizeMB} MB.`
          );
          continue;
        }
        if (existingCount + accepted.length >= tool.maxFiles) {
          problems.push(`You can process up to ${tool.maxFiles} files at a time.`);
          break;
        }
        accepted.push(file);
      }

      return { accepted, problem: problems.length > 0 ? problems.join(" ") : undefined };
    },
    [tool]
  );

  const handleFiles = useCallback(
    (incoming: File[]) => {
      track("upload_started", { ...analyticsBase, fileCount: incoming.length });

      const base = tool.multiple ? files : [];
      const { accepted, problem } = validate(incoming, base.length);

      setRejection(problem ?? null);
      if (problem) {
        // Keep the useful file-specific explanation on screen, but never copy a
        // selected filename into analytics.
        track("upload_rejected", { ...analyticsBase, errorMessage: "File validation failed" });
      }
      if (accepted.length === 0) return;

      const next = tool.multiple ? [...base, ...accepted] : accepted.slice(0, 1);
      setFiles(next);
      setRotations(next.map((_, index) => rotations[index] ?? 0));
      setError(null);
      setPhase("idle");
      setOutputs([]);
      setNotice(undefined);
      releaseUrls();

      track("upload_completed", {
        ...analyticsBase,
        fileCount: next.length,
        totalBytes: next.reduce((sum, file) => sum + file.size, 0),
      });
    },
    [analyticsBase, files, releaseUrls, rotations, tool.multiple, validate]
  );

  const moveFile = useCallback((from: number, to: number) => {
    setFiles((current) => {
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setRotations((current) => {
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((current) => current.filter((_, i) => i !== index));
    setRotations((current) => current.filter((_, i) => i !== index));
  }, []);

  const rotateFile = useCallback((index: number) => {
    setRotations((current) => {
      const next = [...current];
      const step = ROTATION_STEPS.indexOf(next[index] ?? 0);
      next[index] = ROTATION_STEPS[(step + 1) % ROTATION_STEPS.length];
      return next;
    });
  }, []);

  const missingRequired = useMemo(
    () =>
      (tool.options ?? []).some(
        (field) =>
          field.required &&
          field.type === "text" &&
          String(options[field.key] ?? "").trim() === ""
      ),
    [options, tool.options]
  );

  const canRun = files.length >= tool.minFiles && !missingRequired && phase !== "running";

  const run = useCallback(
    async (isRetry: boolean) => {
      if (files.length < tool.minFiles) return;

      const controller = new AbortController();
      abortRef.current = controller;
      const startedAt = Date.now();

      releaseUrls();
      setPhase("running");
      setPercent(0);
      setStatus("Starting");
      setError(null);
      setOutputs([]);
      setNotice(undefined);

      track(isRetry ? "processing_retried" : "processing_started", {
        ...analyticsBase,
        fileCount: files.length,
        totalBytes: files.reduce((sum, file) => sum + file.size, 0),
      });

      try {
        const result = await getRunner(tool.id)({
          files,
          options,
          rotations,
          signal: controller.signal,
          onProgress: (value, message) => {
            setPercent(Math.max(0, Math.min(100, Math.round(value))));
            if (message) setStatus(message);
          },
        });

        if (controller.signal.aborted) return;

        const nextUrls = result.outputs.map((output) => URL.createObjectURL(output.blob));
        urlsRef.current = nextUrls;
        setUrls(nextUrls);
        setOutputs(result.outputs);
        setNotice(result.notice);
        setPercent(100);
        setStatus("Finished");
        setPhase("done");

        track("processing_completed", {
          ...analyticsBase,
          fileCount: files.length,
          outputCount: result.outputs.length,
          durationMs: Date.now() - startedAt,
        });
      } catch (caught) {
        if (controller.signal.aborted || (caught as Error)?.name === "AbortError") {
          setPhase("idle");
          setStatus("");
          setPercent(0);
          track("processing_cancelled", { ...analyticsBase, durationMs: Date.now() - startedAt });
          return;
        }

        const message =
          caught instanceof Error && caught.message
            ? caught.message
            : `We could not ${tool.verb} this file. Please check it opens correctly and try again.`;

        console.error(`[${tool.id}]`, caught);
        setError(message);
        setPhase("error");
        track("processing_failed", {
          ...analyticsBase,
          // Runner errors can contain document-specific details. The UI receives
          // the full message; analytics only needs the failure category.
          errorMessage: "Processing failed",
          durationMs: Date.now() - startedAt,
        });
      } finally {
        abortRef.current = null;
      }
    },
    [analyticsBase, files, options, releaseUrls, rotations, tool.id, tool.minFiles, tool.verb]
  );

  const download = useCallback(
    (index: number) => {
      const output = outputs[index];
      const url = urls[index];
      if (!output || !url) return;

      const link = document.createElement("a");
      link.href = url;
      link.download = output.name;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();

      track("download_clicked", { ...analyticsBase, outputCount: 1, totalBytes: output.size });
    },
    [analyticsBase, outputs, urls]
  );

  const downloadAll = useCallback(() => {
    track("download_all_clicked", { ...analyticsBase, outputCount: outputs.length });
    // Staggered so browsers do not treat the batch as a popup flood.
    outputs.forEach((_, index) => window.setTimeout(() => download(index), index * 350));
  }, [analyticsBase, download, outputs]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    releaseUrls();
    setFiles([]);
    setRotations([]);
    setOptions(defaultOptions(tool));
    setOutputs([]);
    setNotice(undefined);
    setError(null);
    setRejection(null);
    setPercent(0);
    setStatus("");
    setPhase("idle");
    track("tool_reset", analyticsBase);
  }, [analyticsBase, releaseUrls, tool]);

  const updateOption = useCallback((key: string, value: OptionValue) => {
    setOptions((current) => ({ ...current, [key]: value }));
  }, []);

  if (phase === "done" && outputs.length > 0) {
    return (
      <ResultPanel
        tool={tool}
        outputs={outputs}
        urls={urls}
        notice={notice}
        onDownload={download}
        onDownloadAll={downloadAll}
        onReset={reset}
      />
    );
  }

  const running = phase === "running";

  return (
    <Card className="rounded-xl shadow-lg">
      <FileDropzone
        tool={tool}
        onFiles={handleFiles}
        selectedCount={files.length}
        disabled={running}
      />

      {rejection && (
        <div className="mt-4">
          <Alert type="warning" showIcon message={rejection} closable onClose={() => setRejection(null)} />
        </div>
      )}

      <SelectedFiles
        files={files}
        rotations={rotations}
        controls={tool.fileListControls}
        minFiles={tool.minFiles}
        disabled={running}
        onMove={moveFile}
        onRemove={removeFile}
        onRotate={rotateFile}
      />

      {files.length > 0 && (
        <OptionsForm
          fields={tool.options ?? []}
          values={options}
          onChange={updateOption}
          disabled={running}
        />
      )}

      {error && (
        <div className="mt-6">
          <Alert
            type="error"
            showIcon
            message={`We could not finish this ${tool.name.toLowerCase()}`}
            description={error}
            action={
              <Button size="small" danger onClick={() => run(true)}>
                Try again
              </Button>
            }
          />
        </div>
      )}

      <div aria-live="polite" aria-atomic="true" className={running ? "mt-6" : "sr-only"}>
        {running && (
          <>
            <Progress percent={percent} status="active" strokeColor="#ef4444" />
            <p className="mt-1 text-sm text-gray-600">{status || "Working…"}</p>
          </>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button
          type="primary"
          danger
          size="large"
          loading={running}
          disabled={!canRun}
          onClick={() => run(false)}
        >
          {running ? "Working…" : tool.actionLabel}
        </Button>

        {running && <Button size="large" onClick={() => abortRef.current?.abort()}>Cancel</Button>}

        {!running && files.length > 0 && (
          <Button size="large" onClick={reset}>
            Clear files
          </Button>
        )}
      </div>

      {files.length > 0 && files.length < tool.minFiles && (
        <p className="mt-3 text-sm text-gray-500">
          Add at least {tool.minFiles} files to continue.
        </p>
      )}

      {missingRequired && files.length > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          Fill in the required option above to continue.
        </p>
      )}
    </Card>
  );
}
