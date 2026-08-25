/**
 * Office-format conversions. Excel and Word run entirely in the browser; PDF to
 * Word posts to the existing `/api/convert/pdf-to-word` route, whose behaviour is
 * unchanged.
 */
import { baseName } from "./blob";
import type { ToolOutput } from "../types";
import {
  MINIMUM_FONT_SIZE_PT,
  PREFERRED_FONT_SIZE_PT,
  calculatePageDimensions,
  createHorizontalColumnGroups,
  displayCellValue,
  parseWorkbook,
  sourceRowHeightPt,
  type HorizontalColumnGroup,
  type SpreadsheetOrientation,
  type WorksheetModel,
} from "./spreadsheet-layout";
import type { CellObject, Range } from "xlsx";
import type { CellDef, Color, RowInput, Styles } from "jspdf-autotable";

type Progress = (percent: number, message?: string) => void;

const noopProgress: Progress = () => {};

export interface ExcelToPdfParams {
  file: File;
  orientation: SpreadsheetOrientation;
  /** "all" walks every sheet in the workbook; "first" stops after sheet one. */
  sheets: "all" | "first";
  onProgress?: Progress;
}

type PdfCellDef = CellDef & { _link?: string };

interface ExcelStyle {
  font?: { name?: string; sz?: number; bold?: boolean; italic?: boolean; color?: ExcelColor };
  fill?: { patternType?: string; fgColor?: ExcelColor; bgColor?: ExcelColor };
  fgColor?: ExcelColor;
  patternType?: string;
  alignment?: {
    horizontal?: string;
    vertical?: string;
    wrapText?: boolean;
  };
  border?: Record<string, { style?: string; color?: ExcelColor } | undefined>;
}

interface ExcelColor {
  rgb?: string;
  indexed?: number;
}

function rgbColor(color: ExcelColor | undefined): [number, number, number] | undefined {
  if (!color?.rgb) return undefined;
  const hex = color.rgb.replace(/^#/, "").slice(-6);
  if (!/^[0-9a-f]{6}$/i.test(hex)) return undefined;
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
  ];
}

function standardFont(name: string | undefined): "helvetica" | "times" | "courier" {
  const normalized = name?.toLowerCase() ?? "";
  if (normalized.includes("times") || normalized.includes("serif")) return "times";
  if (normalized.includes("courier") || normalized.includes("mono")) return "courier";
  return "helvetica";
}

function borderWidth(style: string | undefined): number {
  if (!style) return 0;
  if (style.includes("thick") || style === "double") return 1;
  if (style.includes("medium")) return 0.65;
  return 0.3;
}

function hasAuthoredHeaderStyle(style: ExcelStyle): boolean {
  const fill = style.fill ?? style;
  return Boolean(
    style.font?.bold ||
    style.font?.italic ||
    (fill.patternType && fill.patternType !== "none") ||
    rgbColor(fill.fgColor) ||
    Object.values(style.border ?? {}).some((side) => side?.style)
  );
}

function pdfCellStyles(
  cell: CellObject | undefined,
  header: boolean,
  rowHeight: number | undefined
): Partial<Styles> {
  const source = (cell?.s ?? {}) as ExcelStyle;
  const fill = source.fill ?? source;
  const authoredHeader = hasAuthoredHeaderStyle(source);
  const foreground = rgbColor(source.font?.color);
  const background = rgbColor(fill.fgColor);
  const horizontal = source.alignment?.horizontal;
  const vertical = source.alignment?.vertical;
  const bold = source.font?.bold || (header && !authoredHeader);
  const italic = source.font?.italic;
  const fontStyle = bold && italic ? "bolditalic" : bold ? "bold" : italic ? "italic" : "normal";
  const borders = source.border ?? {};
  const lineWidth = Object.values(borders).some((side) => side?.style)
    ? {
        top: borderWidth(borders.top?.style),
        right: borderWidth(borders.right?.style),
        bottom: borderWidth(borders.bottom?.style),
        left: borderWidth(borders.left?.style),
      }
    : 0.25;
  const borderColor = Object.values(borders)
    .map((side) => rgbColor(side?.color))
    .find(Boolean);

  return {
    font: standardFont(source.font?.name),
    fontStyle,
    fontSize: Math.max(MINIMUM_FONT_SIZE_PT, Math.min(14, source.font?.sz ?? PREFERRED_FONT_SIZE_PT)),
    fillColor: (background ?? (header && !authoredHeader ? [226, 232, 240] : [255, 255, 255])) as Color,
    textColor: (foreground ?? [31, 41, 55]) as Color,
    halign: horizontal === "center" || horizontal === "centerContinuous"
      ? "center"
      : horizontal === "right" ? "right" : horizontal === "justify" ? "justify" : "left",
    valign: vertical === "center" ? "middle" : vertical === "bottom" ? "bottom" : "top",
    lineWidth,
    lineColor: (borderColor ?? [203, 213, 225]) as Color,
    minCellHeight: rowHeight ? Math.max(0, rowHeight) : 0,
  };
}

function mergeForCell(model: WorksheetModel, row: number, column: number): Range | undefined {
  return model.merges.find((merge) => (
    row >= merge.s.r && row <= merge.e.r && column >= merge.s.c && column <= merge.e.c
  ));
}

