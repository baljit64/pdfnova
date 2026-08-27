"use client";

import { Button } from "antd";
import {
  ArrowDown,
  ArrowUp,
  FileText,
  RotateCw,
  Trash2,
} from "lucide-react";
import { formatBytes } from "../../tools/engine/blob";
import type { FileListControls } from "../../tools/types";

interface Props {
  files: File[];
  rotations: number[];
  controls?: FileListControls;
  minFiles: number;
  disabled?: boolean;
  onMove: (from: number, to: number) => void;
  onRemove: (index: number) => void;
  onRotate: (index: number) => void;
}

/**
 * The selected-file list, with reordering, rotation and removal gated by whatever
 * the tool declared it supports. Rendered as an ordered list so assistive tech
 * announces the page order the output will use.
 */
export default function SelectedFiles({
  files,
  rotations,
  controls,
  minFiles,
  disabled,
  onMove,
  onRemove,
  onRotate,
}: Props) {
  if (files.length === 0) return null;

  const canReorder = !!controls?.reorder && files.length > 1;
  const canRemove = !!controls?.remove;
  const canRotate = !!controls?.rotate;

  return (
    <section className="mt-7" aria-label="Selected files">
      <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-bold text-[var(--text-primary)]">
        {files.length} file{files.length === 1 ? "" : "s"} selected
        {canReorder ? " — they will be processed in this order" : ""}
      </h2>
      <span className="rounded-full bg-[var(--success-soft)] px-2.5 py-1 text-xs font-bold text-[var(--success)]">Ready</span>
      </div>

      <ol className="space-y-3">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${file.size}-${index}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-[var(--shadow-xs)]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]"><FileText className="h-5 w-5" /></span>
              <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {canReorder && (
                  <span className="mr-2 text-[var(--text-muted)]" aria-hidden="true">
                    {index + 1}.
                  </span>
                )}
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                {formatBytes(file.size)}
                {canRotate && (rotations[index] ?? 0) !== 0
                  ? ` · rotated ${rotations[index]}°`
                  : ""}
              </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {canReorder && (
                <>
                  <Button
                    size="small"
                    type="text"
                    disabled={disabled || index === 0}
                    icon={<ArrowUp className="h-4 w-4" />}
                    aria-label={`Move ${file.name} up`}
                    onClick={() => onMove(index, index - 1)}
                  />
                  <Button
                    size="small"
                    type="text"
                    disabled={disabled || index === files.length - 1}
                    icon={<ArrowDown className="h-4 w-4" />}
                    aria-label={`Move ${file.name} down`}
                    onClick={() => onMove(index, index + 1)}
                  />
                </>
              )}

              {canRotate && (
                <Button
                  size="small"
                  disabled={disabled}
                  icon={<RotateCw className="h-4 w-4" />}
                  aria-label={`Rotate ${file.name}. Currently ${rotations[index] ?? 0} degrees`}
                  onClick={() => onRotate(index)}
                >
                  {rotations[index] ?? 0}°
                </Button>
              )}

              {canRemove && (
                <Button
                  size="small"
                  type="text"
                  danger
                  disabled={disabled || files.length <= minFiles}
                  icon={<Trash2 className="h-4 w-4" />}
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemove(index)}
                />
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
