/**
 * Browser-side PDF operations. Every tool page and every SEO landing page calls
 * into these functions — there is no second implementation anywhere.
 *
 * pdf-lib is imported dynamically so it only lands in the chunk of a page whose
 * tool actually needs it.
 */
import { assertNotAborted, baseName, pdfBlob, toWinAnsiSafe } from "./blob";
import type { ToolOutput } from "../types";
import type { PDFDocument, PDFImage } from "pdf-lib";

type Progress = (percent: number, message?: string) => void;

const noopProgress: Progress = () => {};

function copyMetadata(source: PDFDocument, target: PDFDocument): void {
  const textValues: Array<[() => string | undefined, (value: string) => void]> = [
    [() => source.getTitle(), (value) => target.setTitle(value)],
    [() => source.getAuthor(), (value) => target.setAuthor(value)],
    [() => source.getSubject(), (value) => target.setSubject(value)],
    [() => source.getCreator(), (value) => target.setCreator(value)],
    [() => source.getProducer(), (value) => target.setProducer(value)],
  ];
  for (const [read, write] of textValues) {
    const value = read();
    if (value) write(value);
  }
  const keywords = source.getKeywords();
  if (keywords) target.setKeywords(keywords.split(/[,;]\s*/).filter(Boolean));
  const created = source.getCreationDate();
  const modified = source.getModificationDate();
  if (created) target.setCreationDate(created);
  if (modified) target.setModificationDate(modified);
}

/** pdf-lib cannot safely move interactive fields between documents; flattening keeps their visible values. */
function preserveFormAppearance(document: PDFDocument): void {
  const form = document.getForm();
  if (form.getFields().length > 0) form.flatten();
}

export interface MergeParams {
  files: File[];
  /** Rotation applied to every page of the file at the same index. */
  rotations?: number[];
  signal: AbortSignal;
  onProgress?: Progress;
}

export async function mergePDFs({
  files,
  rotations = [],
  signal,
  onProgress = noopProgress,
}: MergeParams): Promise<ToolOutput[]> {
  const { PDFDocument, degrees } = await import("pdf-lib");
  const merged = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    assertNotAborted(signal);
    onProgress(Math.round((i / files.length) * 90), `Adding ${files[i].name}`);

    const source = await PDFDocument.load(await files[i].arrayBuffer());
    preserveFormAppearance(source);
    if (i === 0) copyMetadata(source, merged);
    const pages = await merged.copyPages(source, source.getPageIndices());
    const rotation = rotations[i] ?? 0;

    for (const page of pages) {
      merged.addPage(page);
      if (rotation !== 0) {
        const added = merged.getPage(merged.getPageCount() - 1);
        // Respect any rotation already baked into the source page.
        added.setRotation(degrees((added.getRotation().angle + rotation) % 360));
      }
    }
  }

  onProgress(95, "Writing merged PDF");
  const bytes = await merged.save();
  const blob = pdfBlob(bytes);
  onProgress(100);

  return [{ name: "merged.pdf", blob, kind: "pdf", size: blob.size }];
}

export interface SplitParams {
  file: File;
  /** "each" = one PDF per page. "range" = a single PDF containing `ranges`. */
  mode: "each" | "range";
  /** Page range expression such as "1-3, 7, 9-12". 1-based, inclusive. */
  ranges?: string;
  signal: AbortSignal;
  onProgress?: Progress;
}

