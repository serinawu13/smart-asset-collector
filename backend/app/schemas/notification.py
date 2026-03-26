"""
Notification Schemas

Defines request and response schemas for notification operations.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class NotificationResponse(BaseModel):
    """Schema for notification response."""
    id: str = Field(..., description="Notification ID")
    userId: str = Field(..., description="User ID")
    type: str = Field(..., description="Notification type")
    title: str = Field(..., description="Notification title")
    message: str = Field(..., description="Notification message")
    itemId: Optional[str] = Field(None, description="Related item ID")
    isRead: bool = Field(..., description="Read status")
    createdAt: datetime = Field(..., description="Creation timestamp")

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class NotificationListResponse(BaseModel):
    """Schema for paginated notification list response."""
    notifications: list[NotificationResponse]
    total: int
    page: int
    pageSize: int
    hasMore: bool


class UnreadCountResponse(BaseModel):
    """Schema for unread notification count response."""
    count: int


class MarkReadRequest(BaseModel):
    """Schema for marking notifications as read."""
    notificationIds: Optional[list[str]] = Field(None, description="Specific notification IDs to mark as read")
