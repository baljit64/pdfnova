"use client";

import { Button, Card } from "antd";
import { DownloadOutlined, UndoOutlined } from "@ant-design/icons";
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
    <section className="space-y-6" aria-label={`${tool.name} results`}>
      <Card className="rounded-xl shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-blue-900">
              Your {tool.outputNoun} {outputs.length === 1 ? "is" : "are"} ready
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {outputs.length} file{outputs.length === 1 ? "" : "s"} · {formatBytes(totalBytes)}
              {notice ? ` · ${notice}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="primary"
              danger
              size="large"
              icon={<DownloadOutlined />}
              onClick={outputs.length === 1 ? () => onDownload(0) : onDownloadAll}
              loading={outputs.length > 1 && archiveBusy}
            >
              {outputs.length === 1
                ? `Download ${outputs[0].name}`
                : archiveBusy
                  ? `Preparing ZIP ${archivePercent}%`
                  : `Download all ${outputs.length} as ZIP`}
            </Button>
            <Button size="large" icon={<UndoOutlined />} onClick={onReset}>
              Start over
            </Button>
          </div>
        </div>

        {showInlineViewer && (
          <div className="mt-5 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
            <iframe
              title={`Preview of ${outputs[0].name}`}
              src={urls[0]}
              className="h-[520px] w-full border-0"
            />
          </div>
        )}
      </Card>

      {outputs.length > 1 && (
        <Card className="rounded-xl shadow-lg">
          <h3 className="mb-4 text-base font-semibold text-blue-900">Individual files</h3>

          {tool.outputKind === "images" ? (
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {outputs.map((output, index) => (
                <li key={output.name} className="rounded-lg border border-gray-200 p-3">
                  {/* Rendered from a local object URL, so next/image would add no value. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={urls[index]}
                    alt={`Page ${index + 1} of the converted document`}
                    className="w-full rounded"
                    loading="lazy"
                  />
                  <p className="mt-2 truncate text-xs text-gray-500">{formatBytes(output.size)}</p>
                  <Button
                    size="small"
                    className="mt-2 w-full"
                    icon={<DownloadOutlined />}
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
                  className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-gray-800">
                      {output.name}
                    </span>
                    <span className="text-xs text-gray-500">{formatBytes(output.size)}</span>
                  </span>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
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
