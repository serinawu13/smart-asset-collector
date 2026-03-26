"""User request/response schemas"""
import re
from pydantic import BaseModel, Field, field_validator


class UserSignupRequest(BaseModel):
    """User signup request schema"""
    
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(...)
    password: str = Field(..., min_length=8)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        # Simple email validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        return v.lower()
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v


class UserLoginRequest(BaseModel):
    """User login request schema"""
    
    email: str = Field(...)
    password: str = Field(...)
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        return v.lower()


class UserResponse(BaseModel):
    """User response schema (without sensitive data)"""
    
    id: str
    name: str
    email: str
    currency: str = "USD"
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Authentication response with user and token"""
    
    user: UserResponse
    token: str


class MessageResponse(BaseModel):
    """Generic message response"""
    
    message: str
