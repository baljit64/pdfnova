import RouteLogger from "../components/RouteLogger";
import Home from "../pages/Home/index";
import { buildMetadata } from "../seo/nextMetadata";

export const metadata = buildMetadata("/");

export default async function Page() {
  // #region agent log
  await fetch("http://127.0.0.1:7242/ingest/cd9583dc-1689-4bf8-bee5-b6a57f749367", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "pre-fix",
      hypothesisId: "H4",
      location: "src/app/page.tsx:8",
      message: "App home page server render",
      data: { route: "/" },
      timestamp: Date.now(),
    }),
  }).catch(() => { });
  // #endregion agent log
  return (
    <>
      <RouteLogger routeId="home" />
      <Home />
    </>
  );
}
