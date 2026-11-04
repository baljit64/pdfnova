from io import BytesIO

from fastapi.testclient import TestClient
from pypdf import PdfWriter

from app.main import app

client = TestClient(app)


def make_pdf() -> bytes:
    writer = PdfWriter()
    writer.add_blank_page(width=300, height=300)
    output = BytesIO()
    writer.write(output)
    return output.getvalue()


def test_health_check() -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


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


def test_merge_requires_at_least_two_files() -> None:
    response = client.post(
        "/api/v1/pdf/merge",
        files=[("files", ("one.pdf", make_pdf(), "application/pdf"))],
    )
    assert response.status_code == 400
