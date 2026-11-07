"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileClock, FileText } from "lucide-react";
import Container from "../../components/ui/Container";
import { createBrowserSupabaseClient } from "../../lib/supabase/client";
import { pythonApi } from "../../lib/python-api";

type SavedFile = {
  id: string;
  tool: string;
  original_name: string;
  size_bytes: number;
  created_at: string;
  expires_at: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1);
  return `${(bytes / 1024 ** (index + 1)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function SavedFilesPage() {
  const router = useRouter();
  const [files, setFiles] = useState<SavedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { session } } = await createBrowserSupabaseClient().auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/files");
        return;
      }
      try {
        const response = await fetch(pythonApi("/files"), {
          headers: { Authorization: `Bearer ${session.access_token}` },
          cache: "no-store",
        });
        if (response.status === 401) {
          router.replace("/login?redirect=/files");
          return;
        }
        if (!response.ok) throw new Error("Could not load your saved files. Please try again.");
        const result = await response.json() as SavedFile[];
        if (active) setFiles(result);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : "Could not load your saved files.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [router]);

  async function downloadFile(file: SavedFile) {
    setDownloadId(file.id);
    setError(null);
    try {
      const { data: { session } } = await createBrowserSupabaseClient().auth.getSession();
      if (!session) {
        router.replace("/login?redirect=/files");
        return;
      }
      const response = await fetch(pythonApi(`/files/${encodeURIComponent(file.id)}`), {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!response.ok) throw new Error("File not found or temporarily unavailable.");
      const url = URL.createObjectURL(await response.blob());
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.original_name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not download this file.");
    } finally {
      setDownloadId(null);
    }
  }

  return (
    <Container as="main" className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--primary)]">Your archive</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">Saved files</h1>
        <p className="mt-3 text-[var(--text-secondary)]">Completed files are private to your account and available to download for 30 days.</p>
      </div>
      {error ? <p className="mt-6 text-sm text-red-700" role="alert">{error}</p> : null}
      {loading ? <p className="mt-8 text-[var(--text-secondary)]" role="status">Loading your files…</p> : files.length ? (
        <ul className="mt-8 divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
          {files.map((file) => (
            <li key={file.id} className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <FileText className="h-6 w-6 shrink-0 text-[var(--primary)]" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[var(--text-primary)]">{file.original_name}</p>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{file.tool} · {formatBytes(file.size_bytes)} · expires {new Date(file.expires_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button type="button" onClick={() => void downloadFile(file)} disabled={downloadId === file.id} className="pdfnova-secondary-button !min-h-10 !px-4" aria-label={`Download ${file.original_name}`}>
                <Download className="h-4 w-4" /> {downloadId === file.id ? "Downloading…" : "Download"}
              </button>
            </li>
          ))}
        </ul>
      ) : !loading ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-white p-8 text-center">
          <FileClock className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
          <h2 className="mt-3 font-bold text-[var(--text-primary)]">No saved files yet</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in, complete a tool, and its result will appear here.</p>
        </div>
      ) : null}
    </Container>
  );
}
