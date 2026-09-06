import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login?redirect=/files", _request.url));

  const { data: file } = await supabase
    .from("user_files")
    .select("storage_path, expires_at")
    .eq("id", id)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (!file) return new NextResponse("File not found or expired.", { status: 404 });

  const { data, error } = await supabase.storage
    .from("user-files")
    .createSignedUrl(file.storage_path, 60, { download: true });
  if (error || !data?.signedUrl) return new NextResponse("File is temporarily unavailable.", { status: 503 });
  return NextResponse.redirect(data.signedUrl);
}
