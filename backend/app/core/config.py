
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================================
    # Project
    # ==========================================
    PROJECT_NAME: str = "Mac & Quantum"
    PROJECT_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # ==========================================
    # Database
    # ==========================================
    DATABASE_URL: str

    # ==========================================
    # JWT
    # ==========================================
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ==========================================
    # OpenAI
    # ==========================================
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-5-mini"

    # ==========================================
    # NVIDIA / DeepSeek
    # ==========================================
    NVIDIA_API_KEY: str | None = None
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "deepseek-ai/deepseek-v4-flash-0731"

    # ==========================================
    # Groq
    # ==========================================
    GROQ_API_KEY: str | None = None
    GROQ_BASE_URL: str = "https://api.groq.com/openai/v1"
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    # ==========================================
    # AI Provider
    # ==========================================
    AI_PROVIDER: str = "groq"

    # ==========================================
    # Frontend / CORS
    # ==========================================
    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:5174,"
        "http://127.0.0.1:5174"
    )

    # ==========================================
    # Pydantic Settings Configuration
    # ==========================================
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # ==========================================
    # CORS Helper
    # ==========================================
    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]


# ==============================================
# Settings Instance
# ==============================================

@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
