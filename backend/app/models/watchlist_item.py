"""
Watchlist Item Model

Defines the Pydantic model for watchlist items in MongoDB.
"""

from datetime import datetime
from typing import Optional
from enum import Enum
from pydantic import BaseModel, Field
from bson import ObjectId


class PriceAlertCondition(str, Enum):
    """Enum for price alert conditions"""
    ABOVE = "above"
    BELOW = "below"
    PERCENTAGE_UP = "percentage_up"
    PERCENTAGE_DOWN = "percentage_down"


class NotificationPreferences(BaseModel):
    """Notification preferences for alerts"""
    in_app: bool = True
    email: bool = False


class WatchlistItem(BaseModel):
    """
    WatchlistItem model for MongoDB documents.
    
    Fields:
    - user_id: Reference to the user who owns this watchlist item
    - item_id: Reference to the luxury item being watched
    - target_price: Optional target price the user wants to reach (deprecated, use alert_target_price)
    - alert_active: Whether price alerts are enabled
    - alert_type: Type of alert (up|down|both|none) - deprecated, use alert_condition
    - alert_threshold: Percentage threshold for triggering alerts (deprecated, use alert_threshold_percent)
    - alert_condition: Condition for triggering the alert
    - alert_target_price: Specific price target for the alert
    - alert_threshold_percent: Percentage change threshold for the alert
    - notification_prefs: Notification delivery preferences (in-app, email)
    - last_notified_at: Timestamp of last notification to prevent spam
    - created_at: Timestamp when item was added to watchlist
    - updated_at: Timestamp when item was last updated
    """
    user_id: ObjectId
    item_id: ObjectId
    
    # Legacy fields (kept for backward compatibility)
    target_price: Optional[float] = None
    alert_active: bool = False
    alert_type: str = "none"  # up|down|both|none
    alert_threshold: float = 5.0  # percentage
    
    # New alert fields
    alert_condition: Optional[PriceAlertCondition] = None
    alert_target_price: Optional[float] = None
    alert_threshold_percent: Optional[float] = None
    notification_prefs: NotificationPreferences = Field(default_factory=NotificationPreferences)
    last_notified_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat()
        }
        use_enum_values = True
