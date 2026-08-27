"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DeleteOutlined,
  HolderOutlined,
  LeftOutlined,
  RightOutlined,
  RotateRightOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import {
  moveOrganizerPage,
  removeOrganizerPage,
  reorderOrganizerPages,
  rotateOrganizerPage,
  toggleOrganizerPage,
} from "../../tools/page-organizer";
import type { OrganizerPage } from "../../tools/types";

interface Props {
  mode: "merge" | "split";
  pages: OrganizerPage[];
  thumbnailUrls: Record<string, string>;
  disabled?: boolean;
  onChange: (pages: OrganizerPage[]) => void;
}

interface SortablePageProps {
  mode: Props["mode"];
  page: OrganizerPage;
  thumbnailUrl?: string;
  index: number;
  outputPosition: number | null;
  pageCount: number;
  disabled: boolean;
  onMove: (page: OrganizerPage, delta: -1 | 1) => void;
  onRotate: (page: OrganizerPage) => void;
  onRemove: (page: OrganizerPage) => void;
  onToggle: (page: OrganizerPage) => void;
}

function pageLabel(page: OrganizerPage): string {
  return `${page.sourceName} page ${page.sourcePageIndex + 1}`;
}

function focusPage(id: string): void {
  window.requestAnimationFrame(() => {
    const card = Array.from(document.querySelectorAll<HTMLElement>("[data-page-id]"))
      .find((element) => element.dataset.pageId === id);
    card?.focus();
  });
}

