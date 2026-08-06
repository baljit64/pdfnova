"use client";

import { Button } from "antd";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  RotateRightOutlined,
} from "@ant-design/icons";
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
    <section className="mt-6" aria-label="Selected files">
      <h2 className="mb-2 text-sm font-semibold text-blue-900">
        {files.length} file{files.length === 1 ? "" : "s"} selected
        {canReorder ? " — they will be processed in this order" : ""}
      </h2>

      <ol className="space-y-2">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${file.size}-${index}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">
                {canReorder && (
                  <span className="mr-2 text-gray-400" aria-hidden="true">
                    {index + 1}.
                  </span>
                )}
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatBytes(file.size)}
                {canRotate && (rotations[index] ?? 0) !== 0
                  ? ` · rotated ${rotations[index]}°`
                  : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {canReorder && (
                <>
                  <Button
                    size="small"
                    type="text"
                    disabled={disabled || index === 0}
                    icon={<ArrowUpOutlined />}
                    aria-label={`Move ${file.name} up`}
                    onClick={() => onMove(index, index - 1)}
                  />
                  <Button
                    size="small"
                    type="text"
                    disabled={disabled || index === files.length - 1}
                    icon={<ArrowDownOutlined />}
                    aria-label={`Move ${file.name} down`}
                    onClick={() => onMove(index, index + 1)}
                  />
                </>
              )}

              {canRotate && (
                <Button
                  size="small"
                  disabled={disabled}
                  icon={<RotateRightOutlined />}
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
                  icon={<DeleteOutlined />}
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
