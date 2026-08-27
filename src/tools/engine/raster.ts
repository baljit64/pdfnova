/**
 * Rasterising operations built on pdf.js: PDF to images, images to PDF, and the
 * size-targeted compressor.
 *
 * pdf.js and its worker are loaded on demand, and the worker is resolved from the
 * installed package so it can never drift out of sync with the API version.
 */
import { assertNotAborted, baseName, pdfBlob } from "./blob";
import { parsePageRanges } from "./pdf";
import { assertOrganizerPageLimit } from "../page-organizer";
import type { ToolOutput } from "../types";

type Progress = (percent: number, message?: string) => void;

const noopProgress: Progress = () => {};

type PdfJs = typeof import("pdfjs-dist");
type PdfLoadingTask = ReturnType<PdfJs["getDocument"]>;
type PdfDocument = Awaited<PdfLoadingTask["promise"]>;

/**
 * Keep these hardening options in one non-literal value. Some pdf.js type
 * releases omit `isEvalSupported` even though the runtime supports it; passing
 * a named value avoids that release-specific excess-property error.
 */
function pdfDocumentOptions(data: Uint8Array) {
  return {
    data,
    enableXfa: false,
    isEvalSupported: false,
  };
}

let pdfjsPromise: Promise<PdfJs> | null = null;

/** Load the self-contained browser module and point it at its same-origin worker. */
async function loadPdfJs(): Promise<PdfJs> {
  if (!pdfjsPromise) {
    // pdf.js 5 is already a bundled ESM application. Loading that bundle through
    // webpack nests two runtimes and causes `Object.defineProperty` failures in
    // Next's client chunk. Keep the module self-contained and load it natively.
    // @ts-expect-error This is a same-origin runtime module, not a source file.
    pdfjsPromise = import(/* webpackIgnore: true */ "/api/pdfjs/pdf.mjs").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = "/api/pdfjs/pdf.worker.min.mjs";
      return lib;
    });
  }
  return pdfjsPromise;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not read the rendered page."))),
      type,
      quality
    );
  });
}

/** Render one page to a canvas at the given scale. Caller owns the canvas. */
async function renderPage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pdf: any,
  pageNumber: number,
  scale: number
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser blocked canvas rendering.");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  try {
    await page.render({ canvasContext: context, viewport, canvas }).promise;
  } catch (error) {
    canvas.width = 0;
    canvas.height = 0;
    throw error;
  }
  return canvas;
}

export interface PdfToImagesParams {
  file: File;
  format: "jpeg" | "png";
  /** Roughly maps to DPI: 1 ≈ 72dpi, 2 ≈ 144dpi, 4 ≈ 288dpi. */
  scale: number;
  quality?: number;
  /** Empty means every page. Uses the same 1-based syntax as split and rotate. */
  pages?: string;
  signal: AbortSignal;
  onProgress?: Progress;
}

export async function pdfToImages({
  file,
  format,
  scale,
  quality = 0.92,
  pages,
  signal,
  onProgress = noopProgress,
}: PdfToImagesParams): Promise<ToolOutput[]> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument(pdfDocumentOptions(data)).promise;
  const stem = baseName(file.name);
  const extension = format === "jpeg" ? "jpg" : "png";
  const mime = format === "jpeg" ? "image/jpeg" : "image/png";
  const outputs: ToolOutput[] = [];
  const selectedPages = pages?.trim()
    ? parsePageRanges(pages.trim(), pdf.numPages).map((index) => index + 1)
    : Array.from({ length: pdf.numPages }, (_, index) => index + 1);

  try {
    for (let selectedIndex = 0; selectedIndex < selectedPages.length; selectedIndex++) {
      const pageNumber = selectedPages[selectedIndex];
      assertNotAborted(signal);
      onProgress(
        Math.round((selectedIndex / selectedPages.length) * 100),
        `Rendering selected page ${selectedIndex + 1} of ${selectedPages.length}`
      );
      const canvas = await renderPage(pdf, pageNumber, scale);
      const blob = await canvasToBlob(canvas, mime, format === "jpeg" ? quality : undefined);
      canvas.width = 0;
      canvas.height = 0;
      outputs.push({
        name: `${stem}-page-${pageNumber}.${extension}`,
        blob,
        kind: "image",
        size: blob.size,
      });
    }
  } finally {
    await pdf.destroy();
  }

  onProgress(100);
  return outputs;
}

