"""
Luxury Items Routes
Endpoints for browsing and searching luxury items catalog
"""
from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional
from bson import ObjectId
from app.database import get_database
from app.schemas.luxury_item import LuxuryItemResponse, LuxuryItemListResponse
import logging
import re
import unicodedata

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/items", tags=["Luxury Items"])


def create_accent_insensitive_regex(text: str) -> str:
    """
    Create a regex pattern that matches text with or without accents
    Example: "Hermes" -> "H[eèéêë]r[mḿ][eèéêë]s"
    """
    # Map of base characters to their accented variants
    accent_map = {
        'a': '[aàáâãäåāăąǎǻ]',
        'e': '[eèéêëēĕėęě]',
        'i': '[iìíîïĩīĭįı]',
        'o': '[oòóôõöøōŏőǒ]',
        'u': '[uùúûüũūŭůűų]',
        'c': '[cçćĉċč]',
        'n': '[nñńņň]',
        's': '[sśŝşš]',
        'y': '[yýÿŷ]',
        'z': '[zźżž]',
    }
    
    # Build regex pattern
    pattern = ''
    for char in text.lower():
        if char in accent_map:
            pattern += accent_map[char]
        else:
            pattern += re.escape(char)
    
    return pattern


def format_luxury_item(item: dict) -> dict:
    """
    Format luxury item from database to response format
    Converts snake_case to camelCase for frontend
    """
    return {
        "id": str(item["_id"]),
        "brand": item["brand"],
        "model": item["model"],
        "category": item["category"],
        "material": item.get("material"),
        "size": item.get("size"),
        "color": item.get("color"),
        "currentMarketValue": item["current_market_value"],
        "retailPrice": item.get("retail_price"),
        "trend": item["trend"],
        "trendPercentage": item["trend_percentage"],
        "mentions30Days": item.get("mentions_30_days", 0),
        "imageUrl": item.get("image_url")
    }


@router.get("", response_model=LuxuryItemListResponse)
async def get_luxury_items(
    category: Optional[str] = Query(None, pattern="^(Watch|Bag|Jewelry)$", description="Filter by category"),
    search: Optional[str] = Query(None, min_length=1, description="Search in brand and model"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of items to return")
):
    """
    Get luxury items catalog with optional filtering
    
    - **category**: Filter by Watch, Bag, or Jewelry
    - **search**: Search text in brand and model (case-insensitive)
    - **limit**: Maximum number of results (default 50)
    """
    try:
        db = get_database()
        collection = db["luxury_items"]
        
        # Build query filter
        query = {}
        
        # Category filter
        if category:
            query["category"] = category
        
        # Search filter (case-insensitive and accent-insensitive)
        if search:
            # Create regex pattern that matches both accented and non-accented versions
            search_pattern = create_accent_insensitive_regex(search)
            query["$or"] = [
                {"brand": {"$regex": search_pattern, "$options": "i"}},
                {"model": {"$regex": search_pattern, "$options": "i"}}
            ]
        
        # Execute query
        cursor = collection.find(query).limit(limit)
        items = await cursor.to_list(length=limit)
        
        # Format items for response
        formatted_items = [format_luxury_item(item) for item in items]
        
        logger.info(f"Retrieved {len(formatted_items)} luxury items (category={category}, search={search})")
        
        return {"items": formatted_items}
        
    except Exception as e:
        logger.error(f"Error retrieving luxury items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve luxury items"
        )


@router.get("/trending", response_model=LuxuryItemListResponse)
async def get_trending_items(
    limit: int = Query(3, ge=1, le=10, description="Number of trending items to return")
):
    """
    Get top trending luxury items sorted by mentions in last 30 days
    
    - **limit**: Number of trending items (default 3)
    """
    try:
        db = get_database()
        collection = db["luxury_items"]
        
        # Get items sorted by mentions_30_days descending
        cursor = collection.find().sort("mentions_30_days", -1).limit(limit)
        items = await cursor.to_list(length=limit)
        
        # Format items for response
        formatted_items = [format_luxury_item(item) for item in items]
        
        logger.info(f"Retrieved {len(formatted_items)} trending luxury items")
        
        return {"items": formatted_items}
        
    except Exception as e:
        logger.error(f"Error retrieving trending items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve trending items"
        )


@router.get("/{item_id}", response_model=LuxuryItemResponse)
async def get_luxury_item(item_id: str):
    """
    Get detailed information for a specific luxury item
    
    - **item_id**: MongoDB ObjectId of the item
    """
    try:
        # Validate ObjectId format
        if not ObjectId.is_valid(item_id):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid item ID format"
            )
        
        db = get_database()
        collection = db["luxury_items"]
        
        # Find item by ID
        item = await collection.find_one({"_id": ObjectId(item_id)})
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Luxury item not found"
            )
        
        # Format item for response
        formatted_item = format_luxury_item(item)
        
        logger.info(f"Retrieved luxury item: {item_id}")
        
        return formatted_item
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving luxury item {item_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve luxury item"
        )
