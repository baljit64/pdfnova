import type { CellObject, Range, WorkBook, WorkSheet } from "xlsx";

export const PREFERRED_FONT_SIZE_PT = 8;
export const MINIMUM_FONT_SIZE_PT = 7;
export const A4_PORTRAIT_PT = { width: 595.28, height: 841.89 } as const;
export const A4_LANDSCAPE_PT = { width: 841.89, height: 595.28 } as const;

const MIN_COLUMN_WIDTH_PT = 42;
const MAX_COLUMN_WIDTH_PT = 180;
const MAX_LONG_TEXT_WIDTH_PT = 196;

export type SpreadsheetOrientation = "auto" | "portrait" | "landscape";

export interface UsedRange {
  startRow: number;
  endRow: number;
  startColumn: number;
  endColumn: number;
}

export interface SpreadsheetColumn {
  sourceIndex: number;
  header: string;
  widthPt: number;
}

export interface WorksheetModel {
  name: string;
  sheet: WorkSheet;
  usedRange: UsedRange;
  headerRow: number;
  rows: number[];
  columns: SpreadsheetColumn[];
  merges: Range[];
}

export interface PageDimensions {
  orientation: "portrait" | "landscape";
  pageWidth: number;
  pageHeight: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  printableWidth: number;
  printableHeight: number;
}

