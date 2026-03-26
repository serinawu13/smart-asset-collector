"""
Luxury Item Model
Represents luxury items in the catalog (watches, bags, jewelry)
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class LuxuryItemModel(BaseModel):
    """
    Luxury Item database model
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    brand: str = Field(..., min_length=1, max_length=100)
    model: str = Field(..., min_length=1, max_length=200)
    category: str = Field(..., pattern="^(Watch|Bag|Jewelry)$")
    material: Optional[str] = Field(None, max_length=100)
    size: Optional[str] = Field(None, max_length=50)
    color: Optional[str] = Field(None, max_length=50)
    current_market_value: float = Field(..., gt=0)
    retail_price: Optional[float] = Field(None, gt=0)
    trend: str = Field(..., pattern="^(up|down|stable)$")
    trend_percentage: float = Field(...)
    mentions_30_days: int = Field(default=0, ge=0)
    image_url: Optional[str] = Field(None, max_length=500)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "brand": "Rolex",
                "model": "Submariner Date 126610LN",
                "category": "Watch",
                "material": "Oystersteel",
                "size": "41mm",
                "current_market_value": 14500,
                "retail_price": 10250,
                "trend": "up",
                "trend_percentage": 2.4,
                "mentions_30_days": 12450,
                "image_url": "https://images.unsplash.com/..."
            }
        }
