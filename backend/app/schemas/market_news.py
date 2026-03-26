"""
Market News Schemas
Request/response schemas for market news endpoints
"""
from pydantic import BaseModel
from typing import Optional


class MarketNewsResponse(BaseModel):
    """Schema for market news article response"""
    id: str
    source: str
    title: str
    date: str
    category: str
    url: str
    image_url: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "source": "Business of Fashion",
                "title": "The Resale Market for Luxury Watches Shows Signs of Stabilization",
                "date": "2 hours ago",
                "category": "Watches",
                "url": "#",
                "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400"
            }
        }
