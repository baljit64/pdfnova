# PDFNova Python API

A FastAPI service that is developed alongside the existing Next.js application.
This is the first step of a gradual migration; existing Next.js PDF tools remain
the production implementation until each Python replacement is integrated and verified.

## Included in this phase

- `GET /healthz` — Railway health check.
- `POST /api/v1/pdf/merge` — merge 2–10 PDF files.
- Bounded uploads (20 MiB combined by default), 500-page combined limit.
- Spooled temporary files to reduce memory pressure.
- CORS allowlist configured through environment variables.

## Run locally

From this directory:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000/docs for the API explorer.

## Run tests

```bash
python -m pytest -q
```

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `ENVIRONMENT` | `development` | Set to `production` to disable `/docs`. |
| `CORS_ORIGINS` | localhost and PDFNova production origins | Comma-separated origin allowlist. Whitespace and empty entries are ignored. |
| `MAX_UPLOAD_BYTES` | `20971520` | Maximum combined upload size in bytes. |
| `MAX_MERGE_FILES` | `10` | Maximum number of files per merge. |
| `MAX_MERGE_PAGES` | `500` | Maximum combined page count. |

The CORS value is a comma-separated string, not a JSON array. For example:
`CORS_ORIGINS=https://pdfnova.in,https://www.pdfnova.in`. Pydantic Settings
normally JSON-decodes environment values for list fields before field validators
run; this service disables that decoding for this field and then splits it.

## Docker

From the repository root:

```bash
docker build -t pdfnova-python-api ./python-backend
docker run --rm -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e CORS_ORIGINS="https://pdfnova.in,https://www.pdfnova.in" \
  -e MAX_UPLOAD_BYTES=20971520 \
  -e MAX_MERGE_FILES=10 \
  -e MAX_MERGE_PAGES=500 \
  pdfnova-python-api
curl -i http://localhost:8000/healthz
```

The container listens on Railway's injected `PORT`, falling back to `8000` for
local use.

## Railway deployment

Create a Railway service from this GitHub repository and verify these settings:

- Branch: `v2`
- Root Directory: `/python-backend`
- Builder: Dockerfile
- Dockerfile path: `Dockerfile` relative to the service root directory
- Config file: `python-backend/railway.json` relative to the repository root (if Railway asks for a config path)
- Health check path: `/healthz`
- Start command: leave unset so the Dockerfile starts `uvicorn app.main:app`
- Do not configure a Next.js build command or frontend environment variables for this service

Railway will build the Dockerfile and use the injected `PORT`. The health check
uses `/healthz`.

Set `ENVIRONMENT=production` and set `CORS_ORIGINS` to the exact frontend
origins. Do not add Supabase service-role keys or storage secrets until those
integrations are implemented.

If startup reports a `SettingsError` parsing `cors_origins`, confirm the service
uses the updated `pydantic-settings` dependency (`>=2.7`) and that `CORS_ORIGINS`
is a comma-separated value as shown above. Avoid wrapping the value in JSON array
syntax unless the settings parser is changed to support that format.

## API

### Merge PDFs

Send a multipart form request with repeated `files` fields:

```bash
curl -X POST http://localhost:8000/api/v1/pdf/merge \
  -F "files=@first.pdf" \
  -F "files=@second.pdf" \
  --output merged.pdf
```

Current limits are intentionally conservative for Railway's small free
instance. Encrypted PDFs are not supported in this first version.
