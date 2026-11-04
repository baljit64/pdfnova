from io import BytesIO
import importlib

from fastapi.testclient import TestClient
from pypdf import PdfReader, PdfWriter

from app.main import app
from app.core.config import Settings
from app.api.routes import pdf as pdf_route

client = TestClient(app)


def make_pdf(pages: int = 1, password: str | None = None) -> bytes:
    writer = PdfWriter()
    for _ in range(pages):
        writer.add_blank_page(width=300, height=300)
    if password:
        writer.encrypt(password)
    output = BytesIO()
    writer.write(output)
    return output.getvalue()


def make_empty_pdf() -> bytes:
    output = BytesIO()
    writer = PdfWriter()
    writer.write(output)
    writer.close()
    return output.getvalue()


def test_health_check() -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_api_documentation_routes() -> None:
    assert app.docs_url == "/docs"
    assert app.redoc_url == "/redoc"
    assert app.openapi_url == "/openapi.json"
    assert client.get("/docs").status_code == 200
    assert client.get("/redoc").status_code == 200
    assert client.get("/openapi.json").status_code == 200


def test_merge_two_pdfs() -> None:
    pdf = make_pdf()
    response = client.post(
        "/api/v1/pdf/merge",
        files=[
            ("files", ("one.pdf", pdf, "application/pdf")),
            ("files", ("two.pdf", pdf, "application/pdf")),
        ],
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF-")
    assert len(PdfReader(BytesIO(response.content)).pages) == 2


def test_merge_multiple_pdfs() -> None:
    pdf = make_pdf()
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", (f"{i}.pdf", pdf, "application/pdf")) for i in range(4)],
    )
    assert response.status_code == 200
    assert len(PdfReader(BytesIO(response.content)).pages) == 4


def test_merge_requires_at_least_two_files() -> None:
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", ("one.pdf", make_pdf(), "application/pdf"))],
    )
    assert response.status_code == 400


def test_merge_rejects_too_many_files() -> None:
    pdf = make_pdf()
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", (f"{i}.pdf", pdf, "application/pdf")) for i in range(11)],
    )
    assert response.status_code == 400


def test_merge_rejects_invalid_content() -> None:
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", ("one.pdf", b"not a pdf", "application/pdf")),
               ("files", ("two.pdf", make_pdf(), "application/pdf"))],
    )
    assert response.status_code == 415


def test_merge_rejects_encrypted_pdf() -> None:
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", ("locked.pdf", make_pdf(password="secret"), "application/pdf")),
               ("files", ("plain.pdf", make_pdf(), "application/pdf"))],
    )
    assert response.status_code == 422


def test_merge_rejects_zero_page_pdf() -> None:
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", ("empty.pdf", make_empty_pdf(), "application/pdf")),
               ("files", ("plain.pdf", make_pdf(), "application/pdf"))],
    )
    assert response.status_code == 422


def test_merge_enforces_combined_upload_size(monkeypatch) -> None:
    monkeypatch.setattr(pdf_route, "get_settings", lambda: Settings(max_upload_bytes=100))
    pdf = make_pdf()
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", ("one.pdf", pdf, "application/pdf")),
               ("files", ("two.pdf", pdf, "application/pdf"))],
    )
    assert response.status_code == 413


def test_merge_enforces_combined_page_limit(monkeypatch) -> None:
    monkeypatch.setattr(pdf_route, "get_settings", lambda: Settings(max_merge_pages=1))
    pdf = make_pdf()
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", ("one.pdf", pdf, "application/pdf")),
               ("files", ("two.pdf", pdf, "application/pdf"))],
    )
    assert response.status_code == 413


def test_merge_closes_temporary_source_files(monkeypatch) -> None:
    created = []
    real_spooled_file = pdf_route.SpooledTemporaryFile

    def tracking_spooled_file(*args, **kwargs):
        source = real_spooled_file(*args, **kwargs)
        created.append(source)
        return source

    monkeypatch.setattr(pdf_route, "SpooledTemporaryFile", tracking_spooled_file)
    pdf = make_pdf()
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", ("one.pdf", pdf, "application/pdf")),
               ("files", ("two.pdf", pdf, "application/pdf"))],
    )
    assert response.status_code == 200
    assert len(created) == 2
    assert all(source.closed for source in created)


def test_health_response_exact_payload() -> None:
    assert client.get("/healthz").json() == {
        "status": "ok",
        "service": "pdfnova-python-api",
    }


def test_production_keeps_docs_and_cors_uses_configured_origins(monkeypatch) -> None:
    from app.core.config import get_settings

    get_settings.cache_clear()
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("CORS_ORIGINS", "https://pdfnova.in,https://www.pdfnova.in")
    try:
        import app.main as main_module
        configured_app = importlib.reload(main_module).app
        assert configured_app.docs_url == "/docs"
        assert configured_app.redoc_url == "/redoc"
        configured_client = TestClient(configured_app)
        assert configured_client.get("/docs").status_code == 200
        assert configured_client.get("/redoc").status_code == 200
        assert configured_client.get("/openapi.json").status_code == 200
        allowed = configured_client.options(
            "/healthz",
            headers={"Origin": "https://pdfnova.in", "Access-Control-Request-Method": "GET"},
        )
        blocked = configured_client.options(
            "/healthz",
            headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"},
        )
        assert allowed.headers.get("access-control-allow-origin") == "https://pdfnova.in"
        assert "access-control-allow-origin" not in blocked.headers
    finally:
        get_settings.cache_clear()
