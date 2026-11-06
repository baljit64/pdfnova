from __future__ import annotations

import asyncio
import base64
from pathlib import Path
from typing import Any

import httpx
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response

from app.core.config import get_settings

router = APIRouter(prefix="/convert", tags=["conversions"])
CLOUDCONVERT_API = "https://api.cloudconvert.com/v2"
OCR_LANGUAGES = {"eng", "hin", "spa", "fra", "deu"}
MAX_FILE_BYTES = 40 * 1024 * 1024


def _safe_filename(filename: str, suffix: str) -> str:
    stem = Path(filename or "converted-document").stem or "converted-document"
    safe_stem = "".join(char if char.isalnum() or char in "._ -" else "_" for char in stem)
    return f"{safe_stem[:120]}{suffix}"


async def _read_upload(file: UploadFile, *, allowed_extensions: set[str]) -> bytes:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Choose a supported file type.")
    contents = await file.read(MAX_FILE_BYTES + 1)
    if not contents:
        raise HTTPException(status_code=400, detail="Choose a non-empty file.")
    if len(contents) > MAX_FILE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="The uploaded file is too large.")
    return contents


async def _cloudconvert_file(*, source: bytes, filename: str, input_format: str, output_format: str, intermediate_task: dict[str, Any] | None = None) -> bytes:
    api_key = get_settings().cloudconvert_api_key
    if not api_key:
        raise HTTPException(status_code=503, detail="The conversion service is not configured.")
    tasks: dict[str, dict[str, Any]] = {"import-1": {"operation": "import/base64", "file": base64.b64encode(source).decode("ascii"), "filename": filename}}
    conversion_input = "import-1"
    if intermediate_task:
        conversion_input = "intermediate-1"
        tasks[conversion_input] = {**intermediate_task, "input": "import-1"}
    tasks["convert-1"] = {"operation": "convert", "input": conversion_input, "input_format": input_format, "output_format": output_format}
    tasks["export-1"] = {"operation": "export/url", "input": "convert-1", "inline": False}
    headers = {"Authorization": f"Bearer {api_key}"}
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(30.0, read=30.0)) as client:
            created = await client.post(f"{CLOUDCONVERT_API}/jobs", headers=headers, json={"tasks": tasks})
            if not created.is_success:
                raise HTTPException(status_code=502, detail="The conversion service did not accept the job.")
            job_id = created.json().get("data", {}).get("id")
            if not job_id:
                raise HTTPException(status_code=502, detail="The conversion service returned an invalid job.")
            completed: dict[str, Any] | None = None
            for _ in range(60):
                job = await client.get(f"{CLOUDCONVERT_API}/jobs/{job_id}", headers=headers)
                if not job.is_success:
                    raise HTTPException(status_code=502, detail="Failed to check conversion status.")
                completed = job.json().get("data")
                if completed and completed.get("status") == "finished":
                    break
                if completed and completed.get("status") == "error":
                    raise HTTPException(status_code=502, detail="Conversion failed. Please check the file and try again.")
                await asyncio.sleep(2)
            else:
                raise HTTPException(status_code=504, detail="Conversion timed out. Try again.")
            export = next((task for task in completed.get("tasks", []) if task.get("name") == "export-1"), None)
            output_url = export and (export.get("result", {}).get("files") or [{}])[0].get("url")
            if not output_url:
                raise HTTPException(status_code=502, detail="The conversion service returned no output file.")
            output = await client.get(output_url)
            if not output.is_success:
                raise HTTPException(status_code=502, detail="The converted file could not be downloaded.")
            return output.content
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="The conversion service is unavailable.") from exc


async def _convert(file: UploadFile, *, allowed_extensions: set[str], output_format: str, media_type: str, intermediate_task: dict[str, Any] | None = None) -> Response:
    source = await _read_upload(file, allowed_extensions=allowed_extensions)
    input_format = Path(file.filename or "").suffix.lower().lstrip(".")
    output = await _cloudconvert_file(source=source, filename=file.filename or f"document.{input_format}", input_format=input_format, output_format=output_format, intermediate_task=intermediate_task)
    return Response(content=output, media_type=media_type, headers={"Content-Disposition": f'attachment; filename="{_safe_filename(file.filename or "document", f".{output_format}")}"'})


@router.post("/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...), ocr: str = Form("off"), ocrLanguage: str = Form("eng")) -> Response:
    intermediate = {"operation": "pdf/ocr", "language": [ocrLanguage if ocrLanguage in OCR_LANGUAGES else "eng"]} if ocr == "on" else None
    return await _convert(file, allowed_extensions={".pdf"}, output_format="docx", media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", intermediate_task=intermediate)


@router.post("/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)) -> Response:
    return await _convert(file, allowed_extensions={".doc", ".docx"}, output_format="pdf", media_type="application/pdf")


@router.post("/pdf-to-excel")
async def pdf_to_excel(file: UploadFile = File(...)) -> Response:
    return await _convert(file, allowed_extensions={".pdf"}, output_format="xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@router.post("/pdf-to-powerpoint")
async def pdf_to_powerpoint(file: UploadFile = File(...)) -> Response:
    return await _convert(file, allowed_extensions={".pdf"}, output_format="pptx", media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation")


@router.post("/powerpoint-to-pdf")
async def powerpoint_to_pdf(file: UploadFile = File(...)) -> Response:
    return await _convert(file, allowed_extensions={".ppt", ".pptx"}, output_format="pdf", media_type="application/pdf")
