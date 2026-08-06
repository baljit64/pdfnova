/** Shared helpers for turning engine output into downloadable blobs. */

/** pdf-lib returns Uint8Array; BlobPart typing needs a nudge across TS lib versions. */
export function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  return new Blob([bytes as unknown as BlobPart], { type });
}

export function pdfBlob(bytes: Uint8Array): Blob {
  return bytesToBlob(bytes, "application/pdf");
}

/** Strip the extension from a filename so tools can build `name-suffix.ext`. */
export function baseName(fileName: string): string {
  return fileName.replace(/\.[^./\\]+$/, "") || "document";
}

/**
 * pdf-lib's standard fonts are WinAnsi-encoded and throw on characters outside
 * that range. Replace what cannot be drawn rather than failing the whole run.
 */
export function toWinAnsiSafe(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Throws if the user hit Cancel, so long loops can bail between pages. */
export function assertNotAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
}
