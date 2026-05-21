"""
Luxury Item Schemas
Request and response schemas for luxury item endpoints
"""
from pydantic import BaseModel, Field, field_validator
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


class LuxuryItemCreate(BaseModel):
    """
    Schema for creating a new luxury item
    """
    brand: str = Field(..., min_length=1, max_length=100, description="Brand name")
    model: str = Field(..., min_length=1, max_length=200, description="Model name")
    category: str = Field(..., description="Category: Watch, Bag, or Jewelry")
    material: Optional[str] = Field(None, max_length=100, description="Material")
    size: Optional[str] = Field(None, max_length=50, description="Size")
    color: Optional[str] = Field(None, max_length=50, description="Color")
    currentMarketValue: float = Field(..., gt=0, description="Current market value")
    retailPrice: Optional[float] = Field(None, gt=0, description="Original retail price")
    trend: str = Field(..., description="Price trend: up, down, or stable")
    trendPercentage: float = Field(..., description="Trend percentage")
    mentions30Days: int = Field(default=0, ge=0, description="Number of mentions in last 30 days")
    imageUrl: Optional[str] = Field(None, max_length=500, description="Image URL")

    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        if v not in ['Watch', 'Bag', 'Jewelry']:
            raise ValueError('Category must be Watch, Bag, or Jewelry')
        return v

    @field_validator('trend')
    @classmethod
    def validate_trend(cls, v):
        if v not in ['up', 'down', 'stable']:
            raise ValueError('Trend must be up, down, or stable')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "brand": "Rolex",
                "model": "Daytona 116500LN",
                "category": "Watch",
                "material": "Oystersteel",
                "size": "40mm",
                "color": "White",
                "currentMarketValue": 35000,
                "retailPrice": 14550,
                "trend": "up",
                "trendPercentage": 3.5,
                "mentions30Days": 18500,
                "imageUrl": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&q=80"
            }
        }


class LuxuryItemListResponse(BaseModel):
    """
    Response schema for list of luxury items
    """
    items: list[LuxuryItemResponse] = Field(..., description="List of luxury items")


class CatalogListResponse(BaseModel):
    """
    Response schema for paginated catalog listing
    """
    items: list[LuxuryItemResponse] = Field(..., description="List of luxury items")
    total: int = Field(..., description="Total number of matching items")
    page: int = Field(..., description="Current page number")
    pageSize: int = Field(..., description="Number of items per page")
    hasMore: bool = Field(..., description="Whether more pages exist")

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
