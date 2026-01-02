"""
Application settings module.

Settings are managed via environment variables.
"""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # Server settings
    app_name: str = Field(default="AI Interview API", validation_alias="APP_NAME")
    app_version: str = Field(default="0.1.0", validation_alias="APP_VERSION")
    debug: bool = Field(default=False, validation_alias="DEBUG")

    # Server host/port
    host: str = Field(default="0.0.0.0", validation_alias="HOST")
    port: int = Field(default=8000, validation_alias="PORT")

    # CORS configuration
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://localhost:5173"],
        validation_alias="CORS_ORIGINS",
    )

    # API configuration
    api_prefix: str = Field(default="/api/v1", validation_alias="API_PREFIX")

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> object:
        """
        Allow both JSON array and comma-separated strings for CORS_ORIGINS.

        Examples:
        - '["http://localhost:3000","http://localhost:5173"]'
        - 'http://localhost:3000,http://localhost:5173'
        """
        if isinstance(value, str):
            raw = value.strip()
            if raw == "":
                return []
            if raw.startswith("["):
                return value
            return [item.strip() for item in raw.split(",") if item.strip()]
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached Settings instance loaded from .env and environment variables."""
    return Settings()


settings = get_settings()
