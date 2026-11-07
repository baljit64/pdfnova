from __future__ import annotations

from datetime import datetime, timezone
from pathlib import PurePosixPath
from urllib.parse import quote
from uuid import UUID, uuid4

import httpx
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile, status
from fastapi.responses import Response

from app.core.config import get_settings

router = APIRouter(prefix="/files", tags=["files"])
BUCKET = "user-files"
MAX_FILE_BYTES = 50 * 1024 * 1024


def _config() -> tuple[str, str, str]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_anon_key or not settings.supabase_service_role_key:
        raise HTTPException(status_code=503, detail="The file archive is not configured.")
    return settings.supabase_url.rstrip("/"), settings.supabase_anon_key, settings.supabase_service_role_key


async def current_user_id(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Sign in to access saved files.")
    base_url, anon_key, _ = _config()
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(
                f"{base_url}/auth/v1/user",
                headers={"apikey": anon_key, "Authorization": authorization},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Could not verify your session.") from exc
    if not response.is_success:
        raise HTTPException(status_code=401, detail="Your session has expired. Sign in again.")
    try:
        return str(UUID(response.json()["id"]))
    except (KeyError, ValueError, TypeError) as exc:
        raise HTTPException(status_code=401, detail="Could not verify your session.") from exc


def _admin_headers(service_key: str, *, prefer: str | None = None) -> dict[str, str]:
    headers = {"apikey": service_key, "Authorization": f"Bearer {service_key}", "Content-Type": "application/json"}
    if prefer:
        headers["Prefer"] = prefer
    return headers


@router.get("")
async def list_saved_files(user_id: str = Depends(current_user_id)) -> list[dict]:
    base_url, _, service_key = _config()
    params = {
        "select": "id,tool,original_name,size_bytes,created_at,expires_at",
        "user_id": f"eq.{user_id}",
        "expires_at": f"gt.{datetime.now(timezone.utc).isoformat()}",
        "order": "created_at.desc",
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.get(f"{base_url}/rest/v1/user_files", params=params, headers=_admin_headers(service_key))
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="Could not load saved files.") from exc
    if not response.is_success:
        raise HTTPException(status_code=502, detail="Could not load saved files.")
    return response.json()


@router.post("", status_code=status.HTTP_201_CREATED)
async def archive_file(
    file: UploadFile = File(...),
    tool: str = Form(...),
    user_id: str = Depends(current_user_id),
) -> dict[str, str]:
    if not tool.strip() or len(tool) > 80 or any(c not in "abcdefghijklmnopqrstuvwxyz0123456789-" for c in tool.strip()):
        raise HTTPException(status_code=400, detail="A valid tool is required.")
    contents = await file.read(MAX_FILE_BYTES + 1)
    if not contents or len(contents) > MAX_FILE_BYTES:
        raise HTTPException(status_code=413, detail="Saved files must be between 1 byte and 50 MB.")
    filename = PurePosixPath((file.filename or "result").replace("\\", "/")).name
    safe_name = "".join(c if c.isalnum() or c in "._ -" else "_" for c in filename).strip()[:180] or "result"
    base_url, _, service_key = _config()
    object_path = f"{user_id}/{datetime.now(timezone.utc).date().isoformat()}/{uuid4()}-{safe_name}"
    encoded_path = quote(object_path, safe="/")
    content_type = file.content_type or "application/octet-stream"
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            uploaded = await client.post(
                f"{base_url}/storage/v1/object/{BUCKET}/{encoded_path}",
                content=contents,
                headers={"apikey": service_key, "Authorization": f"Bearer {service_key}", "Content-Type": content_type, "x-upsert": "false"},
            )
            if not uploaded.is_success:
                raise HTTPException(status_code=502, detail="We could not save this result.")
            inserted = await client.post(
                f"{base_url}/rest/v1/user_files",
                json={"user_id": user_id, "tool": tool.strip(), "original_name": safe_name, "storage_path": object_path, "content_type": content_type, "size_bytes": len(contents)},
                headers=_admin_headers(service_key, prefer="return=representation"),
            )
            if not inserted.is_success:
                await client.delete(f"{base_url}/storage/v1/object/{BUCKET}/{encoded_path}", headers=_admin_headers(service_key))
                raise HTTPException(status_code=502, detail="We could not save this result.")
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail="We could not save this result.") from exc
    record = inserted.json()[0]
    return {"id": record["id"], "expiresAt": record["expires_at"]}


@router.get("/{file_id}")
async def download_file(file_id: UUID, user_id: str = Depends(current_user_id)) -> Response:
    base_url, _, service_key = _config()
    params = {"select": "storage_path,original_name,content_type", "id": f"eq.{file_id}", "user_id": f"eq.{user_id}", "expires_at": f"gt.{datetime.now(timezone.utc).isoformat()}", "limit": "1"}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            record_response = await client.get(f"{base_url}/rest/v1/user_files", params=params, headers=_admin_headers(service_key))
            if not record_response.is_success:
                raise HTTPException(status_code=502, detail="File is temporarily unavailable.")
            records = record_response.json()
            if not records:
                raise HTTPException(status_code=404, detail="File not found or expired.")
            record = records[0]
            object_path = quote(record["storage_path"], safe="/")
            download = await client.get(f"{base_url}/storage/v1/object/{BUCKET}/{object_path}", headers={"apikey": service_key, "Authorization": f"Bearer {service_key}"})
            if not download.is_success:
                raise HTTPException(status_code=503, detail="File is temporarily unavailable.")
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="File is temporarily unavailable.") from exc
    filename = record["original_name"].replace('"', "_").replace("\r", "_").replace("\n", "_")
    return Response(content=download.content, media_type=record.get("content_type") or "application/octet-stream", headers={"Content-Disposition": f'attachment; filename="{filename}"', "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"})
