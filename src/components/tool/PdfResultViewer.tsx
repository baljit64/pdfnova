"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, Download, FileText, Maximize2, Minimize2,
  Minus, Plus, RotateCw, ZoomIn,
} from "lucide-react";

interface Props {
  fileUrl: string;
  fileName: string;
}

interface PdfDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (options: { scale: number; rotation?: number }) => { width: number; height: number };
    render: (options: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
  }>;
  destroy: () => Promise<void>;
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not create page preview.")), "image/jpeg", 0.72);
  });
}

export default function PdfResultViewer({ fileUrl, fileName }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<PdfDocument | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let active = true;
    let loaded: PdfDocument | null = null;
    let thumbnailUrls: string[] = [];

    async function openDocument() {
      setLoading(true);
      setError(null);
      try {
        // PDF.js is served as a same-origin ESM asset to avoid bundling its
        // independent runtime into Next.js client chunks.
        // @ts-expect-error Runtime module served by the PDF.js asset route.
        const pdfjs = await import(/* webpackIgnore: true */ "/api/pdfjs/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = "/api/pdfjs/pdf.worker.min.mjs";
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("The merged PDF could not be loaded.");
        const bytes = new Uint8Array(await response.arrayBuffer());
        const task = pdfjs.getDocument({ data: bytes, enableXfa: false, isEvalSupported: false });
        loaded = await task.promise as PdfDocument;
        if (!active) {
          await loaded.destroy();
          return;
        }
        setDocument(loaded);
        setPageCount(loaded.numPages);
        setPageNumber(1);

        const previews: string[] = [];
        for (let index = 1; index <= loaded.numPages; index += 1) {
          if (!active) break;
          const page = await loaded.getPage(index);
          const viewport = page.getViewport({ scale: 0.2 });
          const canvas = window.document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) continue;
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          await page.render({ canvas, canvasContext: context, viewport }).promise;
          const blob = await canvasBlob(canvas);
          previews.push(URL.createObjectURL(blob));
          canvas.width = 0;
          canvas.height = 0;
        }
        if (active) {
          thumbnailUrls = previews;
          setThumbnails(previews);
        } else {
          previews.forEach(URL.revokeObjectURL);
        }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Could not open this PDF.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void openDocument();
    return () => {
      active = false;
      thumbnailUrls.forEach(URL.revokeObjectURL);
      if (loaded) void loaded.destroy();
    };
  }, [fileUrl]);

  useEffect(() => {
    let cancelled = false;
    async function renderCurrentPage() {
      if (!document || !canvasRef.current) return;
      try {
        const page = await document.getPage(pageNumber);
        if (cancelled || !canvasRef.current) return;
        const viewport = page.getViewport({ scale: zoom, rotation });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        await page.render({ canvas, canvasContext: context, viewport }).promise;
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not render this page.");
      }
    }
    void renderCurrentPage();
    return () => { cancelled = true; };
  }, [document, pageNumber, rotation, zoom]);

  const changePage = useCallback((next: number) => {
    setPageNumber(Math.max(1, Math.min(pageCount, next)));
  }, [pageCount]);

  const toggleFullscreen = useCallback(async () => {
    if (!shellRef.current) return;
    try {
      if (!window.document.fullscreenElement) await shellRef.current.requestFullscreen();
      else await window.document.exitFullscreen();
    } catch {
      setError("Fullscreen mode is not available in this browser.");
    }
  }, []);

  useEffect(() => {
    const onFullscreen = () => setFullscreen(Boolean(window.document.fullscreenElement));
    window.document.addEventListener("fullscreenchange", onFullscreen);
    return () => window.document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  return (
    <section ref={shellRef} className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label="Merged PDF preview">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50 text-[#cc4435]"><FileText className="h-5 w-5" /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">{fileName}</p>
            <p className="text-xs text-slate-500">{pageCount ? `${pageCount} pages` : "Preparing document preview"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
          <button type="button" onClick={() => changePage(pageNumber - 1)} disabled={pageNumber <= 1} aria-label="Previous page" className="rounded-lg p-2 text-slate-600 hover:bg-white disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
          <label className="flex items-center gap-1 px-1 text-xs text-slate-600">
            <input aria-label="Current page" type="number" min={1} max={pageCount || 1} value={pageNumber} onChange={(event) => changePage(Number(event.target.value) || 1)} className="w-10 rounded-md border border-slate-200 bg-white px-1 py-1 text-center font-semibold text-slate-800" />
            <span>/ {pageCount || "—"}</span>
          </label>
          <button type="button" onClick={() => changePage(pageNumber + 1)} disabled={pageNumber >= pageCount} aria-label="Next page" className="rounded-lg p-2 text-slate-600 hover:bg-white disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <button type="button" onClick={() => setZoom((value) => Math.max(0.5, Math.round((value - 0.1) * 10) / 10))} aria-label="Zoom out" className="rounded-lg p-2 text-slate-600 hover:bg-white"><Minus className="h-4 w-4" /></button>
          <span className="min-w-12 text-center text-xs font-semibold text-slate-700">{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoom((value) => Math.min(2, Math.round((value + 0.1) * 10) / 10))} aria-label="Zoom in" className="rounded-lg p-2 text-slate-600 hover:bg-white"><Plus className="h-4 w-4" /></button>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <button type="button" onClick={() => { setZoom(1); setRotation(0); }} aria-label="Reset zoom" title="Reset view" className="rounded-lg p-2 text-slate-600 hover:bg-white"><ZoomIn className="h-4 w-4" /></button>
          <button type="button" onClick={() => setRotation((value) => (value + 90) % 360)} aria-label="Rotate page" title="Rotate page" className="rounded-lg p-2 text-slate-600 hover:bg-white"><RotateCw className="h-4 w-4" /></button>
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} title={fullscreen ? "Exit fullscreen" : "Fullscreen"} className="rounded-lg p-2 text-slate-600 hover:bg-white">{fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
          <a href={fileUrl} download={fileName} aria-label="Download merged PDF" title="Download PDF" className="rounded-lg p-2 text-slate-600 hover:bg-white"><Download className="h-4 w-4" /></a>
        </div>
      </div>

      <div className="grid min-h-[520px] grid-cols-1 md:grid-cols-[156px_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-200 bg-slate-50/80 md:block">
          <div className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Pages {pageCount ? `(${pageCount})` : ""}</div>
          <div className="flex max-h-[650px] flex-col gap-3 overflow-y-auto p-3">
            {thumbnails.map((src, index) => (
              <button key={src} type="button" onClick={() => changePage(index + 1)} aria-label={`Go to page ${index + 1}`} aria-current={pageNumber === index + 1 ? "page" : undefined} className={`rounded-lg border p-2 transition ${pageNumber === index + 1 ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-slate-400"}`}>
                {/* Local object URLs are generated from the user's PDF in this browser. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Page ${index + 1} thumbnail`} className="mx-auto max-h-28 w-auto object-contain" loading="lazy" />
                <span className="mt-1 block text-center text-xs font-medium text-slate-600">{index + 1}</span>
              </button>
            ))}
            {loading && <p className="py-4 text-center text-xs text-slate-400">Creating previews…</p>}
          </div>
        </aside>

        <div className="relative flex min-h-[520px] items-start justify-center overflow-auto bg-slate-100 p-4 sm:p-7">
          {loading && <p className="absolute top-6 text-sm text-slate-500">Loading your merged PDF…</p>}
          {error && <p role="alert" className="absolute top-6 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
          <canvas ref={canvasRef} aria-label={`Page ${pageNumber} of ${pageCount}`} className="h-auto max-w-full bg-white shadow-[0_8px_28px_rgba(15,23,42,0.14)]" />
        </div>
      </div>
    </section>
  );
}
