"""
Admin Routes
Endpoints for administrative tasks like seeding data
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.database import get_database
from app.schemas.luxury_item import LuxuryItemCreate, LuxuryItemResponse
from app.routes.items import format_luxury_item
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.post("/items/seed", response_model=dict)
async def seed_luxury_items(items: List[LuxuryItemCreate]):
    """
    Seed luxury items into the catalog
    
    Accepts a list of luxury items and inserts them into the database.
    This endpoint allows you to programmatically add items to the catalog.
    
    **Example Request Body:**
    ```json
    [
        {
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
            "imageUrl": "https://images.unsplash.com/photo-1..."
        }
    ]
    ```
    """
    try:
        db = get_database()
        collection = db["luxury_items"]
        
        # Convert items to database format (camelCase to snake_case)
        db_items = []
        for item in items:
            db_item = {
                "brand": item.brand,
                "model": item.model,
                "category": item.category,
                "material": item.material,
                "size": item.size,
                "color": item.color,
                "current_market_value": item.currentMarketValue,
                "retail_price": item.retailPrice,
                "trend": item.trend,
                "trend_percentage": item.trendPercentage,
                "mentions_30_days": item.mentions30Days,
                "image_url": item.imageUrl
            }
            db_items.append(db_item)
        
        # Insert items
        result = await collection.insert_many(db_items)
        inserted_count = len(result.inserted_ids)
        
        logger.info(f"Successfully seeded {inserted_count} luxury items")
        
        return {
            "success": True,
            "message": f"Successfully inserted {inserted_count} luxury items",
            "insertedIds": [str(id) for id in result.inserted_ids]
        }
        
    except Exception as e:
        logger.error(f"Error seeding luxury items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to seed luxury items: {str(e)}"
        )


@router.post("/items", response_model=LuxuryItemResponse)
async def create_luxury_item(item: LuxuryItemCreate):
    """
    Create a single luxury item
    
    Add one luxury item to the catalog.
    """
    try:
        db = get_database()
        collection = db["luxury_items"]
        
        # Convert to database format
        db_item = {
            "brand": item.brand,
            "model": item.model,
            "category": item.category,
            "material": item.material,
            "size": item.size,
            "color": item.color,
            "current_market_value": item.currentMarketValue,
            "retail_price": item.retailPrice,
            "trend": item.trend,
            "trend_percentage": item.trendPercentage,
            "mentions_30_days": item.mentions30Days,
            "image_url": item.imageUrl
        }
        
        # Insert item
        result = await collection.insert_one(db_item)
        
        # Retrieve the inserted item
        inserted_item = await collection.find_one({"_id": result.inserted_id})
        
        logger.info(f"Created luxury item: {item.brand} {item.model}")
        
        return format_luxury_item(inserted_item)
        
    except Exception as e:
        logger.error(f"Error creating luxury item: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create luxury item: {str(e)}"
        )


@router.delete("/items/clear", response_model=dict)
async def clear_all_items():
    """
    Clear all luxury items from the catalog
    
    **Warning:** This will delete all items in the database!
    """
    try:
        db = get_database()
        collection = db["luxury_items"]
        
        result = await collection.delete_many({})
        deleted_count = result.deleted_count
        
        logger.warning(f"Cleared {deleted_count} luxury items from database")
        
        return {
            "success": True,
            "message": f"Deleted {deleted_count} luxury items",
            "deletedCount": deleted_count
        }
        
    except Exception as e:
        logger.error(f"Error clearing luxury items: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear luxury items: {str(e)}"
        )
