from __future__ import annotations

from io import BytesIO
from tempfile import SpooledTemporaryFile
from typing import BinaryIO

from fastapi import APIRouter, File, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from pypdf import PdfReader, PdfWriter
from pypdf.errors import PdfReadError

from app.core.config import get_settings

router = APIRouter(prefix="/pdf", tags=["pdf"])
CHUNK_SIZE = 1024 * 1024
PDF_SIGNATURE = b"%PDF-"


def _copy_upload(upload: UploadFile, destination: BinaryIO, remaining: int) -> int:
    total = 0
    while chunk := upload.file.read(CHUNK_SIZE):
        total += len(chunk)
        if total > remaining:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="The combined upload exceeds the configured size limit.",
            )
        destination.write(chunk)
    destination.seek(0)
    return total


@router.post("/merge", response_class=StreamingResponse)
def merge_pdfs(files: list[UploadFile] = File(...)) -> StreamingResponse:
    """Merge a bounded set of PDF files and return the combined PDF."""
    settings = get_settings()

    if not 2 <= len(files) <= settings.max_merge_files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Upload between 2 and {settings.max_merge_files} PDF files.",
        )

    writer = PdfWriter()
    source_files: list[SpooledTemporaryFile] = []
    total_bytes = 0
    total_pages = 0

    try:
        for upload in files:
            # Keep each source open until writer.write() finishes: pypdf may
            # need to seek back into source streams while cloning page objects.
            source = SpooledTemporaryFile(max_size=1024 * 1024, mode="w+b")
            source_files.append(source)
            remaining = settings.max_upload_bytes - total_bytes
            total_bytes += _copy_upload(upload, source, remaining)

            if source.read(len(PDF_SIGNATURE)) != PDF_SIGNATURE:
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail=f"{upload.filename or 'A file'} is not a valid PDF upload.",
                )
            source.seek(0)

            try:
                reader = PdfReader(source, strict=True)
                if reader.is_encrypted:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="Password-protected PDFs are not supported yet.",
                    )
                if not reader.pages:
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail="A PDF contains no pages.",
                    )
                total_pages += len(reader.pages)
                if total_pages > settings.max_merge_pages:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="The combined PDF exceeds the page limit.",
                    )
                writer.append(reader)
            except (PdfReadError, ValueError, OSError) as exc:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Could not read {upload.filename or 'an uploaded PDF'}.",
                ) from exc

        output = BytesIO()
        writer.write(output)
        output.seek(0)

        return StreamingResponse(
            output,
            media_type="application/pdf",
            headers={"Content-Disposition": 'attachment; filename="pdfnova-merged.pdf"'},
        )
    finally:
        writer.close()
        for source in source_files:
            source.close()
        for upload in files:
            upload.file.close()
