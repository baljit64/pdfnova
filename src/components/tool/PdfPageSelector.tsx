"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Spin } from "antd";
import { CheckCircle2 } from "lucide-react";
import { parsePageRanges } from "../../tools/engine/pdf";

interface Props {
  file: File;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  watermark?: {
    kind: "text" | "image";
    text: string;
    image?: File;
    position: string;
    fontSize: number;
    fontFamily: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    color: string;
    opacity: number;
    rotation: number;
    imageWidth: number;
    mosaic: boolean;
    pages: string;
  };
}

function compactPages(pages: number[]): string {
  const sorted = [...pages].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let index = 0; index < sorted.length; index++) {
    const start = sorted[index];
    let end = start;
    while (index + 1 < sorted.length && sorted[index + 1] === end + 1) {
      end = sorted[++index];
    }
    parts.push(start === end ? String(start) : `${start}-${end}`);
  }
  return parts.join(", ");
}

export default function PdfPageSelector({ file, value, disabled, onChange, watermark }: Props) {
  const [items, setItems] = useState<Array<{ pageNumber: number; url: string }>>([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (watermark?.kind !== "image" || !watermark.image) {
      setImageUrl(null);
      return;
    }
    const url = URL.createObjectURL(watermark.image);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [watermark?.image, watermark?.kind]);

  useEffect(() => {
    const controller = new AbortController();
    let urls: string[] = [];
    setItems([]);
    setPageCount(0);
    setLoading(true);
    setError(null);

    import("../../tools/engine/raster")
      .then(({ renderPdfThumbnails }) => renderPdfThumbnails(file, controller.signal))
      .then(({ thumbnails, pageCount: nextPageCount }) => {
        if (controller.signal.aborted) return;
        urls = thumbnails.map((thumbnail) => URL.createObjectURL(thumbnail.blob));
        setItems(thumbnails.map((thumbnail, index) => ({
          pageNumber: thumbnail.pageNumber,
          url: urls[index],
        })));
        setPageCount(nextPageCount);
      })
      .catch((caught) => {
        if (!controller.signal.aborted) {
          setError(caught instanceof Error ? caught.message : "Could not create page previews.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => {
      controller.abort();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [file]);

  const selected = useMemo(() => {
    if (!value.trim() || pageCount === 0) return new Set<number>();
    try {
      return new Set(parsePageRanges(value, pageCount).map((index) => index + 1));
    } catch {
      return new Set<number>();
    }
  }, [pageCount, value]);

  const watermarkPages = useMemo(() => {
    if (!watermark?.pages.trim() || pageCount === 0) return null;
    try {
      return new Set(parsePageRanges(watermark.pages, pageCount).map((index) => index + 1));
    } catch {
      return new Set<number>();
    }
  }, [pageCount, watermark?.pages]);

  if (loading) {
    return <div className="mt-5 flex items-center gap-3 text-sm text-[var(--text-secondary)]"><Spin size="small" /> Preparing page previews…</div>;
  }
  if (error) return <p className="mt-4 text-sm text-amber-700">Preview unavailable: {error}</p>;

  const toggle = (pageNumber: number) => {
    const next = value.trim()
      ? new Set(selected)
      : new Set<number>([pageNumber]);
    if (value.trim() && next.has(pageNumber)) next.delete(pageNumber);
    else next.add(pageNumber);
    onChange(next.size === 0 || next.size === pageCount ? "" : compactPages([...next]));
  };

  const watermarkPage = items.find((item) => !watermarkPages || watermarkPages.has(item.pageNumber)) ?? items[0];

  return (
    <section className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--page)] p-4 sm:p-5" aria-label="Page preview and selection">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Choose pages visually</h3>
          <p className="text-xs text-[var(--text-muted)]">
            {value.trim() ? `${selected.size} of ${pageCount} pages selected` : `All ${pageCount} pages selected`}
          </p>
        </div>
        {value.trim() && <Button size="small" onClick={() => onChange("")} disabled={disabled}>Select all</Button>}
      </div>

      {watermark && watermarkPage && (
        <div className="mb-5 rounded-xl border border-[var(--border)] bg-white p-4">
          <div className="mb-3">
            <h4 className="text-sm font-bold text-[var(--text-primary)]">Live watermark preview</h4>
            <p className="text-xs text-[var(--text-muted)]">Page {watermarkPage.pageNumber} · updates as you change the settings</p>
          </div>
          <div className="mx-auto w-full max-w-[340px]">
            <div className="relative mx-auto aspect-[0.72] w-full overflow-hidden bg-white shadow-md [container-type:inline-size]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={watermarkPage.url} alt={`Preview of page ${watermarkPage.pageNumber}`} className="absolute inset-0 h-full w-full object-contain" />
              {(!watermarkPages || watermarkPages.has(watermarkPage.pageNumber)) && (
                <WatermarkStamp watermark={watermark} imageUrl={imageUrl} />
              )}
            </div>
          </div>
        </div>
      )}

      <ul className="grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-3 sm:grid-cols-5 md:grid-cols-6">
        {items.map((item) => {
          const active = !value.trim() || selected.has(item.pageNumber);
          return (
            <li key={item.pageNumber}>
              <button
                type="button"
                disabled={disabled}
                aria-pressed={active}
                aria-label={`${active ? "Deselect" : "Select"} page ${item.pageNumber}`}
                onClick={() => toggle(item.pageNumber)}
                className={`relative w-full overflow-hidden rounded-lg border-2 bg-white p-1 text-left transition ${active ? "border-[var(--primary)]" : "border-transparent opacity-55 hover:opacity-80"}`}
              >
                {/* Object URLs are local previews and do not benefit from next/image. */}
                <div className="relative mx-auto block aspect-[0.72] w-full overflow-hidden [container-type:inline-size]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
                  {watermark && (!watermarkPages || watermarkPages.has(item.pageNumber)) && (
                    <WatermarkStamp watermark={watermark} imageUrl={imageUrl} />
                  )}
                </div>
                <span className="mt-1 block text-center text-xs font-medium">{item.pageNumber}</span>
                {active && <CheckCircle2 className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white text-[var(--primary)]" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
      {pageCount > items.length && <p className="mt-2 text-xs text-amber-700">Showing the first {items.length} of {pageCount} pages. Use the page-range field for later pages.</p>}
    </section>
  );
}

function WatermarkStamp({ watermark, imageUrl }: { watermark: NonNullable<Props["watermark"]>; imageUrl: string | null }) {
  if (watermark.kind === "image" && !imageUrl) return null;
  if (watermark.kind === "text" && !watermark.text.trim()) return null;

  const positions: Record<string, { left: string; top: string }> = {
    "top-left": { left: "12%", top: "12%" },
    "top-center": { left: "50%", top: "12%" },
    "top-right": { left: "88%", top: "12%" },
    "middle-left": { left: "12%", top: "50%" },
    center: { left: "50%", top: "50%" },
    "middle-right": { left: "88%", top: "50%" },
    "bottom-left": { left: "12%", top: "88%" },
    "bottom-center": { left: "50%", top: "88%" },
    "bottom-right": { left: "88%", top: "88%" },
  };
  const point = positions[watermark.position] ?? positions.center;
  const fontSize = `${Math.max(1, watermark.fontSize * 0.168)}cqw`;
  const stamp = (
    <span
      className="block max-w-[84cqw] truncate leading-tight"
      style={{
        color: watermark.color,
        opacity: watermark.opacity,
        fontFamily: watermark.fontFamily === "Times Roman" ? "serif" : watermark.fontFamily === "Courier" ? "monospace" : "Arial, sans-serif",
        fontSize,
        fontWeight: watermark.bold ? 700 : 400,
        fontStyle: watermark.italic ? "italic" : "normal",
        textDecoration: watermark.underline ? "underline" : "none",
        transform: watermark.mosaic ? `rotate(${watermark.rotation}deg)` : "none",
        transformOrigin: "center",
        whiteSpace: "nowrap",
      }}
    >
      {watermark.text || "PDFNova"}
    </span>
  );

  if (watermark.mosaic) {
    return (
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 place-items-center overflow-hidden" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <span key={index} className="flex h-full w-full items-center justify-center overflow-hidden">
            {watermark.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl!} alt="" style={{ width: `${Math.min(270, Math.max(15, watermark.imageWidth * 3))}%`, opacity: watermark.opacity, transform: `rotate(${watermark.rotation}deg)` }} />
            ) : stamp}
          </span>
        ))}
      </div>
    );
  }

  return (
    <span
      className="absolute z-10 flex w-[84%] items-center justify-center overflow-hidden"
      style={{ ...point, transform: `translate(-50%, -50%) rotate(${watermark.rotation}deg)` }}
      aria-hidden="true"
    >
      {watermark.kind === "image" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl!} alt="" style={{ width: `${Math.min(107, Math.max(6, (watermark.imageWidth / 84) * 100))}%`, maxWidth: "100%", opacity: watermark.opacity }} />
      ) : stamp}
    </span>
  );
}
