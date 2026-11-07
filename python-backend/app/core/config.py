from functools import lru_cache
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PDFNova Python API"
    environment: str = "development"
    cors_origins: Annotated[list[str], NoDecode] = [
        "http://localhost:3000",
        "https://www.pdfnova.in",
        "https://pdfnova.in",
    ]
    max_upload_bytes: int = 20 * 1024 * 1024
    max_merge_files: int = 10
    max_merge_pages: int = 500
    cloudconvert_api_key: str | None = None
    contact_form_endpoint: str | None = None
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
