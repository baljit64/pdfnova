# PDFNova Python API

A FastAPI service for PDFNova's HTTP API. The Next.js application remains the
frontend; it calls this service for contact, conversion, PDF merge, and saved-file
archive operations. Browser-only PDF tools continue to run in the frontend.

## Included in this phase

- `GET /healthz` — Railway health check.
- `POST /api/v1/pdf/merge` — merge 2–10 PDF files.
- `POST /api/v1/contact` — submit the contact form.
- `POST /api/v1/convert/pdf-to-word` — editable DOCX from PDF, with optional OCR.
- `POST /api/v1/convert/word-to-pdf` — DOC/DOCX to PDF.
- `/api/v1/files*` — authenticated saved-file archive operations.
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

For local Word/PDF conversion, install LibreOffice. For the scanned-PDF OCR
option, also install Tesseract with the eng, hin, spa, fra, and deu language
data, plus Ghostscript and qpdf. On macOS these are available through Homebrew;
the Railway Docker image installs the Linux packages automatically.

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
| `CONTACT_FORM_ENDPOINT` | unset | HTTPS webhook used by the contact form. |
| `SUPABASE_URL` | unset | Supabase project URL used by the private file archive. |
| `SUPABASE_ANON_KEY` | unset | Public project key used to validate signed-in user access tokens. |
| `SUPABASE_SERVICE_ROLE_KEY` | unset | Secret key used by the API to store and retrieve archive files. Set only as a Railway secret. |

The browser calls the Railway API at `https://pdfnova-production.up.railway.app/api/v1`.
Set Railway's `CORS_ORIGINS` to `https://pdfnova.in,https://www.pdfnova.in,http://localhost:3000`.
Set `NEXT_PUBLIC_PYTHON_API_URL=https://pdfnova-production.up.railway.app/api/v1` in the frontend deployment.
No scheduled archive cleanup is configured; archived objects remain in storage until a cleanup schedule is added.

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

### Document conversion API

The frontend's active document conversion tools use local open-source software
inside the Python service. Word-to-PDF uses LibreOffice Writer. PDF-to-Word uses
pdf2docx; scanned PDFs can be OCR'd with OCRmyPDF and Tesseract in English,
Hindi, Spanish, French, or German. The Railway Docker image installs the required
LibreOffice, OCR, language data, and font packages. Each endpoint accepts a
multipart `file` field. PDF-to-Word also accepts `ocr=on` and `ocrLanguage`.

PDF-to-Word reconstructs an editable document from PDF layout, so complex
columns, forms, and graphics may differ from the source. pdf2docx uses PyMuPDF,
which is licensed under AGPLv3 (or a commercial license); deployments using it
must follow the AGPL terms. pdf2docx itself is MIT licensed and is no longer
actively maintained by its original maintainer. Railway still charges according
to the service plan and resources used; removing CloudConvert removes its
per-conversion API charge.

### Saved file archive API

The archive endpoints require `Authorization: Bearer <Supabase access token>`:

- `POST /api/v1/files` — save a completed result (`file` and `tool` multipart fields).
- `GET /api/v1/files` — list the signed-in user's unexpired saved results.
- `GET /api/v1/files/{id}` — download one of that user's unexpired results.

The API verifies each access token with Supabase Auth and scopes database and
Storage operations to that verified user. No cleanup job is configured, so
expired objects remain stored even though they are hidden and unavailable for
download.
