from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]
STORAGE_DIR = BASE_DIR / "storage"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "KALAINOVA"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str = "kalainova-dev-secret-key-change-in-production-32bytes"
    ENCRYPTION_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    DATABASE_URL: str = f"sqlite:///{(BASE_DIR / 'kalainova_dev.db').as_posix()}"

    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "kalainova-media"

    LLM_PROVIDER: str = "none"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    HF_TOKEN: str = ""
    HF_HOME: str = "E:/hf_cache"

    ENABLE_LOCAL_BIREFNET: bool = True
    ENABLE_LOCAL_SPEECH: bool = False
    ENABLE_LOCAL_TRANSLATION: bool = False
    ENABLE_LOCAL_EMBEDDINGS: bool = True

    CORS_ORIGINS: List[str] = ["*"]
    MAX_UPLOAD_SIZE_MB: int = 15


settings = Settings()

for sub in ("uploads", "processed", "invoices", "models"):
    (STORAGE_DIR / sub).mkdir(parents=True, exist_ok=True)
