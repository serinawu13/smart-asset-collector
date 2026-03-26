from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date
from enum import Enum


class ConditionEnum(str, Enum):
    PRISTINE = "Pristine"
    EXCELLENT = "Excellent"
    GOOD = "Good"
    FAIR = "Fair"


class PortfolioAssetCreate(BaseModel):
    """Schema for creating a portfolio asset"""
    itemId: str = Field(..., description="ID of the luxury item to add")
    purchasePrice: float = Field(..., gt=0, description="Purchase price")
    purchaseDate: str = Field(..., description="Purchase date in YYYY-MM-DD format")
    condition: ConditionEnum = Field(..., description="Asset condition")
    material: str = Field(..., min_length=1, description="Material specification")
    size: str = Field(..., min_length=1, description="Size specification")
    color: Optional[str] = Field(None, description="Color specification")
    serialNumber: Optional[str] = Field(None, description="Serial number")

    @field_validator('purchaseDate')
    @classmethod
    def validate_date(cls, v):
        """Validate date format"""
        try:
            date.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')


class PortfolioAssetUpdate(BaseModel):
    """Schema for updating a portfolio asset"""
    purchasePrice: Optional[float] = Field(None, gt=0)
    purchaseDate: Optional[str] = None
    condition: Optional[ConditionEnum] = None
    material: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    serialNumber: Optional[str] = None
    alertActive: Optional[bool] = None
    alertType: Optional[str] = None
    alertThreshold: Optional[float] = None

    @field_validator('purchaseDate')
    @classmethod
    def validate_date(cls, v):
        """Validate date format if provided"""
        if v is not None:
            try:
                date.fromisoformat(v)
                return v
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v


class PortfolioAssetSell(BaseModel):
    """Schema for selling a portfolio asset"""
    salePrice: float = Field(..., gt=0, description="Sale price")
    saleDate: str = Field(..., description="Sale date in YYYY-MM-DD format")

    @field_validator('saleDate')
    @classmethod
    def validate_date(cls, v):
        """Validate date format"""
        try:
            date.fromisoformat(v)
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')


class PortfolioAssetResponse(BaseModel):
    """Schema for portfolio asset response with item details"""
    portfolioId: str
    itemId: str
    brand: str
    model: str
    category: str
    purchasePrice: float
    purchaseDate: str
    condition: str
    serialNumber: Optional[str] = None
    material: str
    size: str
    color: Optional[str] = None
    currentMarketValue: float
    retailPrice: Optional[float] = None
    trend: str
    trendPercentage: float
    imageUrl: Optional[str] = None
    alertActive: bool = False
    alertType: str = "none"
    alertThreshold: float = 5.0

    class Config:
        populate_by_name = True
