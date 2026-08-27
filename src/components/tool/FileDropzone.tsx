"use client";

import { useCallback, useId, useRef, useState } from "react";
import { FileUp, UploadCloud } from "lucide-react";
import { PROCESSING_COPY } from "../../tools/processing";
import type { ToolDefinition } from "../../tools/types";

interface Props {
  tool: ToolDefinition;
  onFiles: (files: File[]) => void;
  /** Number of files already selected, so the hint can stay accurate. */
  selectedCount: number;
  disabled?: boolean;
}

/**
 * Accessible upload surface: click, keyboard (Enter/Space), and drag & drop all
 * reach the same handler. The real `<input type="file">` stays in the DOM and
 * visually hidden so screen readers and form autofill behave normally.
 */
export default function FileDropzone({ tool, onFiles, selectedCount, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hintId = useId();

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setDragging(false);
      if (disabled) return;
      const dropped = Array.from(event.dataTransfer.files ?? []);
      if (dropped.length > 0) onFiles(dropped);
    },
    [disabled, onFiles]
  );

  const remaining = tool.maxFiles - selectedCount;
  const hint = tool.multiple
    ? `${tool.acceptLabel} files — up to ${tool.maxFiles}, max ${tool.maxFileSizeMB} MB each`
    : `A single ${tool.acceptLabel} file, up to ${tool.maxFileSizeMB} MB`;

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby={hintId}
        aria-label={`Choose ${tool.acceptLabel} files to ${tool.verb}. Or drag and drop them here.`}
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          "group flex min-h-[280px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--primary)]",
          disabled
            ? "cursor-not-allowed border-[var(--border)] bg-[var(--page)] opacity-60"
            : "cursor-pointer border-[var(--border-strong)] bg-[var(--page)] hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]",
          dragging ? "scale-[1.01] border-[var(--primary)] bg-[var(--primary-soft)] shadow-[var(--shadow-sm)]" : "",
        ].join(" ")}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--border)] bg-white text-[var(--primary)] shadow-[var(--shadow-xs)] transition group-hover:-translate-y-0.5 group-hover:shadow-[var(--shadow-sm)]" aria-hidden="true">
          <UploadCloud className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <p className="mt-2 text-lg font-bold text-[var(--text-primary)]">
          {selectedCount > 0 && tool.multiple
            ? `Add more files${remaining > 0 ? ` — ${remaining} slot${remaining === 1 ? "" : "s"} left` : ""}`
            : `Drop your ${tool.acceptLabel} ${tool.multiple ? "files" : "file"} here`}
        </p>
        <p className="text-sm text-[var(--text-secondary)]">Drag and drop here, or</p>
        <span className="mt-1 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-[var(--shadow-xs)]">
          <FileUp className="h-4 w-4" /> Browse files
        </span>
        <p className="mt-1 text-xs font-medium text-[var(--text-muted)]">
          Files are checked before processing starts
        </p>
      </div>

      <p id={hintId} className="mt-3 text-center text-xs leading-5 text-[var(--text-muted)]">
        {hint}. {PROCESSING_COPY[tool.processingType].description}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={tool.accept}
        multiple={tool.multiple}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          if (picked.length > 0) onFiles(picked);
          // Reset so picking the same file twice still fires a change event.
          event.target.value = "";
        }}
      />
    </div>
  );
}
