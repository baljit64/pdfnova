export default async function NotFound() {
  // #region agent log
  await fetch("http://127.0.0.1:7242/ingest/cd9583dc-1689-4bf8-bee5-b6a57f749367", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      runId: "pre-fix",
      hypothesisId: "H2",
      location: "src/app/not-found.tsx:4",
      message: "NotFound server render",
      data: { route: "not-found" },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-bold text-blue-900 mb-2">Page not found</h1>
      <p className="text-gray-600">The page you requested does not exist.</p>
    </div>
  );
}
