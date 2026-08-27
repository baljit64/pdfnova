"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  duplicateOrganizerInputError,
  organizerPreviewStatus,
  pruneInactiveOrganizerSources,
  reconcileOrganizerPages,
} from "../../tools/page-organizer";
import type { OrganizerPreviewError } from "../../tools/page-organizer";
import type { OrganizerPage } from "../../tools/types";
import type { PdfOrganizerInput } from "../../tools/engine/raster";

const fileKeys = new WeakMap<File, string>();
let nextFileKey = 1;

function fileKeyFor(file: File): string {
  const existing = fileKeys.get(file);
  if (existing) return existing;
  const key = `file-${nextFileKey++}`;
  fileKeys.set(file, key);
  return key;
}

function revokeThumbnailUrls(urls: Record<string, string>): void {
  Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
}

export function usePdfPageOrganizer(files: File[], enabled: boolean) {
  const inputs = useMemo<PdfOrganizerInput[]>(
    () => files.map((file, fileIndex) => ({
      file,
      fileKey: fileKeyFor(file),
      fileIndex,
    })),
    [files]
  );
  const duplicateInputError = useMemo(
    () => duplicateOrganizerInputError(inputs.map(({ fileKey }) => fileKey)),
    [inputs]
  );
  const sourceSignature = useMemo(
    () => enabled && inputs.length > 0
      ? inputs.map(({ fileKey, fileIndex }) => `${fileIndex}:${fileKey}`).join("|")
      : "",
    [enabled, inputs]
  );

  const [pagesState, setPagesState] = useState<OrganizerPage[]>([]);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const [errorState, setErrorState] = useState<OrganizerPreviewError | null>(null);
  const [readySignature, setReadySignature] = useState<string | null>(null);
  const [settledSignature, setSettledSignature] = useState<string | null>(null);
  const pagesRef = useRef(pagesState);
  const controllerRef = useRef<AbortController | null>(null);
  const thumbnailUrlsRef = useRef<Record<string, string>>({});
  const knownIdsRef = useRef<Set<string>>(new Set());

  const setPages = useCallback((next: React.SetStateAction<OrganizerPage[]>) => {
    const resolved = typeof next === "function" ? next(pagesRef.current) : next;
    pagesRef.current = resolved;
    setPagesState(resolved);
  }, []);

  const releaseThumbnailUrls = useCallback(() => {
    revokeThumbnailUrls(thumbnailUrlsRef.current);
    thumbnailUrlsRef.current = {};
    setThumbnailUrls({});
  }, []);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      revokeThumbnailUrls(thumbnailUrlsRef.current);
      thumbnailUrlsRef.current = {};
    };
  }, []);

  useEffect(() => {
    controllerRef.current?.abort();
    releaseThumbnailUrls();

    if (!sourceSignature) {
      setPages([]);
      knownIdsRef.current.clear();
      setErrorState(null);
      setReadySignature(null);
      setSettledSignature(null);
      return;
    }

    const activeFileKeys = new Set(inputs.map(({ fileKey }) => fileKey));
    const pruned = pruneInactiveOrganizerSources(
      pagesRef.current,
      knownIdsRef.current,
      activeFileKeys
    );
    knownIdsRef.current = pruned.knownIds;
    setPages(pruned.pages);

    if (duplicateInputError) {
      setErrorState({ signature: sourceSignature, message: duplicateInputError });
      setReadySignature(null);
      setSettledSignature(sourceSignature);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;
    let pendingUrls: Record<string, string> = {};
    setErrorState(null);
    setReadySignature(null);
    setSettledSignature(null);

    void import("../../tools/engine/raster")
      .then(({ renderPdfOrganizerThumbnails }) => renderPdfOrganizerThumbnails(inputs, controller.signal))
      .then((thumbnails) => {
        if (controller.signal.aborted) return;
        pendingUrls = {};
        for (const thumbnail of thumbnails) {
          pendingUrls[thumbnail.id] = URL.createObjectURL(thumbnail.blob);
        }
        if (controller.signal.aborted) {
          revokeThumbnailUrls(pendingUrls);
          pendingUrls = {};
          return;
        }

        const prepared: OrganizerPage[] = thumbnails.map(({ id, fileIndex, sourcePageIndex, sourceName }) => ({
          id,
          fileIndex,
          sourcePageIndex,
          sourceName,
          rotation: 0,
          selected: true,
        }));
        const previouslyLoadedIds = knownIdsRef.current;
        setPages((current) => reconcileOrganizerPages(current, prepared, previouslyLoadedIds));
        knownIdsRef.current = new Set(prepared.map((page) => page.id));
        thumbnailUrlsRef.current = pendingUrls;
        setThumbnailUrls(pendingUrls);
        pendingUrls = {};
        setErrorState(null);
        setReadySignature(sourceSignature);
        setSettledSignature(sourceSignature);
      })
      .catch((caught: unknown) => {
        if (controller.signal.aborted) return;
        revokeThumbnailUrls(pendingUrls);
        pendingUrls = {};
        releaseThumbnailUrls();
        setReadySignature(null);
        setSettledSignature(sourceSignature);
        setErrorState({
          signature: sourceSignature,
          message: caught instanceof Error ? caught.message : "Could not create page previews.",
        });
      })
      .finally(() => {
        if (controllerRef.current === controller) controllerRef.current = null;
      });

    return () => {
      controller.abort();
      revokeThumbnailUrls(pendingUrls);
    };
  }, [duplicateInputError, inputs, releaseThumbnailUrls, setPages, sourceSignature]);

  const status = organizerPreviewStatus(
    sourceSignature,
    readySignature,
    settledSignature,
    errorState
  );

  return {
    pages: pagesState,
    setPages,
    thumbnailUrls,
    error: status.error,
    loading: status.loading,
    ready: status.ready,
    sourceSignature,
  };
}
