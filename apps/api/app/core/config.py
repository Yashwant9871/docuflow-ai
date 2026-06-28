from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
import json

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://docuflow:docuflow_password@localhost:5432/docuflow_ai"
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    UPLOAD_DIR: str = "./uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
