import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileClock, FileText } from "lucide-react";
import Container from "../../components/ui/Container";
import { createServerSupabaseClient } from "../../lib/supabase/server";

export const metadata = { title: "Saved files | PDFNova", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1);
  return `${(bytes / 1024 ** (index + 1)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default async function SavedFilesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/files");

  const { data: files } = await supabase
    .from("user_files")
    .select("id, tool, original_name, size_bytes, created_at, expires_at")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  return (
    <Container as="main" className="py-12 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--primary)]">Your archive</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl">Saved files</h1>
        <p className="mt-3 text-[var(--text-secondary)]">Completed files are private to your account and are permanently deleted 30 days after creation.</p>
      </div>
      {files?.length ? (
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
              <Link href={`/api/files/${file.id}`} className="pdfnova-secondary-button !min-h-10 !px-4" aria-label={`Download ${file.original_name}`}>
                <Download className="h-4 w-4" /> Download
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-white p-8 text-center">
          <FileClock className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
          <h2 className="mt-3 font-bold text-[var(--text-primary)]">No saved files yet</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in, complete a tool, and its result will appear here.</p>
        </div>
      )}
    </Container>
  );
}
