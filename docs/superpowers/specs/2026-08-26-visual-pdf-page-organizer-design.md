# Visual PDF Page Organizer Design

## Scope

This first frontend-only project adds a shared visual page organizer to the Merge PDF and Split PDF tools. It runs entirely in the browser, preserves the existing local-processing privacy model, and refuses jobs containing more than 100 total pages before generating the full thumbnail set.

Translation dictionaries and local OCR are separate projects. They will be designed and implemented after this organizer is complete.

## User experience

### Merge PDF

After users add at least two PDFs, the workspace reads the page counts and renders low-resolution thumbnails in the initial file and page order. Each thumbnail shows its source filename and original page number.

Users can:

- reorder individual pages by drag-and-drop;
- move a focused page left or right with explicit buttons;
- rotate a page clockwise in 90-degree steps;
- remove a page from the output; and
- add or remove source files while the tool is idle.

The merge button is enabled when at least one output page remains. The resulting PDF follows the organizer order and applies each page's selected rotation in addition to its original rotation.

### Split PDF

After users add one PDF, the workspace renders its pages as thumbnails. All pages begin selected. Clicking a page toggles its selection. Selected pages can be reordered using drag-and-drop or Move Left/Right buttons, and can be rotated before export.

The existing split modes remain:

- **One PDF per selected page:** produces individual files in the organizer order.
- **One combined PDF:** produces one PDF containing the selected pages in organizer order.

The text range field remains available as an accessible and efficient alternative. Changing the range updates the visual selection; visual changes update the range expression.

## Page limit and failure behavior

The organizer accepts at most 100 pages per job:

- Merge calculates the combined page count across every selected PDF.
- Split checks the single source PDF's page count.
- If the total exceeds 100, thumbnail generation stops and an error explains that the visual organizer supports 100 pages per job.
- No partial 100-page view is shown because silently hiding later pages could produce an incorrect document.
- Users can remove files or split a large source document into smaller jobs and try again.

Encrypted, malformed, or unreadable PDFs show a file-specific error. Aborted work does not update organizer state. Object URLs and PDF.js documents are released whenever files change, the workspace resets, or the component unmounts.

## Architecture

### Page manifest

A serializable `OrganizerPage` represents one output page:

```ts
interface OrganizerPage {
  id: string;
  fileIndex: number;
  sourcePageIndex: number;
  sourceName: string;
  rotation: 0 | 90 | 180 | 270;
  selected: boolean;
}
```

The stable ID is derived from the selected file instance and source page index. The manifest contains no document bytes or object URLs, so it can pass from the workspace to a runner without leaking preview concerns into the PDF engine.

### Thumbnail preparation

The raster engine exposes a multi-file preparation function that:

1. loads selected PDFs sequentially with PDF.js;
2. reads page counts before rendering thumbnails;
3. rejects the whole job if the combined count exceeds 100;
4. renders small JPEG thumbnails sequentially to bound peak memory; and
5. returns page metadata and thumbnail blobs.

The UI owns the resulting object URLs and revokes them explicitly.

### Shared organizer component

`PdfPageOrganizer` is a controlled component. It receives page metadata, thumbnails, the tool mode, and callbacks for reorder, selection, rotation, and removal. It does not load PDFs or execute conversions.

Sortable behavior uses a maintained React drag-and-drop library with pointer and keyboard sensors. Explicit Move Left and Move Right buttons remain available so the workflow never depends solely on dragging. Mobile users can drag with touch or use the buttons.

### Workspace state

`ToolWorkspace` owns the page manifest because it already owns files, rotations, options, cancellation, and reset behavior. A small organizer hook handles asynchronous thumbnail preparation and cleanup. The workspace passes the current manifest through `RunContext` as an optional `pagePlan`.

The organizer is mounted only for Merge PDF and Split PDF. Existing range-based page selectors for rotate, watermark, and image conversion remain unchanged.

### PDF execution

The PDF engine receives the selected files and page plan:

- Merge groups page-copy work by source document where useful, then appends copied pages in manifest order.
- Split copies only selected pages. Individual mode creates one output document per manifest entry; combined mode creates one document in manifest order.
- Each copied page receives the manifest rotation in addition to its original page rotation.

Metadata and flattened form appearances continue to use the existing preservation behavior.

## State synchronization

For Split PDF, range text and visual selection are two views of the same selection:

- a valid range expression updates `selected` values and preserves the expression's page order;
- a visual toggle or reorder writes a compact range expression when the order can be represented compactly;
- non-contiguous or reordered pages are written as an explicit comma-separated list;
- an invalid text range displays the existing validation error and does not discard the last valid visual state.

For Merge PDF, file additions append their pages after the current manifest. Removing a source file removes all pages from that file and reindexes remaining file references safely. Page-level removal affects only the manifest, not the selected source file list.

## Accessibility

- Every thumbnail has a descriptive label containing source filename, original page number, output position, selection state, and rotation.
- Reorder, rotate, select, and remove actions are real buttons with accessible names.
- Keyboard drag-and-drop is supported, but every operation also has a non-drag control.
- Status changes, thumbnail preparation progress, page-limit errors, and output-position changes use polite live regions.
- Focus remains on the moved page after a button reorder and moves to the nearest remaining page after removal.

## Testing

### Unit and engine tests

- manifest creation preserves file and page order;
- movement, drag reordering, selection, rotation, and removal are immutable;
- page totals over 100 are rejected before thumbnail rendering;
- merge output follows cross-file page order and cumulative rotations;
- split individual mode respects selection and order;
- split combined mode respects selection, order, and rotation; and
- range expressions synchronize with visual selection without losing reordered pages.

### Browser tests

- Merge PDF displays thumbnails for two uploaded PDFs, reorders a page, rotates it, removes another page, and produces the expected output page count and order.
- Split PDF selects a subset visually and produces individual ZIP results.
- Split PDF reorders selected pages and produces one combined PDF.
- Move buttons work at desktop and mobile viewport sizes.
- A 101-page fixture shows the limit error and disables processing.

## Out of scope

- More than 100 pages in one organizer job.
- Page duplication.
- Moving pages between separate output documents.
- Editing page contents.
- Preserving document-level bookmarks across arbitrary page reordering.
- Translation dictionaries and browser OCR, which follow as separate frontend-only projects.