export interface HorizontalColumnGroup {
  /** Indexes into WorksheetModel.columns, not raw Excel column indexes. */
  columnIndices: number[];
  widths: number[];
  repeatedColumnIndices: number[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hasCellContent(cell: CellObject | undefined): boolean {
  if (!cell) return false;
  return (
    cell.v !== undefined &&
    cell.v !== null &&
    String(cell.v) !== ""
  ) || Boolean(cell.f || cell.l || cell.c?.length);
}

/**
 * Finds actual data rather than trusting !ref, which can cover thousands of
 * formatted-but-unused rows. Merges that touch real data expand the result.
 */
export function detectUsedRange(
  sheet: WorkSheet,
  decodeCell: (address: string) => { r: number; c: number }
): UsedRange | null {
  let startRow = Number.POSITIVE_INFINITY;
  let endRow = -1;
  let startColumn = Number.POSITIVE_INFINITY;
  let endColumn = -1;

  for (const address of Object.keys(sheet)) {
    if (address.startsWith("!")) continue;
    const cell = sheet[address] as CellObject | undefined;
    if (!hasCellContent(cell)) continue;
    const { r, c } = decodeCell(address);
    startRow = Math.min(startRow, r);
    endRow = Math.max(endRow, r);
    startColumn = Math.min(startColumn, c);
    endColumn = Math.max(endColumn, c);
  }

  if (endRow < 0 || endColumn < 0) return null;

  // A merge anchored in the data range is intentional printable content.
  for (const merge of sheet["!merges"] ?? []) {
    const touchesRange = !(
      merge.e.r < startRow ||
      merge.s.r > endRow ||
      merge.e.c < startColumn ||
      merge.s.c > endColumn
    );
    if (!touchesRange) continue;
    startRow = Math.min(startRow, merge.s.r);
    endRow = Math.max(endRow, merge.e.r);
    startColumn = Math.min(startColumn, merge.s.c);
    endColumn = Math.max(endColumn, merge.e.c);
  }

  return { startRow, endRow, startColumn, endColumn };
}

export function displayCellValue(cell: CellObject | undefined): string {
  if (!cell) return "";
  if (cell.w !== undefined) return String(cell.w);
  if (cell.v instanceof Date) return cell.v.toLocaleString();
  if (cell.v !== undefined && cell.v !== null) return String(cell.v);
  if (cell.f) return `=${cell.f}`;
  return "";
}

function estimatedTextWidth(text: string, fontSize: number): number {
  const longestLine = text.split(/\r?\n/).reduce((longest, line) => {
    // Wide characters and capitals occupy more space than punctuation and spaces.
    const units = Array.from(line).reduce((sum, char) => {
      if (/\s/.test(char)) return sum + 0.32;
      if (/[MW@#%&]/.test(char)) return sum + 0.86;
      if (/[A-Z0-9]/.test(char)) return sum + 0.62;
      if (/[.,:;!'|il]/.test(char)) return sum + 0.3;
      return sum + 0.52;
    }, 0);
    return Math.max(longest, units * fontSize);
  }, 0);
  return longestLine + 10;
}

function sourceColumnWidthPt(sheet: WorkSheet, sourceIndex: number): number | null {
  const info = sheet["!cols"]?.[sourceIndex];
  if (!info) return null;
  if (typeof info.wpx === "number" && info.wpx > 0) return info.wpx * 0.75;
  if (typeof info.width === "number" && info.width > 0) return info.width * 5.25;
  if (typeof info.wch === "number" && info.wch > 0) return (info.wch + 0.83) * 5.25;
  return null;
}

/** Calculates each width once. Long values are capped and later wrapped. */
export function calculateColumnWidths(
  sheet: WorkSheet,
  rows: number[],
  sourceColumns: number[],
  encodeCell: (cell: { r: number; c: number }) => string
): SpreadsheetColumn[] {
  const measurementCache = new Map<string, number>();
  const measure = (text: string) => {
    const cached = measurementCache.get(text);
    if (cached !== undefined) return cached;
    const measured = estimatedTextWidth(text, PREFERRED_FONT_SIZE_PT);
    measurementCache.set(text, measured);
    return measured;
  };

  return sourceColumns.map((sourceIndex) => {
    let contentWidth = MIN_COLUMN_WIDTH_PT;
    let containsLongText = false;
    for (const row of rows) {
      const value = displayCellValue(sheet[encodeCell({ r: row, c: sourceIndex })] as CellObject);
      if (!value) continue;
      containsLongText ||= value.length > 80;
      contentWidth = Math.max(contentWidth, measure(value));
    }

    const sourceWidth = sourceColumnWidthPt(sheet, sourceIndex);
    const maximum = containsLongText ? MAX_LONG_TEXT_WIDTH_PT : MAX_COLUMN_WIDTH_PT;
    // Honour authored widths where possible. Content still establishes a useful
    // floor for files whose width metadata is missing or implausibly narrow.
    const desired = sourceWidth === null
      ? contentWidth
      : Math.max(sourceWidth, Math.min(contentWidth, sourceWidth * 1.25));
    const header = displayCellValue(
      sheet[encodeCell({ r: rows[0], c: sourceIndex })] as CellObject
    );

    return {
      sourceIndex,
      header,
      widthPt: clamp(desired, MIN_COLUMN_WIDTH_PT, maximum),
    };
  });
}

export function parseWorkbook(
  workbook: WorkBook,
  selection: "all" | "first",
  utils: {
    decodeCell: (address: string) => { r: number; c: number };
    encodeCell: (cell: { r: number; c: number }) => string;
  }
): WorksheetModel[] {
  const names = selection === "all" ? workbook.SheetNames : workbook.SheetNames.slice(0, 1);
  const models: WorksheetModel[] = [];

  for (const name of names) {
    const sheet = workbook.Sheets[name];
    const usedRange = detectUsedRange(sheet, utils.decodeCell);
    if (!usedRange) continue;

    const rows: number[] = [];
    for (let row = usedRange.startRow; row <= usedRange.endRow; row++) {
      if (!sheet["!rows"]?.[row]?.hidden) rows.push(row);
    }
    const sourceColumns: number[] = [];
    for (let column = usedRange.startColumn; column <= usedRange.endColumn; column++) {
      if (!sheet["!cols"]?.[column]?.hidden) sourceColumns.push(column);
    }
    if (rows.length === 0 || sourceColumns.length === 0) continue;

    const columns = calculateColumnWidths(sheet, rows, sourceColumns, utils.encodeCell);
    const merges = (sheet["!merges"] ?? []).filter((merge) => !(
      merge.e.r < usedRange.startRow ||
      merge.s.r > usedRange.endRow ||
      merge.e.c < usedRange.startColumn ||
      merge.s.c > usedRange.endColumn
    ));

    models.push({
      name,
      sheet,
      usedRange,
      headerRow: rows[0],
      rows,
      columns,
      merges,
    });
  }

  return models;
}

export function calculatePageDimensions(
  model: WorksheetModel,
  requestedOrientation: SpreadsheetOrientation
): PageDimensions {
  const portraitPrintableWidth = A4_PORTRAIT_PT.width - 48;
  const naturalWidth = model.columns.reduce((sum, column) => sum + column.widthPt, 0);
  const orientation = requestedOrientation === "auto"
    ? naturalWidth > portraitPrintableWidth * 1.05 ? "landscape" : "portrait"
    : requestedOrientation;
  const page = orientation === "landscape" ? A4_LANDSCAPE_PT : A4_PORTRAIT_PT;
  const marginLeft = 24;
  const marginRight = 24;
  const marginTop = 36;
  const marginBottom = 28;

  return {
    orientation,
    pageWidth: page.width,
    pageHeight: page.height,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
    printableWidth: page.width - marginLeft - marginRight,
    printableHeight: page.height - marginTop - marginBottom,
  };
}

function identifierColumns(model: WorksheetModel, printableWidth: number): number[] {
  const bodyRows = model.rows.filter((row) => row !== model.headerRow);
  const repeats: number[] = [];
  let repeatWidth = 0;

  for (let columnIndex = 0; columnIndex < Math.min(3, model.columns.length); columnIndex++) {
    const column = model.columns[columnIndex];
    const values = bodyRows
      .map((row) => displayCellValue(model.sheet[cellAddress(row, column.sourceIndex)] as CellObject).trim())
      .filter(Boolean);
    if (values.length === 0) break;
    const uniqueRatio = new Set(values).size / values.length;
    const averageLength = values.reduce((sum, value) => sum + value.length, 0) / values.length;
    const looksIdentifying = uniqueRatio >= 0.65 && averageLength <= 40;
    if (!looksIdentifying || repeatWidth + column.widthPt > printableWidth * 0.42) break;
    repeats.push(columnIndex);
    repeatWidth += column.widthPt;
  }

  return repeats;
}

function cellAddress(row: number, column: number): string {
  let name = "";
  for (let value = column + 1; value > 0; value = Math.floor((value - 1) / 26)) {
    name = String.fromCharCode(65 + ((value - 1) % 26)) + name;
  }
  return `${name}${row + 1}`;
}

function mergeUnits(model: WorksheetModel, candidateIndices: number[]): number[][] {
  const units: number[][] = candidateIndices.map((index) => [index]);
  if (units.length < 2) return units;

  const mergedPairs = new Set<string>();
  for (const merge of model.merges) {
    const indexes = candidateIndices.filter((index) => {
      const source = model.columns[index].sourceIndex;
      return source >= merge.s.c && source <= merge.e.c;
    });
    for (let index = 1; index < indexes.length; index++) {
      mergedPairs.add(`${indexes[index - 1]}:${indexes[index]}`);
    }
  }

  const result: number[][] = [];
  let current = units[0];
  for (let index = 1; index < units.length; index++) {
    const next = units[index];
    const previousColumn = current[current.length - 1];
    if (mergedPairs.has(`${previousColumn}:${next[0]}`)) current.push(...next);
    else {
      result.push(current);
      current = next;
    }
  }
  result.push(current);
  return result;
}

function fittedWidths(model: WorksheetModel, indices: number[], available: number): number[] {
  const widths = indices.map((index) => model.columns[index].widthPt);
  const total = widths.reduce((sum, width) => sum + width, 0);
  if (total <= available) return widths;
  const scale = available / total;
  return widths.map((width) => width * scale);
}

/**
 * Creates deterministic horizontal bands. Identifier columns are inferred from
 * compact, mostly-unique leading columns and repeated only when pagination is
 * actually necessary.
 */
export function createHorizontalColumnGroups(
  model: WorksheetModel,
  printableWidth: number
): HorizontalColumnGroup[] {
  const allIndices = model.columns.map((_, index) => index);
  const totalWidth = model.columns.reduce((sum, column) => sum + column.widthPt, 0);
  if (totalWidth <= printableWidth) {
    return [{
      columnIndices: allIndices,
      widths: fittedWidths(model, allIndices, printableWidth),
      repeatedColumnIndices: [],
    }];
  }

  const repeated = identifierColumns(model, printableWidth);
  const repeatedSet = new Set(repeated);
  const candidates = allIndices.filter((index) => !repeatedSet.has(index));
  const units = mergeUnits(model, candidates);
  const repeatedWidth = repeated.reduce((sum, index) => sum + model.columns[index].widthPt, 0);
  const groups: HorizontalColumnGroup[] = [];
  let current: number[] = [];
  let currentWidth = repeatedWidth;

  const flush = () => {
    if (current.length === 0) return;
    const columnIndices = [...repeated, ...current];
    groups.push({
      columnIndices,
      widths: fittedWidths(model, columnIndices, printableWidth),
      repeatedColumnIndices: repeated,
    });
    current = [];
    currentWidth = repeatedWidth;
  };

  for (const unit of units) {
    const unitWidth = unit.reduce((sum, index) => sum + model.columns[index].widthPt, 0);
    if (current.length > 0 && currentWidth + unitWidth > printableWidth) flush();
    current.push(...unit);
    currentWidth += unitWidth;
    // A wide merged unit is kept intact and fitted as a unit on its own page.
    if (currentWidth >= printableWidth) flush();
  }
  flush();

  if (groups.length === 0) {
    const columnIndices = repeated.length > 0 ? repeated : allIndices;
    groups.push({
      columnIndices,
      widths: fittedWidths(model, columnIndices, printableWidth),
      repeatedColumnIndices: repeated,
    });
  }
  return groups;
}

export function sourceRowHeightPt(model: WorksheetModel, sourceRow: number): number | undefined {
  const info = model.sheet["!rows"]?.[sourceRow];
  if (typeof info?.hpt === "number" && info.hpt > 0) return info.hpt;
  if (typeof info?.hpx === "number" && info.hpx > 0) return info.hpx * 0.75;
  return undefined;
}

