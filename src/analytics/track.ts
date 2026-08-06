/**
 * Reusable event tracking for every tool surface.
 *
 * Deliberately provider-agnostic: events are pushed to `window.dataLayer` and,
 * when present, forwarded to `gtag`. With no analytics installed this is a no-op,
 * so nothing here can break a page render.
 */

export type ToolEventName =
  | "upload_started"
  | "upload_completed"
  | "upload_rejected"
  | "processing_started"
  | "processing_completed"
  | "processing_failed"
  | "processing_cancelled"
  | "processing_retried"
  | "download_clicked"
  | "download_all_clicked"
  | "tool_reset";

export interface ToolEventPayload {
  /** Tool id, e.g. "merge-pdf". */
  tool: string;
  /** Route the event happened on, so landing-page performance is comparable. */
  page: string;
  /** Landing variation id, or "canonical" for the parent tool page. */
  variation: string;
  fileCount?: number;
  totalBytes?: number;
  outputCount?: number;
  durationMs?: number;
  errorMessage?: string;
  [key: string]: string | number | undefined;
}

interface AnalyticsWindow extends Window {
  dataLayer?: Record<string, unknown>[];
  gtag?: (command: string, eventName: string, params: Record<string, unknown>) => void;
}

export function track(event: ToolEventName, payload: ToolEventPayload): void {
  if (typeof window === "undefined") return;

  const target = window as AnalyticsWindow;
  const detail = { event: `pdfnova_${event}`, ...payload };

  try {
    target.dataLayer = target.dataLayer || [];
    target.dataLayer.push(detail);
    target.gtag?.("event", `pdfnova_${event}`, payload);
  } catch {
    // Analytics must never take a tool down with it.
  }
}