export interface PdfThumbnail {
  pageNumber: number;
  blob: Blob;
}

export interface PdfOrganizerInput {
  file: File;
  fileKey: string;
  fileIndex: number;
}

export interface PdfOrganizerThumbnail {
  id: string;
  fileIndex: number;
  sourcePageIndex: number;
  sourceName: string;
  blob: Blob;
}

function isAbortError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

function organizerReadError(file: File, error: unknown): Error {
  if (isAbortError(error)) throw error;
  const detail = error instanceof Error && error.message
    ? ` ${error.message}`
    : " Please check that it is a valid, unencrypted PDF.";
  return new Error(`Could not read ${file.name}.${detail}`);
}

async function withOrganizerPdf<T>(
  file: File,
  signal: AbortSignal,
  renderPdf: (pdf: PdfDocument) => Promise<T> | T,
  preserveError?: (error: unknown) => boolean
): Promise<T> {
  let loadingTask: PdfLoadingTask | undefined;
  let destroyPromise: Promise<void> | undefined;
  let hasPrimaryError = false;
  let cleanupError: unknown;
  let hasCleanupError = false;
  let result: T;

  const destroyLoadingTask = (): Promise<void> => {
    if (!loadingTask) return Promise.resolve();
    if (!destroyPromise) {
      try {
        destroyPromise = Promise.resolve(loadingTask.destroy());
      } catch (error) {
        destroyPromise = Promise.reject(error);
      }
    }
    return destroyPromise;
  };
  const abortLoadingTask = () => {
    void destroyLoadingTask().catch(() => {});
  };

  try {
    assertNotAborted(signal);
    const pdfjs = await loadPdfJs();
    assertNotAborted(signal);
    const data = new Uint8Array(await file.arrayBuffer());
    assertNotAborted(signal);
    loadingTask = pdfjs.getDocument(pdfDocumentOptions(data));
    signal.addEventListener("abort", abortLoadingTask, { once: true });
    assertNotAborted(signal);
    const pdf = await loadingTask.promise;
    assertNotAborted(signal);
    result = await renderPdf(pdf);
  } catch (error) {
    if (preserveError?.(error)) {
      hasPrimaryError = true;
      throw error;
    }
    if (isAbortError(error)) {
      hasPrimaryError = true;
      throw error;
    }
    if (signal.aborted) {
      try {
        assertNotAborted(signal);
      } catch (abortError) {
        hasPrimaryError = true;
        throw abortError;
      }
    }
    const reported = organizerReadError(file, error);
    hasPrimaryError = true;
    throw reported;
  } finally {
    signal.removeEventListener("abort", abortLoadingTask);
    try {
      await destroyLoadingTask();
    } catch (error) {
      if (!hasPrimaryError) {
        cleanupError = error;
        hasCleanupError = true;
      }
    }
  }

  if (hasCleanupError) {
    if (signal.aborted) assertNotAborted(signal);
    throw organizerReadError(file, cleanupError);
  }
  return result;
}

/**
 * Render all organizer previews only after a sequential count pass proves the
 * complete job is within the visual organizer's page cap. This intentionally
 * reloads each source in the second pass: pdf.js owns its input buffer.
 */
export async function renderPdfOrganizerThumbnails(
  inputs: PdfOrganizerInput[],
  signal: AbortSignal
): Promise<PdfOrganizerThumbnail[]> {
  let totalPages = 0;

  for (const { file } of inputs) {
    let pageLimitError: unknown;
    await withOrganizerPdf(file, signal, (pdf) => {
      totalPages += pdf.numPages;
      try {
        assertOrganizerPageLimit(totalPages);
      } catch (error) {
        pageLimitError = error;
        throw error;
      }
    }, (error) => error === pageLimitError);
  }

  const thumbnails: PdfOrganizerThumbnail[] = [];
  for (const { file, fileKey, fileIndex } of inputs) {
    await withOrganizerPdf(file, signal, async (pdf) => {
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        assertNotAborted(signal);
        const canvas = await renderPage(pdf, pageNumber, 0.28);
        try {
          assertNotAborted(signal);
          const blob = await canvasToBlob(canvas, "image/jpeg", 0.72);
          assertNotAborted(signal);
          const sourcePageIndex = pageNumber - 1;
          thumbnails.push({
            id: `${fileKey}:${sourcePageIndex}`,
            fileIndex,
            sourcePageIndex,
            sourceName: file.name,
            blob,
          });
        } finally {
          canvas.width = 0;
          canvas.height = 0;
        }
      }
    });
  }

  return thumbnails;
}

