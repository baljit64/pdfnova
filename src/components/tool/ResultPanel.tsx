"use client";

import { Button, Card } from "antd";
import { CheckCircle2, Download, FileText, RotateCcw } from "lucide-react";
import { formatBytes } from "../../tools/engine/blob";
import type { ToolDefinition, ToolOutput } from "../../tools/types";

interface Props {
  tool: ToolDefinition;
  outputs: ToolOutput[];
  /** Object URLs aligned to `outputs`, owned and revoked by the workspace. */
  urls: string[];
  notice?: string;
  onDownload: (index: number) => void;
  onDownloadAll: () => void;
  archiveBusy: boolean;
  archivePercent: number;
  onReset: () => void;
}

/**
 * Results view. A single PDF gets an inline viewer; image sets get a thumbnail
 * grid; anything else is download-only.
 */
export default function ResultPanel({
  tool,
  outputs,
  urls,
  notice,
  onDownload,
  onDownloadAll,
  archiveBusy,
  archivePercent,
  onReset,
}: Props) {
  const showInlineViewer = outputs.length === 1 && outputs[0].kind === "pdf";
  const totalBytes = outputs.reduce((sum, output) => sum + output.size, 0);

  return (
    <section className="pdfnova-workspace space-y-6" aria-label={`${tool.name} results`}>
      <Card className="!rounded-2xl !border-[var(--border)] !shadow-[var(--shadow-md)]" styles={{ body: { padding: 28 } }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--success-soft)] text-[var(--success)]"><CheckCircle2 className="h-6 w-6" /></span>
            <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Your {tool.outputNoun} {outputs.length === 1 ? "is" : "are"} ready
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {outputs.length} file{outputs.length === 1 ? "" : "s"} · {formatBytes(totalBytes)}
              {notice ? ` · ${notice}` : ""}
            </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              danger
              size="large"
              icon={<Download className="h-4 w-4" />}
              onClick={outputs.length === 1 ? () => onDownload(0) : onDownloadAll}
              loading={outputs.length > 1 && archiveBusy}
            >
              {outputs.length === 1
                ? `Download ${outputs[0].name}`
                : archiveBusy
                  ? `Preparing ZIP ${archivePercent}%`
                  : `Download all ${outputs.length} as ZIP`}
            </Button>
            <Button size="large" icon={<RotateCcw className="h-4 w-4" />} onClick={onReset}>
              Start over
            </Button>
          </div>
        </div>

        {showInlineViewer && (
          <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--page)]">
            <iframe
              title={`Preview of ${outputs[0].name}`}
              src={urls[0]}
              className="h-[520px] w-full border-0"
            />
          </div>
        )}
      </Card>

      {outputs.length > 1 && (
        <Card className="!rounded-2xl !border-[var(--border)] !shadow-[var(--shadow-sm)]" styles={{ body: { padding: 28 } }}>
          <h3 className="mb-4 text-base font-bold text-[var(--text-primary)]">Individual files</h3>

          {tool.outputKind === "images" ? (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {outputs.map((output, index) => (
                <li key={output.name} className="rounded-xl border border-[var(--border)] p-3 shadow-[var(--shadow-xs)]">
                  {/* Rendered from a local object URL, so next/image would add no value. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urls[index]}
                    alt={`Page ${index + 1} of the converted document`}
                    className="w-full rounded"
                    loading="lazy"
                  />
                  <p className="mt-2 truncate text-xs text-[var(--text-muted)]">{formatBytes(output.size)}</p>
                  <Button
                    size="small"
                    className="mt-2 w-full"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => onDownload(index)}
                  >
                    Page {index + 1}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="space-y-2">
              {outputs.map((output, index) => (
                <li
                  key={output.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                    <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                      {output.name}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{formatBytes(output.size)}</span>
                    </span>
                  </span>
                  <Button
                    size="small"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => onDownload(index)}
                    aria-label={`Download ${output.name}`}
                  >
                    Download
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </section>
  );
}
