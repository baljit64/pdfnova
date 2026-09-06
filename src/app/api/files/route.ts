import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "user-files";
const MAX_RESULT_BYTES = 50 * 1024 * 1024;

function safeFileName(name: string): string {
  const clean = name.replace(/[\\/\0]/g, "_").replace(/[^a-zA-Z0-9._ -]/g, "_").trim();
  return (clean || "result").slice(0, 180);
}

function safeTool(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const tool = value.trim();
  return /^[a-z0-9-]{1,80}$/.test(tool) ? tool : null;
}

/** Archives a completed result. The user identity comes only from the session cookie. */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Sign in to save files." }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    const tool = safeTool(form.get("tool"));
    if (!(file instanceof File) || !tool) {
      return NextResponse.json({ error: "A completed file and tool are required." }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_RESULT_BYTES) {
      return NextResponse.json({ error: "Saved files must be 50 MB or smaller." }, { status: 413 });
    }

    const name = safeFileName(file.name);
    const objectPath = `${user.id}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${name}`;
    const contentType = file.type || "application/octet-stream";
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, file, {
      contentType,
      cacheControl: "private, max-age=0",
      upsert: false,
    });
    if (uploadError) throw uploadError;

    const { data, error: recordError } = await supabase
      .from("user_files")
      .insert({
        user_id: user.id,
        tool,
        original_name: name,
        storage_path: objectPath,
        content_type: contentType,
        size_bytes: file.size,
      })
      .select("id, expires_at")
      .single();

    if (recordError) {
      await supabase.storage.from(BUCKET).remove([objectPath]);
      throw recordError;
    }
    return NextResponse.json({ id: data.id, expiresAt: data.expires_at }, { status: 201 });
  } catch (error) {
    console.error("Could not archive completed file.", error);
    return NextResponse.json({ error: "We could not save this result." }, { status: 502 });
  }
}
