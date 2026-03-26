"""
Market News Model
Represents news articles about luxury markets
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class MarketNews(BaseModel):
    """Market news article model"""
    source: str = Field(..., description="News source name")
    title: str = Field(..., description="Article title")
    date: str = Field(..., description="Relative date (e.g., '2 hours ago')")
    category: str = Field(..., description="Article category")
    url: str = Field(..., description="Article URL")
    image_url: Optional[str] = Field(None, description="Article image URL")
    published_at: datetime = Field(..., description="Publication timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "source": "Business of Fashion",
                "title": "The Resale Market for Luxury Watches Shows Signs of Stabilization",
                "date": "2 hours ago",
                "category": "Watches",
                "url": "#",
                "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400",
                "published_at": "2026-03-18T10:00:00Z"
            }
        }
