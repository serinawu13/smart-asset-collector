"""
User Settings Routes
Handles user preferences (currency, notifications)
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from app.utils.auth import get_current_user
from app.database import get_database
from pydantic import BaseModel, Field

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


class NotificationPreferencesSchema(BaseModel):
    """Schema for notification preferences"""
    inApp: bool = Field(True, description="Enable in-app notifications")
    email: bool = Field(False, description="Enable email notifications")


class SettingsUpdate(BaseModel):
    """Schema for updating user settings"""
    currency: Optional[str] = Field(None, pattern="^(USD|EUR|GBP|CHF)$")
    notificationPrefs: Optional[NotificationPreferencesSchema] = None


class SettingsResponse(BaseModel):
    """Schema for settings response"""
    currency: str
    notificationPrefs: NotificationPreferencesSchema


@router.get("", response_model=SettingsResponse)
async def get_settings(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Get user preferences
    
    Returns:
        User settings (currency and notification preferences)
    """
    notification_prefs = current_user.get("notification_prefs", {"in_app": True, "email": False})
    
    return SettingsResponse(
        currency=current_user.get("currency", "USD"),
        notificationPrefs=NotificationPreferencesSchema(
            inApp=notification_prefs.get("in_app", True),
            email=notification_prefs.get("email", False)
        )
    )


@router.put("", response_model=Dict[str, Any])
async def update_settings(
    settings: SettingsUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update user preferences
    
    Args:
        settings: Updated settings (currency and/or notification preferences)
        current_user: Authenticated user from JWT
        db: Database connection
    
    Returns:
        Updated settings and success message
    """
    from bson import ObjectId
    
    # Build update document
    update_doc = {}
    
    if settings.currency is not None:
        update_doc["currency"] = settings.currency
    
    if settings.notificationPrefs is not None:
        update_doc["notification_prefs"] = {
            "in_app": settings.notificationPrefs.inApp,
            "email": settings.notificationPrefs.email
        }
    
    if not update_doc:
        raise HTTPException(status_code=400, detail="No settings provided to update")
    
    # Update user's preferences
    result = await db["users"].update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_doc}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch updated user to return current settings
    updated_user = await db["users"].find_one({"_id": ObjectId(current_user["id"])})
    notification_prefs = updated_user.get("notification_prefs", {"in_app": True, "email": False})
    
    return {
        "settings": {
            "currency": updated_user.get("currency", "USD"),
            "notificationPrefs": {
                "inApp": notification_prefs.get("in_app", True),
                "email": notification_prefs.get("email", False)
            }
        },
        "message": "Settings updated"
    }
