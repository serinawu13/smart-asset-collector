"""
Notification Model

Defines the Pydantic model for in-app notifications in MongoDB.
"""

from datetime import datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field
from bson import ObjectId
from .user import PyObjectId


class NotificationType(str, Enum):
    """Enum for notification types"""
    PRICE_ALERT = "price_alert"
    SYSTEM = "system"


class Notification(BaseModel):
    """
    Notification model for MongoDB documents.
    
    Fields:
    - id: Unique identifier for the notification
    - user_id: Reference to the user who receives this notification
    - type: Type of notification (price_alert, system, etc.)
    - title: Short title for the notification
    - message: Detailed message content
    - item_id: Optional reference to the related item
    - is_read: Whether the notification has been read
    - created_at: Timestamp when notification was created
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: ObjectId
    type: NotificationType
    title: str
    message: str
    item_id: Optional[ObjectId] = None
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }
        use_enum_values = True
