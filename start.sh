#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_DIR="$ROOT_DIR/python-backend"
VENV_DIR="$PYTHON_DIR/.venv"

if [[ ! -f "$ROOT_DIR/.env" ]]; then
  echo "Missing root .env. Copy .env.example to .env and add your Supabase frontend settings first." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js 24 and npm are required. Select the project version with: nvm use" >&2
  exit 1
fi
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [[ "$NODE_MAJOR" != "24" ]]; then
  echo "This project requires Node.js 24; found $(node --version). Select it with: nvm use" >&2
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is required to run the FastAPI backend." >&2
  exit 1
fi

if [[ ! -d "$ROOT_DIR/node_modules" ]]; then
  echo "Installing frontend dependencies..."
  (cd "$ROOT_DIR" && npm install)
fi

if [[ ! -x "$VENV_DIR/bin/uvicorn" ]]; then
  echo "Creating the Python environment..."
  python3 -m venv "$VENV_DIR"
fi
"$VENV_DIR/bin/python" -m pip install -r "$PYTHON_DIR/requirements.txt"

if ! command -v libreoffice >/dev/null 2>&1 && ! command -v soffice >/dev/null 2>&1; then
  echo "LibreOffice is not installed; Word-to-PDF conversion will be unavailable locally." >&2
fi
if ! command -v tesseract >/dev/null 2>&1 || ! command -v gs >/dev/null 2>&1; then
  echo "Tesseract and Ghostscript are required for scanned PDF OCR. Install them to use the OCR option." >&2
fi

cleanup() {
  trap - INT TERM EXIT
  kill "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" "$BACKEND_PID" 2>/dev/null || true
}

(
  # Load the root .env only into the backend process. Never pass the service-role
  # key to the frontend's Node process.
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a

  export SUPABASE_URL="${SUPABASE_URL:-${NEXT_PUBLIC_SUPABASE_URL:-}}"
  export SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:-${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}}}"
  export CORS_ORIGINS="${CORS_ORIGINS:-http://localhost:3000,https://pdfnova.in,https://www.pdfnova.in}"

  cd "$PYTHON_DIR"
  exec "$VENV_DIR/bin/uvicorn" app.main:app --reload --port 8000
) &
BACKEND_PID=$!

(
  cd "$ROOT_DIR"
  NEXT_PUBLIC_PYTHON_API_URL=http://localhost:8000/api/v1 npm run dev
) &
FRONTEND_PID=$!

trap cleanup INT TERM EXIT
echo "Frontend: http://localhost:3000"
echo "Python API: http://localhost:8000/docs"
echo "Press Ctrl+C to stop both services."

while kill -0 "$FRONTEND_PID" 2>/dev/null && kill -0 "$BACKEND_PID" 2>/dev/null; do
  sleep 1
done

cleanup
