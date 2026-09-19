import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
DOCUMENTS_DIR = STORAGE_DIR / "documents"

class Settings(BaseSettings):
    APP_NAME: str = "ContractLens"
    APP_VERSION: str = "1.0.0"
    TAGLINE: str = "From Contracts to Actions"
    ENV: str = os.getenv("ENV", "development")
    
    # Storage
    STORAGE_PATH: Path = STORAGE_DIR
    DOCUMENTS_PATH: Path = DOCUMENTS_DIR
    
    # Database
    # Support SQLite locally and PostgreSQL in production
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{STORAGE_DIR / 'contractlens.db'}"
    )
    
    # Multi-tenancy & Security
    DEFAULT_ORG_ID: str = "org_acme_corp"
    DEFAULT_ORG_NAME: str = "ACME Global Enterprise"
    DEFAULT_USER_ID: str = "usr_rahul_contract_mgr"
    DEFAULT_USER_NAME: str = "Rahul Sharma"
    DEFAULT_USER_ROLE: str = "Contract Manager"
    
    # AI & API keys
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure storage directories exist
os.makedirs(settings.STORAGE_PATH, exist_ok=True)
os.makedirs(settings.DOCUMENTS_PATH, exist_ok=True)
