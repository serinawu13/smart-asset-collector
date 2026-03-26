"""Application configuration using Pydantic Settings"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    app_env: str = "development"
    port: int = 8000
    mongodb_uri: str = ""
    database_url: str = ""
    jwt_secret: str = ""
    secret_key: str = ""
    jwt_expires_in: int = 86400  # 24 hours in seconds
    access_token_expire_minutes: int = 30
    algorithm: str = "HS256"
    cors_origins: str = "http://localhost:3000"
    
    @property
    def mongodb_connection_string(self) -> str:
        """Get MongoDB connection string from either mongodb_uri or database_url"""
        return self.mongodb_uri or self.database_url
    
    @property
    def jwt_secret_key(self) -> str:
        """Get JWT secret from either jwt_secret or secret_key"""
        return self.jwt_secret or self.secret_key
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    @property
    def cors_origins_list(self):
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.cors_origins.split(",")]


# Global settings instance
settings = Settings()