function tableRow(
  model: WorksheetModel,
  group: HorizontalColumnGroup,
  sourceRow: number,
  encodeCell: (cell: { r: number; c: number }) => string,
  header: boolean
): RowInput {
  const result: PdfCellDef[] = [];
  const groupSourceColumns = group.columnIndices.map((index) => model.columns[index].sourceIndex);
  const groupSourceSet = new Set(groupSourceColumns);
  const visibleRows = new Set(model.rows);
  const rowHeight = sourceRowHeightPt(model, sourceRow);

  for (const sourceColumn of groupSourceColumns) {
    const merge = mergeForCell(model, sourceRow, sourceColumn);
    let colSpan = 1;
    let rowSpan = 1;
    if (merge) {
      const mergedVisibleColumns = model.columns
        .map((column) => column.sourceIndex)
        .filter((column) => column >= merge.s.c && column <= merge.e.c);
      const mergeIsComplete = mergedVisibleColumns.every((column) => groupSourceSet.has(column));
      const mergedVisibleRows = model.rows.filter((row) => row >= merge.s.r && row <= merge.e.r);
      const isAnchor = sourceRow === mergedVisibleRows[0] && sourceColumn === mergedVisibleColumns[0];
      if (mergeIsComplete && !isAnchor) continue;
      if (mergeIsComplete && isAnchor) {
        colSpan = mergedVisibleColumns.length;
        // AutoTable cannot span from the head section into the body section.
        rowSpan = header ? 1 : mergedVisibleRows.filter((row) => visibleRows.has(row)).length;
      }
    }

    const cell = model.sheet[encodeCell({ r: sourceRow, c: sourceColumn })] as CellObject | undefined;
    const link = cell?.l?.Target || (/^https?:\/\//i.test(displayCellValue(cell)) ? displayCellValue(cell) : undefined);
    const styles = pdfCellStyles(cell, header, rowHeight);
    if (!cell?.s?.alignment?.horizontal && cell?.t === "n") styles.halign = "right";
    if (link && !rgbColor((cell?.s as ExcelStyle | undefined)?.font?.color)) {
      styles.textColor = [37, 99, 235];
    }
    result.push({
      content: displayCellValue(cell),
      colSpan,
      rowSpan,
      styles,
      _link: link,
    });
  }
  return result;
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
  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: true,
    cellFormula: true,
    cellNF: true,
    cellStyles: true,
    sheetStubs: true,
  });
  if (workbook.SheetNames.length === 0) throw new Error("This workbook has no sheets.");

  const models = parseWorkbook(workbook, sheets, {
    decodeCell: XLSX.utils.decode_cell,
    encodeCell: XLSX.utils.encode_cell,
  });
  if (models.length === 0) throw new Error("Every sheet in this workbook is empty.");

  const plans = models.map((model) => {
    const page = calculatePageDimensions(model, orientation);
    return { model, page, groups: createHorizontalColumnGroups(model, page.printableWidth) };
  });
  const totalGroups = plans.reduce((sum, plan) => sum + plan.groups.length, 0);
  const firstOrientation = plans[0].page.orientation;
  const doc = new jsPDF({ orientation: firstOrientation, unit: "pt", format: "a4" });
  let renderedGroups = 0;
  let hasRenderedTable = false;

  for (const { model, page, groups } of plans) {
    for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
      const group = groups[groupIndex];
      onProgress(
        25 + Math.round((renderedGroups / totalGroups) * 68),
        `Laying out ${model.name} (${groupIndex + 1} of ${groups.length})`
      );
      if (hasRenderedTable) doc.addPage("a4", page.orientation);
      hasRenderedTable = true;

      const head = [tableRow(model, group, model.headerRow, XLSX.utils.encode_cell, true)];
      const body = model.rows
        .filter((row) => row !== model.headerRow)
        .map((row) => tableRow(model, group, row, XLSX.utils.encode_cell, false));
      const columnStyles = Object.fromEntries(
        group.widths.map((width, index) => [index, { cellWidth: width, minCellWidth: width }])
      );

      autoTable(doc, {
        head,
        body,
        startY: page.marginTop,
        margin: {
          top: page.marginTop,
          right: page.marginRight,
          bottom: page.marginBottom,
          left: page.marginLeft,
        },
        tableWidth: "wrap",
        theme: "grid",
        showHead: "everyPage",
        rowPageBreak: "avoid",
        styles: {
          font: "helvetica",
          fontSize: PREFERRED_FONT_SIZE_PT,
          cellPadding: { top: 2.2, right: 2.5, bottom: 2.2, left: 2.5 },
          overflow: "linebreak",
          valign: "top",
          lineColor: [203, 213, 225],
          lineWidth: 0.25,
          textColor: [31, 41, 55],
        },
        headStyles: {
          fontStyle: "bold",
          fillColor: [226, 232, 240],
          textColor: [15, 23, 42],
        },
        bodyStyles: { fillColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles,
        willDrawPage: () => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.setTextColor(51, 65, 85);
          doc.text(model.name, page.marginLeft, 22);
          if (groups.length > 1) {
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.text(
              `Columns ${groupIndex + 1} of ${groups.length}`,
              page.pageWidth - page.marginRight,
              22,
              { align: "right" }
            );
          }
        },
        didDrawCell: (data) => {
          const raw = data.cell.raw as PdfCellDef;
          if (!raw?._link) return;
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: raw._link });
        },
      });
      renderedGroups++;
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    doc.setPage(pageNumber);
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Page ${pageNumber} of ${pageCount}`, width - 24, height - 10, { align: "right" });
  }

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
