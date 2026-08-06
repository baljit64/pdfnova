/**
 * Office-format conversions. Excel and Word run entirely in the browser; PDF to
 * Word posts to the existing `/api/convert/pdf-to-word` route, whose behaviour is
 * unchanged.
 */
import { baseName } from "./blob";
import type { ToolOutput } from "../types";

type Progress = (percent: number, message?: string) => void;

const noopProgress: Progress = () => {};

export interface ExcelToPdfParams {
  file: File;
  orientation: "landscape" | "portrait";
  /** "all" walks every sheet in the workbook; "first" stops after sheet one. */
  sheets: "all" | "first";
  onProgress?: Progress;
}

export async function excelToPDF({
  file,
  orientation,
  sheets,
  onProgress = noopProgress,
}: ExcelToPdfParams): Promise<ToolOutput[]> {
  const [XLSX, { jsPDF }, autoTableModule] = await Promise.all([
    import("xlsx"),
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = autoTableModule.default;

  onProgress(20, "Reading workbook");
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetNames = sheets === "all" ? workbook.SheetNames : workbook.SheetNames.slice(0, 1);
  if (sheetNames.length === 0) throw new Error("This workbook has no sheets.");

  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });
  let rendered = 0;

  sheetNames.forEach((sheetName, index) => {
    onProgress(20 + Math.round((index / sheetNames.length) * 70), `Laying out ${sheetName}`);
    const rows: unknown[][] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: "",
      raw: false,
    });
    if (rows.length === 0) return;

    if (rendered > 0) doc.addPage();
    rendered++;

    if (sheetNames.length > 1) {
      doc.setFontSize(12);
      doc.text(sheetName, 20, 28);
    }

    const head = (rows[0] as unknown[]).map((cell) => String(cell ?? ""));
    const body = rows.slice(1).map((row) => (row as unknown[]).map((cell) => String(cell ?? "")));

    autoTable(doc, {
      head: [head],
      body,
      startY: sheetNames.length > 1 ? 40 : 20,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
  });

  if (rendered === 0) throw new Error("Every sheet in this workbook is empty.");

  const blob = doc.output("blob");
  onProgress(100);
  return [{ name: `${baseName(file.name)}.pdf`, blob, kind: "pdf", size: blob.size }];
}

export interface WordToPdfParams {
  file: File;
  onProgress?: Progress;
}

export async function wordToPDF({
  file,
  onProgress = noopProgress,
}: WordToPdfParams): Promise<ToolOutput[]> {
  const [mammoth, html2canvasModule, { jsPDF }] = await Promise.all([
    import("mammoth"),
    import("html2canvas"),
    import("jspdf"),
  ]);
  const html2canvas = html2canvasModule.default;

  onProgress(15, "Reading document");
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });

  // Render off-screen at A4 content width so line breaks match the final PDF.
  const container = document.createElement("div");
  Object.assign(container.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "170mm",
    padding: "0",
    background: "#ffffff",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: "12pt",
    lineHeight: "1.5",
    color: "#000000",
  } satisfies Partial<CSSStyleDeclaration>);
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    onProgress(40, "Rendering pages");
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const contentHeight = pageHeight - margin * 2;

    // How many canvas pixels fit on one PDF page once scaled to the content width.
    const pxPerMm = canvas.width / contentWidth;
    const sliceHeightPx = Math.max(1, Math.floor(contentHeight * pxPerMm));
    const pageCount = Math.max(1, Math.ceil(canvas.height / sliceHeightPx));

    const slice = document.createElement("canvas");
    const sliceContext = slice.getContext("2d");
    if (!sliceContext) throw new Error("Your browser blocked canvas rendering.");

    for (let page = 0; page < pageCount; page++) {
      onProgress(40 + Math.round((page / pageCount) * 55), `Writing page ${page + 1} of ${pageCount}`);
      const sourceY = page * sliceHeightPx;
      const sourceHeight = Math.min(sliceHeightPx, canvas.height - sourceY);

      slice.width = canvas.width;
      slice.height = sourceHeight;
      sliceContext.fillStyle = "#ffffff";
      sliceContext.fillRect(0, 0, slice.width, slice.height);
      sliceContext.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sourceHeight,
        0,
        0,
        canvas.width,
        sourceHeight
      );

      if (page > 0) pdf.addPage();
      pdf.addImage(
        slice.toDataURL("image/jpeg", 0.92),
        "JPEG",
        margin,
        margin,
        contentWidth,
        sourceHeight / pxPerMm
      );
    }

    slice.width = 0;
    slice.height = 0;

    const blob = pdf.output("blob");
    onProgress(100);
    return [{ name: `${baseName(file.name)}.pdf`, blob, kind: "pdf", size: blob.size }];
  } finally {
    container.remove();
  }
}

export interface PdfToWordParams {
  file: File;
  signal: AbortSignal;
  onProgress?: Progress;
}

export async function pdfToWord({
  file,
  signal,
  onProgress = noopProgress,
}: PdfToWordParams): Promise<ToolOutput[]> {
  const body = new FormData();
  body.append("file", file);

  onProgress(20, "Uploading to the converter");
  const response = await fetch("/api/convert/pdf-to-word", { method: "POST", body, signal });

  if (!response.ok) {
    // The route answers with JSON on failure and a plain body on some errors.
    const raw = await response.text();
    let message = raw;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.error) message = parsed.error;
    } catch {
      /* keep the raw text */
    }
    throw new Error(message || "Conversion failed. Please try again.");
  }

  onProgress(85, "Downloading the Word file");
  const blob = await response.blob();
  onProgress(100);
  return [{ name: `${baseName(file.name)}.docx`, blob, kind: "file", size: blob.size }];
}
