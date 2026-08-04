 "use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RouteLogger({ routeId }: { routeId: string }) {
  const pathname = usePathname() || "/";

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7242/ingest/cd9583dc-1689-4bf8-bee5-b6a57f749367", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        runId: "pre-fix",
        hypothesisId: "H3",
        location: "src/components/RouteLogger.tsx:12",
        message: "RouteLogger mounted",
        data: { pathname, routeId },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion agent log
  }, [pathname, routeId]);

  return null;
}