/** Parse "1-3, 7" into zero-based page indices, validated against `pageCount`. */
export function parsePageRanges(expression: string, pageCount: number): number[] {
  const indices: number[] = [];
  const seen = new Set<number>();

  for (const part of expression.split(",")) {
    const chunk = part.trim();
    if (!chunk) continue;

    const range = chunk.match(/^(\d+)\s*-\s*(\d+)$/);
    const single = chunk.match(/^(\d+)$/);

    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start < 1 || end < start) throw new Error(`Invalid page range "${chunk}".`);
      for (let p = start; p <= end; p++) {
        if (p > pageCount) throw new Error(`Page ${p} does not exist — the PDF has ${pageCount} pages.`);
        if (!seen.has(p)) {
          seen.add(p);
          indices.push(p - 1);
        }
      }
    } else if (single) {
      const p = Number(single[1]);
      if (p < 1 || p > pageCount) {
        throw new Error(`Page ${p} does not exist — the PDF has ${pageCount} pages.`);
      }
      if (!seen.has(p)) {
        seen.add(p);
        indices.push(p - 1);
      }
    } else {
      throw new Error(`Could not read "${chunk}". Use a format like 1-3, 7, 9-12.`);
    }
  }

  if (indices.length === 0) throw new Error("Enter at least one page or range.");
  return indices;
}

export async function splitPDF({
  file,
  mode,
  ranges,
  signal,
  onProgress = noopProgress,
}: SplitParams): Promise<ToolOutput[]> {
  const { PDFDocument } = await import("pdf-lib");
  const source = await PDFDocument.load(await file.arrayBuffer());
  preserveFormAppearance(source);
  const pageCount = source.getPageCount();
  const stem = baseName(file.name);

  if (mode === "range") {
    const indices = parsePageRanges(ranges?.trim() || "", pageCount);
    const doc = await PDFDocument.create();
    copyMetadata(source, doc);
    const pages = await doc.copyPages(source, indices);
    pages.forEach((page) => doc.addPage(page));
    onProgress(90, "Writing extracted pages");
    const blob = pdfBlob(await doc.save());
    onProgress(100);
    return [{ name: `${stem}-pages.pdf`, blob, kind: "pdf", size: blob.size }];
  }

  const outputs: ToolOutput[] = [];
  for (let i = 0; i < pageCount; i++) {
    assertNotAborted(signal);
    onProgress(Math.round((i / pageCount) * 100), `Extracting page ${i + 1} of ${pageCount}`);
    const doc = await PDFDocument.create();
    copyMetadata(source, doc);
    const [page] = await doc.copyPages(source, [i]);
    doc.addPage(page);
    const blob = pdfBlob(await doc.save());
    outputs.push({ name: `${stem}-page-${i + 1}.pdf`, blob, kind: "pdf", size: blob.size });
  }
  onProgress(100);
  return outputs;
}

export interface RotateParams {
  file: File;
  angle: 90 | 180 | 270;
  /** Empty means every page. */
  pages?: string;
  signal: AbortSignal;
  onProgress?: Progress;
}

export async function rotatePDF({
  file,
  angle,
  pages,
  onProgress = noopProgress,
}: RotateParams): Promise<ToolOutput[]> {
  const { PDFDocument, degrees } = await import("pdf-lib");
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const all = doc.getPages();

  const targets = pages?.trim()
    ? new Set(parsePageRanges(pages.trim(), all.length))
    : null;

  onProgress(50, "Rotating pages");
  all.forEach((page, index) => {
    if (targets && !targets.has(index)) return;
    // Add to the existing rotation so a page that was already sideways ends up right.
    page.setRotation(degrees((page.getRotation().angle + angle) % 360));
  });

  const blob = pdfBlob(await doc.save());
  onProgress(100);
  return [{ name: `${baseName(file.name)}-rotated.pdf`, blob, kind: "pdf", size: blob.size }];
}

export interface WatermarkParams {
  file: File;
  kind?: "text" | "image";
  text: string;
  imageFile?: File;
  imageWidthPercent?: number;
  pages?: string;
  opacity: number;
  fontSize: number;
  position: "diagonal" | "center" | "bottom-right" | "top-left";
  signal: AbortSignal;
  onProgress?: Progress;
}

