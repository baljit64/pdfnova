const baseUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || "https://pdfnova-production.up.railway.app/api/v1";

/** Public FastAPI origin, without a trailing slash. */
export const PYTHON_API_URL = baseUrl.replace(/\/$/, "");

export function pythonApi(path: string): string {
  return `${PYTHON_API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
