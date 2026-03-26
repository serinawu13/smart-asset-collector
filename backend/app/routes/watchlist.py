"""
Watchlist Routes

Handles watchlist management endpoints:
- POST /api/v1/watchlist - Add item to watchlist
- GET /api/v1/watchlist - Get user's watchlist items
- PUT /api/v1/watchlist/{watchlist_id} - Update watchlist item (alerts, target price)
- DELETE /api/v1/watchlist/{watchlist_id} - Remove item from watchlist
"""

from datetime import datetime
from typing import Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from app.database import get_database
from app.utils.auth import get_current_user
from app.schemas.watchlist_item import (
    WatchlistItemCreate,
    WatchlistItemUpdate,
    WatchlistItemResponse,
    PriceAlertUpdate
)
from app.models.watchlist_item import NotificationPreferences

router = APIRouter(prefix="/api/v1/watchlist", tags=["watchlist"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    watchlist_data: WatchlistItemCreate,
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Add an item to the user's watchlist.
    
    - Validates that the item exists in the luxury_items collection
    - Prevents duplicate entries (same user + item)
    - Returns the created watchlist item with populated item details
    """
    db = get_database()
    
    # Validate item_id
    try:
        item_id = ObjectId(watchlist_data.itemId)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    # Check if item exists
    item = await db.luxury_items.find_one({"_id": item_id})
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Check if item already in watchlist
    existing = await db.watchlist_items.find_one({
        "user_id": ObjectId(current_user["id"]),
        "item_id": item_id
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item already in watchlist"
        )
    
    # Create watchlist item
    watchlist_item = {
        "user_id": ObjectId(current_user["id"]),
        "item_id": item_id,
        "target_price": watchlist_data.targetPrice,
        "alert_active": watchlist_data.alertActive,
        "alert_type": watchlist_data.alertType,
        "alert_threshold": watchlist_data.alertThreshold,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.watchlist_items.insert_one(watchlist_item)
    
    # Fetch the created item with populated details
    created_item = await db.watchlist_items.find_one({"_id": result.inserted_id})
    item_details = await db.luxury_items.find_one({"_id": created_item["item_id"]})
    
    # Format response
    response_data = {
        "watchlistId": str(created_item["_id"]),
        "itemId": str(item_details["_id"]),
        "brand": item_details["brand"],
        "model": item_details["model"],
        "category": item_details["category"],
        "material": item_details.get("material"),
        "size": item_details.get("size"),
        "color": item_details.get("color"),
        "currentMarketValue": item_details["current_market_value"],
        "retailPrice": item_details.get("retail_price"),
        "trend": item_details["trend"],
        "trendPercentage": item_details["trend_percentage"],
        "mentions30Days": item_details.get("mentions_30_days"),
        "imageUrl": item_details.get("image_url"),
        "targetPrice": created_item.get("target_price"),
        "alertActive": created_item["alert_active"],
        "alertType": created_item["alert_type"],
        "alertThreshold": created_item["alert_threshold"],
        "createdAt": created_item["created_at"],
        "updatedAt": created_item["updated_at"]
    }
    
    return {
        "item": response_data,
        "message": "Added to watchlist"
    }


@router.get("", response_model=Dict[str, List[WatchlistItemResponse]])
async def get_watchlist(
    current_user: Dict = Depends(get_current_user)
) -> Dict[str, List[WatchlistItemResponse]]:
    """
    Get all watchlist items for the authenticated user.
    
    - Fetches watchlist items for the current user
    - Populates item details from luxury_items collection
    - Returns array of watchlist items with combined data
    """
    db = get_database()
    
    # Fetch watchlist items for user
    cursor = db.watchlist_items.find({"user_id": ObjectId(current_user["id"])})
    watchlist_items = await cursor.to_list(length=None)
    
    # Populate item details for each watchlist item
    items_with_details = []
    for watchlist_item in watchlist_items:
        item_details = await db.luxury_items.find_one({"_id": watchlist_item["item_id"]})
        
        if item_details:
            item_data = {
                "watchlistId": str(watchlist_item["_id"]),
                "itemId": str(item_details["_id"]),
                "brand": item_details["brand"],
                "model": item_details["model"],
                "category": item_details["category"],
                # Use user's custom specs if set, otherwise fall back to catalog defaults
                "material": watchlist_item.get("material") or item_details.get("material"),
                "size": watchlist_item.get("size") or item_details.get("size"),
                "color": watchlist_item.get("color") or item_details.get("color"),
                "currentMarketValue": item_details["current_market_value"],
                "retailPrice": item_details.get("retail_price"),
                "trend": item_details["trend"],
                "trendPercentage": item_details["trend_percentage"],
                "mentions30Days": item_details.get("mentions_30_days"),
                "imageUrl": item_details.get("image_url"),
                "targetPrice": watchlist_item.get("target_price"),
                "alertActive": watchlist_item["alert_active"],
                "alertType": watchlist_item["alert_type"],
                "alertThreshold": watchlist_item["alert_threshold"],
                "createdAt": watchlist_item["created_at"],
                "updatedAt": watchlist_item["updated_at"]
            }
            items_with_details.append(item_data)
    
    return {"items": items_with_details}


@router.put("/{watchlist_id}")
async def update_watchlist_item(
    watchlist_id: str,
    update_data: WatchlistItemUpdate,
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Update a watchlist item's alert settings or target price.
    
    - Validates watchlist item exists and belongs to user
    - Updates only provided fields
    - Returns updated watchlist item with item details
    """
    db = get_database()
    
    # Validate watchlist_id
    try:
        wl_id = ObjectId(watchlist_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid watchlist ID format"
        )
    
    # Check if watchlist item exists and belongs to user
    watchlist_item = await db.watchlist_items.find_one({
        "_id": wl_id,
        "user_id": ObjectId(current_user["id"])
    })
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found"
        )
    
    # Build update document (only include provided fields)
    update_doc = {"updated_at": datetime.utcnow()}
    
    if update_data.targetPrice is not None:
        update_doc["target_price"] = update_data.targetPrice
    if update_data.alertActive is not None:
        update_doc["alert_active"] = update_data.alertActive
    if update_data.alertType is not None:
        update_doc["alert_type"] = update_data.alertType
    if update_data.alertThreshold is not None:
        update_doc["alert_threshold"] = update_data.alertThreshold
    if update_data.material is not None:
        update_doc["material"] = update_data.material
    if update_data.size is not None:
        update_doc["size"] = update_data.size
    if update_data.color is not None:
        update_doc["color"] = update_data.color
    
    # Update watchlist item
    await db.watchlist_items.update_one(
        {"_id": wl_id},
        {"$set": update_doc}
    )
    
    # Fetch updated item with populated details
    updated_item = await db.watchlist_items.find_one({"_id": wl_id})
    item_details = await db.luxury_items.find_one({"_id": updated_item["item_id"]})
    
    # Format response
    response_data = {
        "watchlistId": str(updated_item["_id"]),
        "itemId": str(item_details["_id"]),
        "brand": item_details["brand"],
        "model": item_details["model"],
        "category": item_details["category"],
        # Use user's custom specs if set, otherwise fall back to catalog defaults
        "material": updated_item.get("material") or item_details.get("material"),
        "size": updated_item.get("size") or item_details.get("size"),
        "color": updated_item.get("color") or item_details.get("color"),
        "currentMarketValue": item_details["current_market_value"],
        "retailPrice": item_details.get("retail_price"),
        "trend": item_details["trend"],
        "trendPercentage": item_details["trend_percentage"],
        "mentions30Days": item_details.get("mentions_30_days"),
        "imageUrl": item_details.get("image_url"),
        "targetPrice": updated_item.get("target_price"),
        "alertActive": updated_item["alert_active"],
        "alertType": updated_item["alert_type"],
        "alertThreshold": updated_item["alert_threshold"],
        "createdAt": updated_item["created_at"],
        "updatedAt": updated_item["updated_at"]
    }
    
    return {
        "item": response_data,
        "message": "Watchlist updated"
    }


@router.delete("/{watchlist_id}")
async def remove_from_watchlist(
    watchlist_id: str,
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Remove an item from the user's watchlist.
    
    - Validates watchlist item exists and belongs to user
    - Deletes the watchlist item
    - Returns success message
    """
    db = get_database()
    
    # Validate watchlist_id
    try:
        wl_id = ObjectId(watchlist_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid watchlist ID format"
        )
    
    # Check if watchlist item exists and belongs to user
    watchlist_item = await db.watchlist_items.find_one({
        "_id": wl_id,
        "user_id": ObjectId(current_user["id"])
    })
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found"
        )
    
    # Delete watchlist item
    await db.watchlist_items.delete_one({"_id": wl_id})
    
    return {"message": "Removed from watchlist"}


@router.put("/{watchlist_id}/alert")
async def update_price_alert(
    watchlist_id: str,
    alert_data: PriceAlertUpdate,
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Update price alert settings for a watchlist item.
    
    Note: Notification preferences are now managed globally in user settings.
    This endpoint only configures the alert condition and target price.
    
    - Validates watchlist item exists and belongs to user
    - Updates alert condition, target price, and threshold
    - Returns updated watchlist item with item details
    """
    db = get_database()
    
    # Validate watchlist_id
    try:
        wl_id = ObjectId(watchlist_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid watchlist ID format"
        )
    
    # Check if watchlist item exists and belongs to user
    watchlist_item = await db.watchlist_items.find_one({
        "_id": wl_id,
        "user_id": ObjectId(current_user["id"])
    })
    
    if not watchlist_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Watchlist item not found"
        )
    
    # Build update document
    update_doc = {
        "alert_active": alert_data.alertActive,
        "updated_at": datetime.utcnow()
    }
    
    if alert_data.alertCondition is not None:
        update_doc["alert_condition"] = alert_data.alertCondition
    if alert_data.alertTargetPrice is not None:
        update_doc["alert_target_price"] = alert_data.alertTargetPrice
    if alert_data.alertThresholdPercent is not None:
        update_doc["alert_threshold_percent"] = alert_data.alertThresholdPercent
    
    # Update watchlist item
    await db.watchlist_items.update_one(
        {"_id": wl_id},
        {"$set": update_doc}
    )
    
    # Fetch updated item with populated details
    updated_item = await db.watchlist_items.find_one({"_id": wl_id})
    item_details = await db.luxury_items.find_one({"_id": updated_item["item_id"]})
    
    # Format response with new alert fields
    response_data = {
        "watchlistId": str(updated_item["_id"]),
        "itemId": str(item_details["_id"]),
        "brand": item_details["brand"],
        "model": item_details["model"],
        "category": item_details["category"],
        "material": updated_item.get("material") or item_details.get("material"),
        "size": updated_item.get("size") or item_details.get("size"),
        "color": updated_item.get("color") or item_details.get("color"),
        "currentMarketValue": item_details["current_market_value"],
        "retailPrice": item_details.get("retail_price"),
        "trend": item_details["trend"],
        "trendPercentage": item_details["trend_percentage"],
        "mentions30Days": item_details.get("mentions_30_days"),
        "imageUrl": item_details.get("image_url"),
        "targetPrice": updated_item.get("target_price"),
        "alertActive": updated_item["alert_active"],
        "alertType": updated_item.get("alert_type", "none"),
        "alertThreshold": updated_item.get("alert_threshold", 5.0),
        "alertCondition": updated_item.get("alert_condition"),
        "alertTargetPrice": updated_item.get("alert_target_price"),
        "alertThresholdPercent": updated_item.get("alert_threshold_percent"),
        "lastNotifiedAt": updated_item.get("last_notified_at"),
        "createdAt": updated_item["created_at"],
        "updatedAt": updated_item["updated_at"]
    }
    
    return {
        "item": response_data,
        "message": "Price alert updated"
    }
