"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Spin } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
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
    return <div className="mt-5 flex items-center gap-3 text-sm text-gray-600"><Spin size="small" /> Preparing page previews…</div>;
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
    <section className="mt-6" aria-label="Page preview and selection">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Choose pages visually</h3>
          <p className="text-xs text-gray-500">
            {value.trim() ? `${selected.size} of ${pageCount} pages selected` : `All ${pageCount} pages selected`}
          </p>
        </div>
        {value.trim() && <Button size="small" onClick={() => onChange("")} disabled={disabled}>Select all</Button>}
      </div>

      <ul className="grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-5 md:grid-cols-6">
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
                className={`relative w-full overflow-hidden rounded-md border-2 bg-white p-1 text-left transition ${active ? "border-blue-600" : "border-transparent opacity-55 hover:opacity-80"}`}
              >
                {/* Object URLs are local previews and do not benefit from next/image. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt="" className="aspect-[0.72] w-full object-contain" />
                <span className="mt-1 block text-center text-xs font-medium">{item.pageNumber}</span>
                {active && <CheckCircleFilled className="absolute right-1 top-1 rounded-full bg-white text-blue-600" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
      {pageCount > items.length && <p className="mt-2 text-xs text-amber-700">Showing the first {items.length} of {pageCount} pages. Use the page-range field for later pages.</p>}
    </section>
  );
}