export async function watermarkPDF({
  file,
  kind = "text",
  text,
  imageFile,
  imageWidthPercent = 35,
  pages: selectedPages,
  opacity,
  fontSize,
  position,
  signal,
  onProgress = noopProgress,
}: WatermarkParams): Promise<ToolOutput[]> {
  const { PDFDocument, StandardFonts, degrees, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const safeText = toWinAnsiSafe(text).trim();
  if (kind === "text" && !safeText) throw new Error("Enter watermark text using standard Latin characters.");

  let image: PDFImage | undefined;
  if (kind === "image") {
    if (!imageFile) throw new Error("Choose a PNG or JPG watermark image.");
    const bytes = new Uint8Array(await imageFile.arrayBuffer());
    const isPng = imageFile.type === "image/png" || /\.png$/i.test(imageFile.name);
    try {
      image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    } catch {
      try {
        image = isPng ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
      } catch {
        throw new Error("The watermark image must be a valid PNG or JPG file.");
      }
    }
  }

  const pages = doc.getPages();
  const targets = selectedPages?.trim()
    ? new Set(parsePageRanges(selectedPages, pages.length))
    : null;
  const textWidth = font.widthOfTextAtSize(safeText, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  pages.forEach((page, index) => {
    if (targets && !targets.has(index)) return;
    assertNotAborted(signal);
    onProgress(Math.round((index / pages.length) * 90), `Stamping page ${index + 1}`);
    const { width, height } = page.getSize();

    if (kind === "image" && image) {
      const drawWidth = width * Math.min(0.9, Math.max(0.05, imageWidthPercent / 100));
      const drawHeight = drawWidth * (image.height / image.width);
      const placements = {
        diagonal: { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, rotate: degrees(45) },
        center: { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2, rotate: degrees(0) },
        "bottom-right": { x: Math.max(24, width - drawWidth - 32), y: 32, rotate: degrees(0) },
        "top-left": { x: 32, y: Math.max(24, height - drawHeight - 32), rotate: degrees(0) },
      } as const;
      const placement = placements[position];
      page.drawImage(image, {
        x: placement.x,
        y: placement.y,
        width: drawWidth,
        height: drawHeight,
        opacity,
        rotate: placement.rotate,
      });
      return;
    }

    // Placement is measured from the text box so long words stay on the page.
    const layouts = {
      diagonal: {
        x: width / 2 - (textWidth / 2) * Math.SQRT1_2,
        y: height / 2 - (textWidth / 2) * Math.SQRT1_2,
        rotate: degrees(45),
      },
      center: { x: width / 2 - textWidth / 2, y: height / 2 - textHeight / 2, rotate: degrees(0) },
      "bottom-right": { x: Math.max(24, width - textWidth - 32), y: 32, rotate: degrees(0) },
      "top-left": { x: 32, y: height - textHeight - 32, rotate: degrees(0) },
    } as const;

    const layout = layouts[position];
    page.drawText(safeText, {
      x: layout.x,
      y: layout.y,
      size: fontSize,
      font,
      color: rgb(0.45, 0.45, 0.45),
      opacity,
      rotate: layout.rotate,
    });
  });

  const blob = pdfBlob(await doc.save());
  onProgress(100);
  return [{ name: `${baseName(file.name)}-watermarked.pdf`, blob, kind: "pdf", size: blob.size }];
}

export interface SignParams {
  file: File;
  text: string;
  signatureImage?: File;
  /** 0 means the last page. */
  pageNumber: number;
  fontSize: number;
  onProgress?: Progress;
}

export async function signPDF({
  file,
  text,
  signatureImage,
  pageNumber,
  fontSize,
  onProgress = noopProgress,
}: SignParams): Promise<ToolOutput[]> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const pages = doc.getPages();
  const safeText = toWinAnsiSafe(text).trim();
  if (!safeText && !signatureImage) throw new Error("Type, draw or upload a signature first.");

  const index = pageNumber > 0 ? Math.min(pageNumber, pages.length) - 1 : pages.length - 1;
  const page = pages[index];
  const font = await doc.embedFont(StandardFonts.HelveticaOblique);
  const { width } = page.getSize();

  onProgress(60, "Adding signature");
  if (signatureImage) {
    const bytes = new Uint8Array(await signatureImage.arrayBuffer());
    const isPng = signatureImage.type === "image/png" || /\.png$/i.test(signatureImage.name);
    let embedded;
    try {
      embedded = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    } catch {
      embedded = isPng ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    }
    const drawWidth = Math.min(width * 0.38, 220);
    const drawHeight = Math.min(drawWidth * (embedded.height / embedded.width), 100);
    page.drawImage(embedded, {
      x: Math.max(32, width - drawWidth - 48),
      y: 42,
      width: drawWidth,
      height: drawHeight,
    });
  } else {
    const textWidth = font.widthOfTextAtSize(safeText, fontSize);
    const x = Math.max(32, width - textWidth - 48);
    page.drawText(safeText, { x, y: 56, size: fontSize, font, color: rgb(0.05, 0.09, 0.35) });
    // A rule under the signature, the way a printed signature block reads.
    page.drawLine({
      start: { x, y: 48 },
      end: { x: x + textWidth, y: 48 },
      thickness: 0.75,
      color: rgb(0.4, 0.4, 0.4),
    });
  }

  const blob = pdfBlob(await doc.save());
  onProgress(100);
  return [{ name: `${baseName(file.name)}-signed.pdf`, blob, kind: "pdf", size: blob.size }];
}

export interface EditParams {
  file: File;
  mode?: "text" | "image" | "highlight";
  text: string;
  imageFile?: File;
  pageNumber: number;
  x: number;
  /** Measured from the top of the page, which is how people read a page. */
  yFromTop: number;
  fontSize: number;
  width?: number;
  height?: number;
  color?: string;
  onProgress?: Progress;
}

export async function addTextToPDF({
  file,
  mode = "text",
  text,
  imageFile,
  pageNumber,
  x,
  yFromTop,
  fontSize,
  width = 240,
  height: contentHeight = 80,
  color = "black",
  onProgress = noopProgress,
}: EditParams): Promise<ToolOutput[]> {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const doc = await PDFDocument.load(await file.arrayBuffer());
  const pages = doc.getPages();
  const safeText = toWinAnsiSafe(text).trim();
  if (mode === "text" && !safeText) throw new Error("Enter text using standard Latin characters.");
  if (mode === "image" && !imageFile) throw new Error("Choose a PNG or JPG image to add.");

  const index = Math.max(0, Math.min(pageNumber - 1, pages.length - 1));
  const page = pages[index];
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();
  const colors = {
    black: rgb(0, 0, 0),
    blue: rgb(0.05, 0.2, 0.72),
    red: rgb(0.8, 0.08, 0.08),
    yellow: rgb(1, 0.88, 0.12),
  } as const;
  const selectedColor = colors[color as keyof typeof colors] ?? colors.black;

  onProgress(60, "Adding content");
  if (mode === "highlight") {
    page.drawRectangle({
      x,
      y: height - yFromTop - contentHeight,
      width,
      height: contentHeight,
      color: selectedColor,
      opacity: 0.3,
      borderOpacity: 0,
    });
  } else if (mode === "image" && imageFile) {
    const bytes = new Uint8Array(await imageFile.arrayBuffer());
    const isPng = imageFile.type === "image/png" || /\.png$/i.test(imageFile.name);
    let embedded;
    try {
      embedded = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
    } catch {
      embedded = isPng ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    }
    page.drawImage(embedded, {
      x,
      y: height - yFromTop - contentHeight,
      width,
      height: contentHeight,
    });
  } else {
    page.drawText(safeText, {
      x,
      y: height - yFromTop,
      size: fontSize,
      lineHeight: fontSize * 1.25,
      maxWidth: width,
      font,
      color: selectedColor,
    });
  }

  const blob = pdfBlob(await doc.save());
  onProgress(100);
  return [{ name: `${baseName(file.name)}-edited.pdf`, blob, kind: "pdf", size: blob.size }];
}
