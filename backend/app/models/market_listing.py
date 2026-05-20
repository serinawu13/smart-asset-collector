from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId


class PyObjectId(ObjectId):
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


class MarketListingModel(BaseModel):
    """
    Raw scraped listing from a resale marketplace.
    Generic across categories — bags use size_cm, watches/jewelry use specifications.
    """
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    source: str                        # "vestiaire" | "rebag" | "chrono24"
    category: str                      # "Bag" | "Watch" | "Jewelry"
    brand: str
    model: str                         # "Birkin" | "Kelly"
    size_cm: Optional[int] = None      # 25 | 30 | 35 | 40 (bags only)
    color: Optional[str] = None
    material: Optional[str] = None
    hardware: Optional[str] = None
    condition: str = "Good"            # "Excellent" | "Very Good" | "Good" | "Fair"
    price_usd: float
    retail_price: Optional[float] = None
    sold: bool = False
    listing_url: str
    images: list = Field(default_factory=list)
    scraped_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    specifications: dict = Field(default_factory=dict)  # watches: case_diameter_mm, reference; jewelry: ring_size, metal
    raw_data: dict = Field(default_factory=dict)        # full Apify response for reprocessing

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