function SortablePage({
  mode,
  page,
  thumbnailUrl,
  index,
  outputPosition,
  pageCount,
  disabled,
  onMove,
  onRotate,
  onRemove,
  onToggle,
}: SortablePageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id, disabled });
  const label = pageLabel(page);
  const positionText = outputPosition === null
    ? "Output position — not selected"
    : `Output position ${outputPosition}`;

  return (
    <li
      ref={setNodeRef}
      data-page-id={page.id}
      tabIndex={-1}
      aria-label={`${label}, ${page.selected ? "selected" : "not selected"}, ${positionText.toLowerCase()}, rotation ${page.rotation} degrees`}
      className={`relative rounded-xl border bg-white p-2 shadow-sm outline-none transition-shadow focus:ring-2 focus:ring-blue-500 ${
        page.selected ? "border-gray-200" : "border-gray-300 opacity-60"
      } ${isDragging ? "z-10 shadow-xl" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold text-gray-800">{label}</span>
        <Button
          size="small"
          type="text"
          disabled={disabled}
          icon={<HolderOutlined />}
          className="cursor-grab touch-none active:cursor-grabbing"
          aria-label={`Drag ${label}`}
          {...attributes}
          {...listeners}
        />
      </div>

      {mode === "split" ? (
        <button
          type="button"
          className="block w-full cursor-pointer rounded-lg bg-gray-100 p-2 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
          disabled={disabled}
          aria-label={`${page.selected ? "Deselect" : "Select"} ${label}`}
          aria-pressed={page.selected}
          onClick={() => onToggle(page)}
        >
          <PagePreview page={page} thumbnailUrl={thumbnailUrl} />
        </button>
      ) : (
        <div role="img" aria-label={`Preview of ${label}`} className="rounded-lg bg-gray-100 p-2">
          <PagePreview page={page} thumbnailUrl={thumbnailUrl} />
        </div>
      )}

      <div className="mt-2">
        <p className="truncate text-xs text-gray-600">{page.sourceName} · page {page.sourcePageIndex + 1}</p>
        <p className="text-xs font-medium text-blue-900">{positionText} · {page.rotation}°</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <Button
          size="small"
          type="text"
          disabled={disabled || index === 0}
          icon={<LeftOutlined />}
          aria-label={`Move ${label} left`}
          onClick={() => onMove(page, -1)}
        />
        <Button
          size="small"
          type="text"
          disabled={disabled || index === pageCount - 1}
          icon={<RightOutlined />}
          aria-label={`Move ${label} right`}
          onClick={() => onMove(page, 1)}
        />
        <Button
          size="small"
          type="text"
          disabled={disabled}
          icon={<RotateRightOutlined />}
          aria-label={`Rotate ${label} clockwise`}
          onClick={() => onRotate(page)}
        />
        {mode === "merge" && (
          <Button
            size="small"
            type="text"
            danger
            disabled={disabled || pageCount <= 1}
            icon={<DeleteOutlined />}
            aria-label={`Remove ${label}`}
            onClick={() => onRemove(page)}
          />
        )}
      </div>
    </li>
  );
}

function PagePreview({ page, thumbnailUrl }: { page: OrganizerPage; thumbnailUrl?: string }) {
  return (
    <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded bg-white">
      {thumbnailUrl ? (
        <Image
          src={thumbnailUrl}
          alt=""
          draggable={false}
          width={180}
          height={240}
          unoptimized
          className="max-h-full max-w-full object-contain transition-transform"
          style={{
            transform: `rotate(${page.rotation}deg) scale(${page.rotation % 180 === 0 ? 1 : 0.72})`,
          }}
        />
      ) : (
        <span className="text-xs text-gray-500">Preview unavailable</span>
      )}
    </div>
  );
}

export default function PdfPageOrganizer({
  mode,
  pages,
  thumbnailUrls,
  disabled = false,
  onChange,
}: Props) {
  const [announcement, setAnnouncement] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const selectedPositions = new Map(
    pages.filter((page) => page.selected).map((page, index) => [page.id, index + 1])
  );
  const announcements = useMemo<Announcements>(() => {
    const describe = (nextPages: OrganizerPage[], id: string) => {
      const page = nextPages.find((item) => item.id === id);
      if (!page) return "PDF page. Output position unavailable.";
      const outputPosition = nextPages
        .filter((item) => item.selected)
        .findIndex((item) => item.id === id) + 1;
      return page.selected
        ? `${pageLabel(page)}. Output position ${outputPosition}.`
        : `${pageLabel(page)}. Not selected for output.`;
    };
    const pagesAtDestination = (activeId: string, overId?: string) =>
      overId ? reorderOrganizerPages(pages, activeId, overId) : pages;

    return {
      onDragStart: ({ active }) => `Picked up ${describe(pages, String(active.id))}`,
      onDragOver: ({ active, over }) => {
        const activeId = String(active.id);
        return `Moving ${describe(pagesAtDestination(activeId, over ? String(over.id) : undefined), activeId)}`;
      },
      onDragEnd: ({ active, over }) => {
        const activeId = String(active.id);
        return `Dropped ${describe(pagesAtDestination(activeId, over ? String(over.id) : undefined), activeId)}`;
      },
      onDragCancel: ({ active }) => `Cancelled drag for ${describe(pages, String(active.id))}`,
    };
  }, [pages]);

  const announcePosition = (action: string, next: OrganizerPage[], id: string) => {
    const page = next.find((item) => item.id === id);
    if (!page) return;
    const outputPosition = next.filter((item) => item.selected).findIndex((item) => item.id === id) + 1;
    setAnnouncement(
      `${action} ${pageLabel(page)}. ${page.selected ? `Output position ${outputPosition}.` : "Not selected for output."}`
    );
  };

  const move = (page: OrganizerPage, delta: -1 | 1) => {
    const next = moveOrganizerPage(pages, page.id, delta);
    onChange(next);
    announcePosition("Moved", next, page.id);
    focusPage(page.id);
  };

  const rotate = (page: OrganizerPage) => {
    const next = rotateOrganizerPage(pages, page.id);
    onChange(next);
    const rotated = next.find((item) => item.id === page.id);
    announcePosition(`Rotated ${rotated?.rotation ?? page.rotation} degrees,`, next, page.id);
  };

  const remove = (page: OrganizerPage) => {
    if (pages.length <= 1) return;
    const index = pages.findIndex((item) => item.id === page.id);
    const next = removeOrganizerPage(pages, page.id);
    const focusTarget = next[Math.min(index, next.length - 1)];
    onChange(next);
    const focusPosition = focusTarget
      ? next.filter((item) => item.selected).findIndex((item) => item.id === focusTarget.id) + 1
      : 0;
    setAnnouncement(
      `Removed ${pageLabel(page)}. ${next.length} pages remain.${
        focusTarget?.selected ? ` ${pageLabel(focusTarget)} is output position ${focusPosition}.` : ""
      }`
    );
    if (focusTarget) focusPage(focusTarget.id);
  };

  const toggle = (page: OrganizerPage) => {
    const next = toggleOrganizerPage(pages, page.id);
    onChange(next);
    const changed = next.find((item) => item.id === page.id);
    announcePosition(changed?.selected ? "Selected" : "Deselected", next, page.id);
  };

  const dragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const next = reorderOrganizerPages(pages, String(active.id), String(over.id));
    onChange(next);
    focusPage(String(active.id));
  };

  return (
    <section className="mt-6" aria-labelledby="pdf-page-organizer-heading">
      <h2 id="pdf-page-organizer-heading" className="mb-3 text-base font-semibold text-blue-950">
        {mode === "merge" ? `Arrange ${pages.length} pages` : `Choose and arrange ${pages.length} pages`}
      </h2>
      <p className="mb-3 text-sm text-gray-600">
        {mode === "merge"
          ? "Drag pages or use the arrow buttons to set the final PDF order."
          : `${selectedPositions.size} of ${pages.length} pages selected.`}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        accessibility={{ announcements }}
        onDragEnd={dragEnd}
      >
        <SortableContext items={pages.map((page) => page.id)} strategy={rectSortingStrategy}>
          <ol
            aria-label="PDF pages"
            className="grid max-h-[42rem] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3 lg:grid-cols-4"
          >
            {pages.map((page, index) => (
              <SortablePage
                key={page.id}
                mode={mode}
                page={page}
                thumbnailUrl={thumbnailUrls[page.id]}
                index={index}
                outputPosition={selectedPositions.get(page.id) ?? null}
                pageCount={pages.length}
                disabled={disabled}
                onMove={move}
                onRotate={rotate}
                onRemove={remove}
                onToggle={toggle}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>
    </section>
  );
}
