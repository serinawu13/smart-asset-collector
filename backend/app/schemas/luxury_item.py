"""
Luxury Item Schemas
Request and response schemas for luxury item endpoints
"""
from pydantic import BaseModel, Field
from typing import Optional


class LuxuryItemResponse(BaseModel):
    """
    Response schema for luxury item
    """
    id: str = Field(..., description="Item ID")
    brand: str = Field(..., description="Brand name")
    model: str = Field(..., description="Model name")
    category: str = Field(..., description="Category: Watch, Bag, or Jewelry")
    material: Optional[str] = Field(None, description="Material")
    size: Optional[str] = Field(None, description="Size")
    color: Optional[str] = Field(None, description="Color")
    currentMarketValue: float = Field(..., description="Current market value")
    retailPrice: Optional[float] = Field(None, description="Original retail price")
    trend: str = Field(..., description="Price trend: up, down, or stable")
    trendPercentage: float = Field(..., description="Trend percentage")
    mentions30Days: int = Field(..., description="Number of mentions in last 30 days")
    imageUrl: Optional[str] = Field(None, description="Image URL")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "brand": "Rolex",
                "model": "Submariner Date 126610LN",
                "category": "Watch",
                "material": "Oystersteel",
                "size": "41mm",
                "currentMarketValue": 14500,
                "retailPrice": 10250,
                "trend": "up",
                "trendPercentage": 2.4,
                "mentions30Days": 12450,
                "imageUrl": "https://images.unsplash.com/..."
            }
        }


class LuxuryItemListResponse(BaseModel):
    """
    Response schema for list of luxury items
    """
    items: list[LuxuryItemResponse] = Field(..., description="List of luxury items")

    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "id": "507f1f77bcf86cd799439011",
                        "brand": "Rolex",
                        "model": "Submariner Date 126610LN",
                        "category": "Watch",
                        "material": "Oystersteel",
                        "size": "41mm",
                        "currentMarketValue": 14500,
                        "retailPrice": 10250,
                        "trend": "up",
                        "trendPercentage": 2.4,
                        "mentions30Days": 12450,
                        "imageUrl": "https://images.unsplash.com/..."
                    }
                ]
            }
        }
