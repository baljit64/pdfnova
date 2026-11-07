from __future__ import annotations

import asyncio
import shutil
import subprocess
import tempfile
from pathlib import Path

import ocrmypdf
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response
from pdf2docx import Converter
from pypdf import PdfReader
from pypdf.errors import PdfReadError

router = APIRouter(prefix="/convert", tags=["conversions"])
OCR_LANGUAGES = {"eng", "hin", "spa", "fra", "deu"}
MAX_FILE_BYTES = 40 * 1024 * 1024
MAX_PDF_PAGES = 100
PDF_TO_WORD_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
conversion_slot = asyncio.Semaphore(1)


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


def _convert_pdf_to_docx(source: bytes, *, run_ocr: bool, ocr_language: str) -> bytes:
    with tempfile.TemporaryDirectory(prefix="pdfnova-pdf-to-word-") as temp_dir:
        work_dir = Path(temp_dir)
        input_path = work_dir / "input.pdf"
        conversion_path = input_path
        output_path = work_dir / "output.docx"
        input_path.write_bytes(source)

        try:
            reader = PdfReader(input_path, strict=True)
            if reader.is_encrypted:
                raise HTTPException(status_code=422, detail="Password-protected PDFs are not supported.")
            if not reader.pages:
                raise HTTPException(status_code=422, detail="The PDF contains no pages.")
            if len(reader.pages) > MAX_PDF_PAGES:
                raise HTTPException(status_code=413, detail=f"PDFs are limited to {MAX_PDF_PAGES} pages per conversion.")
        except HTTPException:
            raise
        except (PdfReadError, ValueError, OSError) as exc:
            raise HTTPException(status_code=422, detail="Could not read this PDF.") from exc

        if run_ocr:
            conversion_path = work_dir / "searchable.pdf"
            try:
                ocrmypdf.ocr(
                    input_path,
                    conversion_path,
                    language=ocr_language if ocr_language in OCR_LANGUAGES else "eng",
                    skip_text=True,
                    progress_bar=False,
                    output_type="pdf",
                )
            except ocrmypdf.exceptions.PriorOcrFoundError:
                conversion_path = input_path
            except Exception as exc:
                raise HTTPException(status_code=422, detail="OCR could not read this PDF. Try another file or turn OCR off.") from exc

        converter: Converter | None = None
        try:
            converter = Converter(str(conversion_path))
            converter.convert(str(output_path), multi_processing=False)
            return output_path.read_bytes()
        except HTTPException:
            raise
        except Exception as exc:
            raise HTTPException(status_code=422, detail="Could not convert this PDF to Word.") from exc
        finally:
            if converter is not None:
                converter.close()


def _convert_word_to_pdf(source: bytes, filename: str) -> bytes:
    office = shutil.which("libreoffice") or shutil.which("soffice")
    if not office:
        raise HTTPException(status_code=503, detail="The document converter is not installed.")

    with tempfile.TemporaryDirectory(prefix="pdfnova-word-to-pdf-") as temp_dir:
        work_dir = Path(temp_dir)
        input_path = work_dir / _safe_filename(filename, Path(filename).suffix.lower())
        output_path = work_dir / f"{input_path.stem}.pdf"
        profile_path = work_dir / "lo-profile"
        input_path.write_bytes(source)
        command = [
            office,
            "--headless",
            "--nologo",
            "--nodefault",
            "--nolockcheck",
            f"-env:UserInstallation={profile_path.as_uri()}",
            "--convert-to",
            "pdf:writer_pdf_Export",
            "--outdir",
            str(work_dir),
            str(input_path),
        ]
        try:
            completed = subprocess.run(command, capture_output=True, check=False, timeout=60)
        except subprocess.TimeoutExpired as exc:
            raise HTTPException(status_code=504, detail="Document conversion timed out. Try a smaller file.") from exc
        if completed.returncode != 0 or not output_path.is_file():
            raise HTTPException(status_code=422, detail="Could not convert this Word document to PDF.")
        return output_path.read_bytes()


@router.post("/pdf-to-word")
async def pdf_to_word(
    file: UploadFile = File(...),
    ocr: str = Form("off"),
    ocrLanguage: str = Form("eng"),
) -> Response:
    source = await _read_upload(file, allowed_extensions={".pdf"})
    async with conversion_slot:
        output = await asyncio.to_thread(_convert_pdf_to_docx, source, run_ocr=ocr == "on", ocr_language=ocrLanguage)
    return Response(
        content=output,
        media_type=PDF_TO_WORD_MEDIA_TYPE,
        headers={"Content-Disposition": f'attachment; filename="{_safe_filename(file.filename or "document.pdf", ".docx")}"'},
    )


@router.post("/word-to-pdf")
async def word_to_pdf(file: UploadFile = File(...)) -> Response:
    source = await _read_upload(file, allowed_extensions={".doc", ".docx"})
    async with conversion_slot:
        output = await asyncio.to_thread(_convert_word_to_pdf, source, file.filename or "document.docx")
    return Response(
        content=output,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{_safe_filename(file.filename or "document.docx", ".pdf")}"'},
    )
