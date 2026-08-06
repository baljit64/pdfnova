/**
 * Tool id → execution. Client-only: every engine module is behind a dynamic
 * import so a page only downloads the code for the tool it actually renders.
 *
 * This is the one place that maps user-facing options onto engine parameters.
 */
import type { RunContext, RunResult, ToolId, ToolRunner } from "./types";

const num = (ctx: RunContext, key: string, fallback: number): number => {
  const value = Number(ctx.options[key]);
  return Number.isFinite(value) ? value : fallback;
};

const str = (ctx: RunContext, key: string, fallback = ""): string => {
  const value = ctx.options[key];
  return value === undefined || value === null ? fallback : String(value);
};

const RUNNERS: Record<ToolId, ToolRunner> = {
  "merge-pdf": async (ctx): Promise<RunResult> => {
    const { mergePDFs } = await import("./engine/pdf");
    return {
      outputs: await mergePDFs({
        files: ctx.files,
        rotations: ctx.rotations,
        signal: ctx.signal,
        onProgress: ctx.onProgress,
      }),
    };
  },

  "split-pdf": async (ctx): Promise<RunResult> => {
    const { splitPDF } = await import("./engine/pdf");
    const mode = str(ctx, "mode", "each") === "range" ? "range" : "each";
    const outputs = await splitPDF({
      file: ctx.files[0],
      mode,
      ranges: str(ctx, "ranges"),
      signal: ctx.signal,
      onProgress: ctx.onProgress,
    });
    return {
      outputs,
      notice:
        mode === "each"
          ? `Your PDF was split into ${outputs.length} single-page file${outputs.length === 1 ? "" : "s"}.`
          : undefined,
    };
  },

  "compress-pdf": async (ctx): Promise<RunResult> => {
    const { compressPDF } = await import("./engine/raster");
    const { formatBytes } = await import("./engine/blob");
    const rawLevel = str(ctx, "level", "balanced");
    const level = (["lossless", "balanced", "strong", "target"] as const).includes(
      rawLevel as "lossless"
    )
      ? (rawLevel as "lossless" | "balanced" | "strong" | "target")
      : "balanced";

    const result = await compressPDF({
      file: ctx.files[0],
      level,
      targetBytes: Math.round(num(ctx, "targetKB", 1024) * 1024),
      signal: ctx.signal,
      onProgress: ctx.onProgress,
    });

    const saved = result.originalSize - result.finalSize;
    const percent = result.originalSize > 0 ? Math.round((saved / result.originalSize) * 100) : 0;

    let notice: string;
    if (saved > 0) {
      notice = `${formatBytes(result.originalSize)} → ${formatBytes(result.finalSize)}, ${percent}% smaller.`;
    } else {
      notice = `This PDF is already well optimised — we could not make it meaningfully smaller without hurting quality. It is ${formatBytes(result.finalSize)}.`;
    }
    if (result.missedTarget) {
      notice += " We could not reach your target size without unreadable quality, so this is the smallest usable version.";
    }

    return { outputs: result.outputs, notice };
  },

  "rotate-pdf": async (ctx): Promise<RunResult> => {
    const { rotatePDF } = await import("./engine/pdf");
    const angle = num(ctx, "angle", 90);
    return {
      outputs: await rotatePDF({
        file: ctx.files[0],
        angle: (angle === 180 || angle === 270 ? angle : 90) as 90 | 180 | 270,
        pages: str(ctx, "pages"),
        signal: ctx.signal,
        onProgress: ctx.onProgress,
      }),
    };
  },

  watermark: async (ctx): Promise<RunResult> => {
    const { watermarkPDF } = await import("./engine/pdf");
    const position = str(ctx, "position", "diagonal");
    return {
      outputs: await watermarkPDF({
        file: ctx.files[0],
        text: str(ctx, "text", "DRAFT"),
        opacity: Math.min(1, Math.max(0.05, num(ctx, "opacity", 0.3))),
        fontSize: num(ctx, "fontSize", 48),
        position: (["diagonal", "center", "bottom-right", "top-left"] as const).includes(
          position as "diagonal"
        )
          ? (position as "diagonal" | "center" | "bottom-right" | "top-left")
          : "diagonal",
        signal: ctx.signal,
        onProgress: ctx.onProgress,
      }),
    };
  },

  "sign-pdf": async (ctx): Promise<RunResult> => {
    const { signPDF } = await import("./engine/pdf");
    return {
      outputs: await signPDF({
        file: ctx.files[0],
        text: str(ctx, "text"),
        pageNumber: num(ctx, "pageNumber", 0),
        fontSize: num(ctx, "fontSize", 16),
        onProgress: ctx.onProgress,
      }),
    };
  },

  "edit-pdf": async (ctx): Promise<RunResult> => {
    const { addTextToPDF } = await import("./engine/pdf");
    return {
      outputs: await addTextToPDF({
        file: ctx.files[0],
        text: str(ctx, "text"),
        pageNumber: num(ctx, "pageNumber", 1),
        x: num(ctx, "x", 50),
        yFromTop: num(ctx, "y", 100),
        fontSize: num(ctx, "fontSize", 12),
        onProgress: ctx.onProgress,
      }),
    };
  },

  "pdf-to-jpg": async (ctx): Promise<RunResult> => {
    const { pdfToImages } = await import("./engine/raster");
    const outputs = await pdfToImages({
      file: ctx.files[0],
      format: "jpeg",
      scale: num(ctx, "scale", 2),
      quality: num(ctx, "quality", 0.92),
      signal: ctx.signal,
      onProgress: ctx.onProgress,
    });
    return { outputs, notice: `${outputs.length} page${outputs.length === 1 ? "" : "s"} converted.` };
  },

  "pdf-to-image": async (ctx): Promise<RunResult> => {
    const { pdfToImages } = await import("./engine/raster");
    const outputs = await pdfToImages({
      file: ctx.files[0],
      format: "png",
      scale: num(ctx, "scale", 2),
      signal: ctx.signal,
      onProgress: ctx.onProgress,
    });
    return { outputs, notice: `${outputs.length} page${outputs.length === 1 ? "" : "s"} converted.` };
  },

  "jpg-to-pdf": async (ctx): Promise<RunResult> => {
    const { imagesToPDF } = await import("./engine/raster");
    const orientation = str(ctx, "orientation", "auto");
    return {
      outputs: await imagesToPDF({
        files: ctx.files,
        pageSize: str(ctx, "pageSize", "fit") === "match" ? "match" : "fit",
        orientation: (["auto", "portrait", "landscape"] as const).includes(orientation as "auto")
          ? (orientation as "auto" | "portrait" | "landscape")
          : "auto",
        marginPt: num(ctx, "marginPt", 24),
        signal: ctx.signal,
        onProgress: ctx.onProgress,
      }),
    };
  },

  "pdf-to-word": async (ctx): Promise<RunResult> => {
    const { pdfToWord } = await import("./engine/office");
    return {
      outputs: await pdfToWord({
        file: ctx.files[0],
        signal: ctx.signal,
        onProgress: ctx.onProgress,
      }),
    };
  },

  "word-to-pdf": async (ctx): Promise<RunResult> => {
    const { wordToPDF } = await import("./engine/office");
    return { outputs: await wordToPDF({ file: ctx.files[0], onProgress: ctx.onProgress }) };
  },

  "excel-to-pdf": async (ctx): Promise<RunResult> => {
    const { excelToPDF } = await import("./engine/office");
    return {
      outputs: await excelToPDF({
        file: ctx.files[0],
        orientation: str(ctx, "orientation", "landscape") === "portrait" ? "portrait" : "landscape",
        sheets: str(ctx, "sheets", "all") === "first" ? "first" : "all",
        onProgress: ctx.onProgress,
      }),
    };
  },
};

export function getRunner(id: ToolId): ToolRunner {
  return RUNNERS[id];
}