/** Low-resolution page previews used by page-selecting tools. */
export async function renderPdfThumbnails(
  file: File,
  signal: AbortSignal,
  maxPages = 60
): Promise<{ thumbnails: PdfThumbnail[]; pageCount: number }> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument(pdfDocumentOptions(data)).promise;
  const thumbnails: PdfThumbnail[] = [];

  try {
    const count = Math.min(pdf.numPages, maxPages);
    for (let pageNumber = 1; pageNumber <= count; pageNumber++) {
      assertNotAborted(signal);
      const canvas = await renderPage(pdf, pageNumber, 0.28);
      const blob = await canvasToBlob(canvas, "image/jpeg", 0.72);
      canvas.width = 0;
      canvas.height = 0;
      thumbnails.push({ pageNumber, blob });
    }
    return { thumbnails, pageCount: pdf.numPages };
  } finally {
    await pdf.destroy();
  }
}

export interface ImagesToPdfParams {
  files: File[];
  /** "fit" scales each image onto an A4 page; "match" sizes the page to the image. */
  pageSize: "fit" | "match";
  orientation: "auto" | "portrait" | "landscape";
  marginPt: number;
  signal: AbortSignal;
  onProgress?: Progress;
}

const A4_PORTRAIT: [number, number] = [595.28, 841.89];

