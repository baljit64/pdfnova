from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import contact, conversions, files, health, pdf
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="PDF processing API for PDFNova.",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(health.router)
app.include_router(pdf.router, prefix="/api/v1")
app.include_router(contact.router, prefix="/api/v1")
app.include_router(conversions.router, prefix="/api/v1")
app.include_router(files.router, prefix="/api/v1")
