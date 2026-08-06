"use client";

import { useCallback, useId, useRef, useState } from "react";
import { InboxOutlined } from "@ant-design/icons";
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
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600",
          disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60"
            : "cursor-pointer border-blue-200 bg-[#f7fbff] hover:border-blue-400 hover:bg-[#eef5ff]",
          dragging ? "border-red-400 bg-red-50" : "",
        ].join(" ")}
      >
        <span className="text-4xl text-blue-600" aria-hidden="true">
          <InboxOutlined />
        </span>
        <p className="text-base font-semibold text-blue-900">
          {selectedCount > 0 && tool.multiple
            ? `Add more files${remaining > 0 ? ` — ${remaining} slot${remaining === 1 ? "" : "s"} left` : ""}`
            : `Drop your ${tool.acceptLabel} ${tool.multiple ? "files" : "file"} here`}
        </p>
        <p className="text-sm text-gray-600">
          or <span className="font-medium text-red-500 underline">browse your device</span>
        </p>
      </div>

      <p id={hintId} className="mt-2 text-sm text-gray-500">
        {hint}. Files are processed on this device
        {tool.serverSide ? " except where a secure server converter is required" : ""}.
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