export async function imagesToPDF({
  files,
  pageSize,
  orientation,
  marginPt,
  signal,
  onProgress = noopProgress,
}: ImagesToPdfParams): Promise<ToolOutput[]> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    assertNotAborted(signal);
    const file = files[i];
    onProgress(Math.round((i / files.length) * 90), `Adding ${file.name}`);

    const bytes = new Uint8Array(await file.arrayBuffer());
    const isPng = /\.png$/i.test(file.name) || file.type === "image/png";

    let image;
    try {
      image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    } catch {
      // Some cameras label JPEGs as PNG and vice versa — try the other decoder.
      try {
        image = isPng ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
      } catch {
        throw new Error(`${file.name} is not a JPG or PNG image. Convert it first, then try again.`);
      }
    }

    if (pageSize === "match") {
      const page = doc.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      continue;
    }

    const landscape =
      orientation === "landscape" ||
      (orientation === "auto" && image.width > image.height);
    const [pw, ph] = landscape ? [A4_PORTRAIT[1], A4_PORTRAIT[0]] : A4_PORTRAIT;
    const page = doc.addPage([pw, ph]);

    const boxWidth = Math.max(1, pw - marginPt * 2);
    const boxHeight = Math.max(1, ph - marginPt * 2);
    const scale = Math.min(boxWidth / image.width, boxHeight / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;

    page.drawImage(image, {
      x: (pw - drawWidth) / 2,
      y: (ph - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  onProgress(95, "Writing PDF");
  const blob = pdfBlob(await doc.save());
  onProgress(100);
  return [{ name: "images.pdf", blob, kind: "pdf", size: blob.size }];
}

export interface CompressParams {
  file: File;
  /**
   * `lossless` only rewrites the file structure and never touches page content.
   * The other levels re-render pages as JPEG, which is what actually moves the
   * needle on scan-heavy PDFs.
   */
  level: "lossless" | "balanced" | "strong" | "target";
  /** Only read when `level` is "target". */
  targetBytes?: number;
  signal: AbortSignal;
  onProgress?: Progress;
}

export interface CompressResult {
  outputs: ToolOutput[];
  originalSize: number;
  finalSize: number;
  /** True when a size target was requested but could not be reached. */
  missedTarget: boolean;
}

/** Quality/scale pairs tried in order, from best-looking to smallest. */
const COMPRESSION_PASSES: { scale: number; quality: number }[] = [
  { scale: 1.5, quality: 0.82 },
  { scale: 1.25, quality: 0.72 },
  { scale: 1.0, quality: 0.62 },
  { scale: 0.85, quality: 0.52 },
  { scale: 0.7, quality: 0.42 },
  { scale: 0.55, quality: 0.34 },
];

/** Structure-only rewrite: object streams on, no content changes. */
async function losslessRewrite(bytes: Uint8Array): Promise<Uint8Array> {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes, { updateMetadata: false });
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

/** Re-render every page as a JPEG at the given scale/quality and rebuild the PDF. */
async function rasterPass(
  source: ArrayBuffer,
  pass: { scale: number; quality: number },
  signal: AbortSignal,
  onProgress: Progress,
  progressBase: number,
  progressSpan: number
): Promise<Uint8Array> {
  const pdfjs = await loadPdfJs();
  const { PDFDocument } = await import("pdf-lib");

  // pdf.js takes ownership of the buffer it is given, so hand it a fresh copy.
  const pdf = await pdfjs.getDocument(
    pdfDocumentOptions(new Uint8Array(source.slice(0)))
  ).promise;
  const doc = await PDFDocument.create();
  const sourceDocument = await PDFDocument.load(source.slice(0), { updateMetadata: false });

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      assertNotAborted(signal);
      onProgress(
        progressBase + Math.round(((pageNumber - 1) / pdf.numPages) * progressSpan),
        `Compressing page ${pageNumber} of ${pdf.numPages}`
      );

      // Preserve original page objects whenever a usable text layer exists. This
      // keeps text selectable/searchable and avoids turning vector pages into a
      // blurry photograph. Scan-only pages still receive the substantial image
      // recompression users expect from Balanced and Strong modes.
      let hasSearchableText = true;
      try {
        const sourcePage = await pdf.getPage(pageNumber);
        const text = await sourcePage.getTextContent();
        hasSearchableText = text.items.some((item) => (
          "str" in item && typeof item.str === "string" && item.str.trim().length > 0
        ));
      } catch {
        // If inspection fails, preserving the page is safer than flattening it.
      }

      if (hasSearchableText) {
        const [page] = await doc.copyPages(sourceDocument, [pageNumber - 1]);
        doc.addPage(page);
        continue;
      }

      const canvas = await renderPage(pdf, pageNumber, pass.scale);
      const jpeg = await canvasToBlob(canvas, "image/jpeg", pass.quality);
      canvas.width = 0;
      canvas.height = 0;

      const image = await doc.embedJpg(new Uint8Array(await jpeg.arrayBuffer()));
      // Keep the page at its original point size so the document still prints correctly.
      const page = doc.addPage([image.width / pass.scale, image.height / pass.scale]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
      });
    }
  } finally {
    await pdf.destroy();
  }

  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

export async function compressPDF({
  file,
  level,
  targetBytes,
  signal,
  onProgress = noopProgress,
}: CompressParams): Promise<CompressResult> {
  const source = await file.arrayBuffer();
  const originalSize = file.size;
  const stem = baseName(file.name);

  const finish = (bytes: Uint8Array, missedTarget: boolean): CompressResult => {
    const blob = pdfBlob(bytes);
    onProgress(100);
    return {
      outputs: [{ name: `${stem}-compressed.pdf`, blob, kind: "pdf", size: blob.size }],
      originalSize,
      finalSize: blob.size,
      missedTarget,
    };
  };

  onProgress(5, "Reading document");
  const lossless = await losslessRewrite(new Uint8Array(source.slice(0)));

  if (level === "lossless") return finish(lossless, false);

  // A structural rewrite alone sometimes clears the target; skip the re-render if so.
  if (level === "target" && targetBytes && lossless.byteLength <= targetBytes) {
    return finish(lossless, false);
  }

  const passes =
    level === "balanced"
      ? COMPRESSION_PASSES.slice(0, 1)
      : level === "strong"
        ? COMPRESSION_PASSES.slice(2, 3)
        : COMPRESSION_PASSES;

  let best: Uint8Array | null = null;

  for (let i = 0; i < passes.length; i++) {
    assertNotAborted(signal);
    const span = Math.floor(90 / passes.length);
    const result = await rasterPass(source, passes[i], signal, onProgress, 5 + i * span, span);

    if (!best || result.byteLength < best.byteLength) best = result;
    // Fixed levels run a single pass; only a size target keeps searching.
    if (level !== "target") break;
    if (targetBytes && result.byteLength <= targetBytes) return finish(result, false);
  }

  if (!best) return finish(lossless, level === "target");

  // Never hand back something larger than the plain rewrite.
  const chosen = best.byteLength < lossless.byteLength ? best : lossless;
  const missedTarget = level === "target" && !!targetBytes && chosen.byteLength > targetBytes;
  return finish(chosen, missedTarget);
}
