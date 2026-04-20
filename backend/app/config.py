from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # API Settings
    APP_NAME: str = "Social Media Automation API"
    SECRET_KEY: str = "your-secret-key-here"  # Generate with: openssl rand -hex 32
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days
    
    # Encryption Key for tokens
    ENCRYPTION_KEY: str = "your-fernet-key-here" # Generate with: cryptography.fernet.Fernet.generate_key()
    
    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/social_media_db"
    
    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Filesystem / Media settings
    PUBLIC_API_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Meta (Facebook/Instagram)
    META_CLIENT_ID: str = ""
    META_CLIENT_SECRET: str = ""
    META_VERIFY_TOKEN: str = "social_media_verify_token"
    
    # LinkedIn
    LINKEDIN_CLIENT_ID: str = ""
    LINKEDIN_CLIENT_SECRET: str = ""
    
    # Google (YouTube)
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    
    # Email (Resend)
    RESEND_API_KEY: str = ""
    SMTP_FROM: str = "noreply@youragency.com"


    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
