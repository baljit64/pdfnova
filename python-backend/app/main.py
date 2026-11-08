from fastapi import FastAPI, Request
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


@app.middleware("http")
async def prevent_api_indexing(request: Request, call_next):
    response = await call_next(request)
    # Applies to binary downloads as well as JSON and error responses.
    # Authorization remains responsible for protecting private documents.
    response.headers["X-Robots-Tag"] = "noindex, nofollow"
    return response
