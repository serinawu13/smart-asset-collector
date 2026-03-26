from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from bson import ObjectId


class PortfolioAsset(BaseModel):
    """Portfolio asset model for MongoDB"""
    user_id: str = Field(..., description="User ID who owns this asset")
    item_id: str = Field(..., description="Reference to luxury item")
    purchase_price: float = Field(..., gt=0, description="Purchase price in user's currency")
    purchase_date: date = Field(..., description="Date of purchase")
    condition: str = Field(..., description="Asset condition: Pristine|Excellent|Good|Fair")
    material: str = Field(..., description="Material specification")
    size: str = Field(..., description="Size specification")
    color: Optional[str] = Field(None, description="Color specification")
    serial_number: Optional[str] = Field(None, description="Serial number if available")
    is_sold: bool = Field(default=False, description="Whether asset has been sold")
    sale_price: Optional[float] = Field(None, description="Sale price if sold")
    sale_date: Optional[date] = Field(None, description="Sale date if sold")
    # Alert fields
    alert_active: bool = Field(default=False, description="Whether price alerts are active")
    alert_type: str = Field(default="none", description="Alert type: up|down|both|none")
    alert_threshold: float = Field(default=5.0, description="Alert threshold percentage")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }
        populate_by_name = True
