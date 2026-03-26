"""
Watchlist Item Schemas

Defines request and response schemas for watchlist item operations.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


class NotificationPreferencesSchema(BaseModel):
    """Schema for notification preferences."""
    inApp: bool = Field(True, description="Enable in-app notifications")
    email: bool = Field(False, description="Enable email notifications")


class WatchlistItemCreate(BaseModel):
    """Schema for creating a new watchlist item."""
    itemId: str = Field(..., description="ID of the luxury item to watch")
    targetPrice: Optional[float] = Field(None, description="Target price for the item")
    alertActive: bool = Field(False, description="Whether alerts are enabled")
    alertType: str = Field("none", description="Type of alert: up|down|both|none")
    alertThreshold: float = Field(5.0, description="Alert threshold percentage")

    @field_validator("alertType")
    @classmethod
    def validate_alert_type(cls, v):
        allowed = ["up", "down", "both", "none"]
        if v not in allowed:
            raise ValueError(f"alertType must be one of: {', '.join(allowed)}")
        return v

    @field_validator("alertThreshold")
    @classmethod
    def validate_threshold(cls, v):
        if v < 0 or v > 100:
            raise ValueError("alertThreshold must be between 0 and 100")
        return v

    @field_validator("targetPrice")
    @classmethod
    def validate_target_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError("targetPrice must be positive")
        return v


class WatchlistItemUpdate(BaseModel):
    """Schema for updating a watchlist item."""
    targetPrice: Optional[float] = None
    alertActive: Optional[bool] = None
    alertType: Optional[str] = None
    alertThreshold: Optional[float] = None
    material: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None

    @field_validator("alertType")
    @classmethod
    def validate_alert_type(cls, v):
        if v is not None:
            allowed = ["up", "down", "both", "none"]
            if v not in allowed:
                raise ValueError(f"alertType must be one of: {', '.join(allowed)}")
        return v

    @field_validator("alertThreshold")
    @classmethod
    def validate_threshold(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("alertThreshold must be between 0 and 100")
        return v

    @field_validator("targetPrice")
    @classmethod
    def validate_target_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError("targetPrice must be positive")
        return v


class PriceAlertUpdate(BaseModel):
    """Schema for updating price alert settings on a watchlist item."""
    alertActive: bool = Field(..., description="Whether the alert is active")
    alertCondition: Optional[str] = Field(None, description="Alert condition: above|below|percentage_up|percentage_down")
    alertTargetPrice: Optional[float] = Field(None, description="Target price for the alert")
    alertThresholdPercent: Optional[float] = Field(None, description="Percentage threshold for the alert")
    notificationPrefs: NotificationPreferencesSchema = Field(default_factory=lambda: NotificationPreferencesSchema())

    @field_validator("alertCondition")
    @classmethod
    def validate_alert_condition(cls, v):
        if v is not None:
            allowed = ["above", "below", "percentage_up", "percentage_down"]
            if v not in allowed:
                raise ValueError(f"alertCondition must be one of: {', '.join(allowed)}")
        return v

    @field_validator("alertTargetPrice")
    @classmethod
    def validate_target_price(cls, v):
        if v is not None and v <= 0:
            raise ValueError("alertTargetPrice must be positive")
        return v

    @field_validator("alertThresholdPercent")
    @classmethod
    def validate_threshold_percent(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError("alertThresholdPercent must be between 0 and 100")
        return v


class WatchlistItemResponse(BaseModel):
    """Schema for watchlist item response with populated item details."""
    watchlistId: str
    itemId: str
    brand: str
    model: str
    category: str
    material: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    currentMarketValue: float
    retailPrice: Optional[float] = None
    trend: str
    trendPercentage: float
    mentions30Days: Optional[int] = None
    imageUrl: Optional[str] = None
    targetPrice: Optional[float] = None
    alertActive: bool
    alertType: str
    alertThreshold: float
    # New alert fields
    alertCondition: Optional[str] = None
    alertTargetPrice: Optional[float] = None
    alertThresholdPercent: Optional[float] = None
    notificationPrefs: Optional[NotificationPreferencesSchema] = None
    lastNotifiedAt: Optional[datetime] = None
    createdAt: datetime
    updatedAt: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
