/**
 * Core types for the shared PDFNova tool engine.
 *
 * A tool is described once (metadata in `registry.ts`, execution in `runners.ts`)
 * and rendered everywhere by `ToolWorkspace`. Landing pages never re-implement a
 * tool — they mount the same descriptor.
 */

export type ToolId =
  | "merge-pdf"
  | "split-pdf"
  | "compress-pdf"
  | "rotate-pdf"
  | "watermark"
  | "sign-pdf"
  | "edit-pdf"
  | "pdf-to-jpg"
  | "pdf-to-image"
  | "jpg-to-pdf"
  | "pdf-to-word"
  | "word-to-pdf"
  | "excel-to-pdf";

/** Where a selected document is handled once the user starts a tool. */
export type ProcessingType = "client" | "server" | "hybrid";

/** A single produced file, ready to preview and download. */
export interface ToolOutput {
  /** Suggested download filename, including extension. */
  name: string;
  blob: Blob;
  /** Drives how the result is previewed: inline viewer, thumbnail, or download-only. */
  kind: "pdf" | "image" | "file";
  /** Bytes, for the size summary. */
  size: number;
}

export type OptionValue = string | number | File;

export type OptionFieldType = "text" | "number" | "radio" | "select" | "file" | "signature";

export interface OptionField {
  key: string;
  label: string;
  type: OptionFieldType;
  defaultValue: OptionValue;
  help?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  choices?: { label: string; value: OptionValue }[];
  accept?: string;
  /** Text fields only: run is blocked until the field is non-empty. */
  required?: boolean;
}

export type OptionValues = Record<string, OptionValue>;

/** Everything a runner needs. Files arrive in the order the user arranged them. */
export interface RunContext {
  files: File[];
  options: OptionValues;
  /** Per-file rotation in degrees, aligned to `files`. Only used by tools that opt in. */
  rotations: number[];
  signal: AbortSignal;
  /** `percent` is 0–100; `message` is surfaced to screen readers. */
  onProgress: (percent: number, message?: string) => void;
}

export interface RunResult {
  outputs: ToolOutput[];
  /** Optional note shown with the results, e.g. a before/after size summary. */
  notice?: string;
}

export type ToolRunner = (ctx: RunContext) => Promise<RunResult>;

export interface FileListControls {
  reorder?: boolean;
  rotate?: boolean;
  remove?: boolean;
}

export interface ToolDefinition {
  id: ToolId;
  /** Canonical route segment, e.g. "merge-pdf". */
  slug: string;
  /** Display name, e.g. "Merge PDF". */
  name: string;
  /** Lowercase verb phrase used in generated copy, e.g. "merge". */
  verb: string;
  /** Noun for the thing being produced, e.g. "merged PDF". */
  outputNoun: string;
  /** Primary button label. */
  actionLabel: string;
  /** One-line summary shown under the H1. */
  tagline: string;
  /**
   * A short clause (aim for under 50 characters) used inside generated meta
   * descriptions. The tagline is a full sentence and overruns the ~155 character
   * budget once a variation's own wording is prepended to it.
   */
  blurb: string;
  /** `accept` attribute for the file input. */
  accept: string;
  /** Human-readable list of accepted formats, e.g. "PDF". */
  acceptLabel: string;
  /** Lowercase extensions including the dot, used for validation. */
  extensions: string[];
  multiple: boolean;
  minFiles: number;
  maxFiles: number;
  maxFileSizeMB: number;
  fileListControls?: FileListControls;
  options?: OptionField[];
  /** Preview style for results. */
  outputKind: "pdf" | "images";
  /** The verified processing model shown in the workspace and privacy copy. */
  processingType: ProcessingType;
  /** False for tools that are not shipped yet — these get no landing pages. */
  available: boolean;
  /** Long-tail seeds used when composing metadata. */
  keywords: string[];
  related: ToolId[];
}
