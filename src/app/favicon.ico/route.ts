import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-static";

/** Serve the existing branded favicon at the conventional root URL. */
export async function GET() {
  const icon = await readFile(join(process.cwd(), "public", "assets", "favicon.ico"));

  return new Response(icon, {
    headers: {
      "Content-Type": "image/x-icon",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
