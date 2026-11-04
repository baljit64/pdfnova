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
pytest -q
```

## Railway deployment

Create a Railway service from this GitHub repository and configure:

- Branch: `v2`
- Root Directory: `/python-backend`
- Config file: `/python-backend/railway.json` (if Railway asks for a config path)

Railway will build the Dockerfile and use the injected `PORT`. The health check
uses `/healthz`.

Set `ENVIRONMENT=production` and set `CORS_ORIGINS` to the exact frontend
origins. Do not add Supabase service-role keys or storage secrets until those
integrations are implemented.

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
