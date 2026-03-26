"""Authentication utilities for password hashing and JWT tokens"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.hash import argon2
from jose import JWTError, jwt
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings

# Security scheme for JWT bearer token
security = HTTPBearer()


def hash_password(password: str) -> str:
    """
    Hash a password using Argon2
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return argon2.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Hashed password to compare against
        
    Returns:
        True if password matches, False otherwise
    """
    try:
        return argon2.verify(plain_password, hashed_password)
    except Exception:
        return False


def create_access_token(user_id: str) -> str:
    """
    Create a JWT access token
    
    Args:
        user_id: User ID to encode in token
        
    Returns:
        JWT token string
    """
    expires_delta = timedelta(seconds=settings.jwt_expires_in)
    expire = datetime.now(timezone.utc) + expires_delta
    
    to_encode = {
        "sub": user_id,
        "exp": expire
    }
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm="HS256"
    )
    
    return encoded_jwt


def decode_access_token(token: str) -> dict:
    """
    Decode and validate a JWT access token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Dependency to get current user ID from JWT token
    
    Args:
        credentials: HTTP authorization credentials with bearer token
        
    Returns:
        User ID from token
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id: Optional[str] = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_id


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to get current user object from JWT token
    
    Args:
        credentials: HTTP authorization credentials with bearer token
        
    Returns:
        Dictionary with user id, name, email, currency
        
    Raises:
        HTTPException: If token is invalid or missing
    """
    from app.database import get_database
    from bson import ObjectId
    
    token = credentials.credentials
    payload = decode_access_token(token)
    user_id: Optional[str] = payload.get("sub")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Fetch user from database
    db = get_database()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID"
        )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "currency": user.get("currency", "USD")
    }
