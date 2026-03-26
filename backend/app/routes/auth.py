"""Authentication routes"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from app.database import get_database
from app.schemas.user import (
    UserSignupRequest,
    UserLoginRequest,
    UserResponse,
    AuthResponse,
    MessageResponse
)
from app.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user_id
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserSignupRequest):
    """
    Create a new user account
    
    - Validates email uniqueness
    - Hashes password with Argon2
    - Creates user in database
    - Returns user info and JWT token
    """
    db = get_database()
    users_collection = db.users
    
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Create user document
    user_doc = {
        "name": user_data.name,
        "email": user_data.email,
        "password_hash": password_hash,
        "currency": "USD",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert user into database
    result = await users_collection.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    # Generate JWT token
    token = create_access_token(user_id)
    
    # Return user response
    user_response = UserResponse(
        id=user_id,
        name=user_data.name,
        email=user_data.email,
        currency="USD"
    )
    
    return AuthResponse(user=user_response, token=token)


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLoginRequest):
    """
    Authenticate existing user
    
    - Validates email and password
    - Returns user info and JWT token
    """
    db = get_database()
    users_collection = db.users
    
    # Find user by email
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate JWT token
    user_id = str(user["_id"])
    token = create_access_token(user_id)
    
    # Return user response
    user_response = UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        currency=user.get("currency", "USD")
    )
    
    return AuthResponse(user=user_response, token=token)


@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Logout user (client-side token removal)
    
    - Token invalidation is handled client-side
    - This endpoint confirms logout action
    """
    return MessageResponse(message="Logged out successfully")


@router.get("/me", response_model=UserResponse)
async def get_current_user(user_id: str = Depends(get_current_user_id)):
    """
    Get current authenticated user information
    
    - Requires valid JWT token
    - Returns user profile data
    """
    db = get_database()
    users_collection = db.users
    
    # Find user by ID
    try:
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
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
    
    # Return user response
    return UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        currency=user.get("currency", "USD")
    )
