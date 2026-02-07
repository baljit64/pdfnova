import { PDFDocument, degrees, rgb } from "pdf-lib";

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  return mergePDFsWithOptions(files, {
    excludedIndices: [],
    rotations: files.map(() => 0),
  });
}

export interface MergeOptions {
  /** Indices of files to exclude from the merge (by original files array index). */
  excludedIndices: number[];
  /** Rotation in degrees (0, 90, 180, 270) per file index. */
  rotations: number[];
}

export async function mergePDFsWithOptions(
  files: File[],
  options: MergeOptions
): Promise<Uint8Array> {
  const { excludedIndices, rotations } = options;
  const mergedPdf = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    if (excludedIndices.includes(i)) continue;

    const file = files[i];
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());

    const rotation = rotations[i] ?? 0;
    const angle = degrees(rotation as 0 | 90 | 180 | 270);

    for (const page of pages) {
      mergedPdf.addPage(page);
      const addedPage = mergedPdf.getPage(mergedPdf.getPageCount() - 1);
      addedPage.setRotation(angle);
    }
  }

  return mergedPdf.save();
}

/** Split a PDF into one PDF per page (or by ranges). Returns array of PDF bytes. */
export async function splitPDF(file: File): Promise<Uint8Array[]> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const count = src.getPageCount();
  const results: Uint8Array[] = [];

  for (let i = 0; i < count; i++) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(src, [i]);
    doc.addPage(page);
    results.push(await doc.save());
  }
  return results;
}

/** Rotate all pages of a PDF by the given angle (0, 90, 180, 270). */
export async function rotatePDF(file: File, angle: 0 | 90 | 180 | 270): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  const rot = degrees(angle);
  for (const page of pages) {
    page.setRotation(rot);
  }
  return doc.save();
}

/** Add a text watermark to every page. */
export async function watermarkPDF(
  file: File,
  text: string,
  options?: { opacity?: number; fontSize?: number }
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const pages = doc.getPages();
  const opacity = options?.opacity ?? 0.3;
  const fontSize = options?.fontSize ?? 48;

  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: width / 2 - (text.length * fontSize) / 4,
      y: height / 2 - fontSize / 2,
      size: fontSize,
      color: rgb(0.7, 0.7, 0.7),
      opacity,
      rotate: degrees(45),
    });
  }
  return doc.save();
}

/** Create a single PDF from image files (e.g. JPG, PNG). */
export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  // pdf-lib can embed JPEG/PNG via embedJpg/embedPng
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const isJpeg = file.type === "image/jpeg" || file.name.toLowerCase().match(/\.jpe?g$/);
    const isPng = file.type === "image/png" || file.name.toLowerCase().match(/\.png$/);
    if (isJpeg) {
      const img = await doc.embedJpg(bytes);
      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    } else if (isPng) {
      const img = await doc.embedPng(bytes);
      const page = doc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    } else {
      // Try PNG for other image types (e.g. webp might fail; user can convert first)
      try {
        const img = await doc.embedPng(bytes);
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      } catch {
        throw new Error(`Unsupported image type: ${file.type}. Use JPG or PNG.`);
      }
    }
  }
  return doc.save();
}
