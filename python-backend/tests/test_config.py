from __future__ import annotations

from pydantic import ValidationError

from app.core.config import Settings


def test_railway_environment_values_parse_cors_origins(monkeypatch) -> None:
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("CORS_ORIGINS", "https://pdfnova.in,https://www.pdfnova.in")
    monkeypatch.setenv("MAX_UPLOAD_BYTES", "20971520")
    monkeypatch.setenv("MAX_MERGE_FILES", "10")
    monkeypatch.setenv("MAX_MERGE_PAGES", "500")

    settings = Settings(_env_file=None)

    assert settings.environment == "production"
    assert settings.cors_origins == ["https://pdfnova.in", "https://www.pdfnova.in"]
    assert settings.max_upload_bytes == 20 * 1024 * 1024
    assert settings.max_merge_files == 10
    assert settings.max_merge_pages == 500


def test_cors_origins_trim_whitespace_and_ignore_empty_items(monkeypatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", " https://pdfnova.in, , https://www.pdfnova.in ,, ")
    assert Settings(_env_file=None).cors_origins == [
        "https://pdfnova.in",
        "https://www.pdfnova.in",
    ]


def test_empty_or_malformed_cors_values_are_safe(monkeypatch) -> None:
    for value in ("", "   ", ",,,"):
        monkeypatch.setenv("CORS_ORIGINS", value)
        assert Settings(_env_file=None).cors_origins == []

    monkeypatch.setenv("CORS_ORIGINS", "https://one.example,not-a-url")
    assert Settings(_env_file=None).cors_origins == ["https://one.example", "not-a-url"]


def test_defaults_are_used_when_environment_values_are_absent(monkeypatch) -> None:
    for name in (
        "ENVIRONMENT",
        "CORS_ORIGINS",
        "MAX_UPLOAD_BYTES",
        "MAX_MERGE_FILES",
        "MAX_MERGE_PAGES",
    ):
        monkeypatch.delenv(name, raising=False)
    settings = Settings(_env_file=None)
    assert settings.environment == "development"
    assert settings.cors_origins == [
        "http://localhost:3000",
        "https://www.pdfnova.in",
        "https://pdfnova.in",
    ]


def test_invalid_numeric_configuration_has_clear_validation_error(monkeypatch) -> None:
    monkeypatch.setenv("MAX_UPLOAD_BYTES", "twenty-megabytes")
    try:
        Settings(_env_file=None)
    except ValidationError as exc:
        assert "max_upload_bytes" in str(exc)
    else:
        raise AssertionError("Invalid numeric configuration should fail validation")
