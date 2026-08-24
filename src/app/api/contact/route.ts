import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5_000;

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    return new URL(origin).host === new URL(req.url).host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  const endpoint = process.env.CONTACT_FORM_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json(
      { error: "The contact form is not configured yet. Please use the Help page for now." },
      { status: 503 }
    );
  }

  let endpointUrl: URL;
  try {
    endpointUrl = new URL(endpoint);
    if (endpointUrl.protocol !== "https:") throw new Error("HTTPS required");
  } catch {
    return NextResponse.json({ error: "The contact service is unavailable." }, { status: 503 });
  }

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid contact form data." }, { status: 400 });
  }

  const values = input as Record<string, unknown>;
  const name = typeof values.name === "string" ? values.name.trim() : "";
  const email = typeof values.email === "string" ? values.email.trim() : "";
  const message = typeof values.message === "string" ? values.message.trim() : "";
  const website = typeof values.website === "string" ? values.website.trim() : "";

  // Quietly accept honeypot submissions so bots do not learn how to bypass it.
  if (website) return NextResponse.json({ ok: true });

  if (
    !name ||
    name.length > MAX_NAME_LENGTH ||
    !isEmail(email) ||
    email.length > MAX_EMAIL_LENGTH ||
    !message ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json({ error: "Please check the contact form fields." }, { status: 400 });
  }

  try {
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ name, email, message, source: "PDFNova contact form" }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`Contact webhook returned ${response.status}`);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "We could not send your message. Please try again later." },
      { status: 502 }
    );
  }
}
