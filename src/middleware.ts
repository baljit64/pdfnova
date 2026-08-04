import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/cd9583dc-1689-4bf8-bee5-b6a57f749367", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "pre-fix",
      hypothesisId: "H1",
      location: "src/middleware.ts:8",
      message: "Middleware request entry",
      data: {
        pathname: request.nextUrl.pathname,
        method: request.method,
        host: request.headers.get("host"),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/cd9583dc-1689-4bf8-bee5-b6a57f749367", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "src/middleware.ts:23",
      message: "Middleware passing through",
      data: { pathname: request.nextUrl.pathname },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
