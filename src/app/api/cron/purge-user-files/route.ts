import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BATCH_SIZE = 100;

function cronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!cronAuthorized(request)) return new NextResponse("Unauthorized", { status: 401 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return new NextResponse("Archive cleanup is not configured.", { status: 503 });

  const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const { data: expired, error } = await supabase
    .from("user_files")
    .select("id, storage_path")
    .lte("expires_at", new Date().toISOString())
    .order("expires_at", { ascending: true })
    .limit(BATCH_SIZE);
  if (error) return NextResponse.json({ error: "Could not locate expired files." }, { status: 500 });
  if (!expired?.length) return NextResponse.json({ deleted: 0 });

  const { error: removeError } = await supabase.storage.from("user-files").remove(expired.map((file) => file.storage_path));
  if (removeError) return NextResponse.json({ error: "Could not remove expired file objects." }, { status: 502 });

  const { error: deleteError } = await supabase.from("user_files").delete().in("id", expired.map((file) => file.id));
  if (deleteError) return NextResponse.json({ error: "Could not remove expired file records." }, { status: 500 });
  return NextResponse.json({ deleted: expired.length });
}
