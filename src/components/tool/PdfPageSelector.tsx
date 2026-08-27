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

export default function PdfPageSelector({ file, value, disabled, onChange }: Props) {
  const [items, setItems] = useState<Array<{ pageNumber: number; url: string }>>([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="aspect-[0.72] w-full object-contain" />
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
