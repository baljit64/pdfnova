from __future__ import annotations

import re

import httpx
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field

from app.core.config import get_settings

router = APIRouter(tags=["contact"])
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=1, max_length=254)
    message: str = Field(min_length=1, max_length=5000)
    website: str = Field(default="", max_length=500)


@router.post("/contact")
async def send_contact_message(request: Request, payload: ContactRequest) -> dict[str, bool]:
    origin = request.headers.get("origin")
    if origin and origin not in get_settings().cors_origins:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid request origin.")
    if payload.website:
        return {"ok": True}
    if not EMAIL_PATTERN.fullmatch(payload.email.strip()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please check the contact form fields.")
    endpoint = get_settings().contact_form_endpoint
    if not endpoint or not endpoint.startswith("https://"):
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="The contact form is not configured yet. Please use the Help page for now.")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(endpoint, json={"name": payload.name.strip(), "email": payload.email.strip(), "message": payload.message.strip(), "source": "PDFNova contact form"}, headers={"Accept": "application/json"})
        if not response.is_success:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="We could not send your message. Please try again later.")
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="We could not send your message. Please try again later.") from exc
    return {"ok": True}
