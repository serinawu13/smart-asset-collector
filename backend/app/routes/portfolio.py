from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from bson import ObjectId

from app.database import get_database
from app.utils.auth import get_current_user
from app.utils.analytics import (
    calculate_portfolio_totals,
    generate_chart_data,
    calculate_timeframe_change,
    calculate_asset_metrics
)
from app.schemas.portfolio_asset import (
    PortfolioAssetCreate,
    PortfolioAssetUpdate,
    PortfolioAssetSell,
    PortfolioAssetResponse
)

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])


def convert_object_id(obj_id) -> str:
    """Convert ObjectId to string"""
    return str(obj_id) if obj_id else None


async def get_portfolio_asset_with_item(db, portfolio_doc: dict) -> dict:
    """Fetch portfolio asset with populated item details"""
    # Get the luxury item details
    item = await db.luxury_items.find_one({"_id": ObjectId(portfolio_doc["item_id"])})
    
    if not item:
        return None
    
    # Combine portfolio and item data
    return {
        "portfolioId": convert_object_id(portfolio_doc["_id"]),
        "itemId": convert_object_id(item["_id"]),
        "brand": item["brand"],
        "model": item["model"],
        "category": item["category"],
        "purchasePrice": portfolio_doc["purchase_price"],
        "purchaseDate": portfolio_doc["purchase_date"].date().isoformat() if isinstance(portfolio_doc["purchase_date"], datetime) else (portfolio_doc["purchase_date"].isoformat() if isinstance(portfolio_doc["purchase_date"], date) else portfolio_doc["purchase_date"]),
        "condition": portfolio_doc["condition"],
        "serialNumber": portfolio_doc.get("serial_number"),
        "material": portfolio_doc["material"],
        "size": portfolio_doc["size"],
        "color": portfolio_doc.get("color"),
        "currentMarketValue": item["current_market_value"],
        "retailPrice": item.get("retail_price"),
        "trend": item["trend"],
        "trendPercentage": item["trend_percentage"],
        "imageUrl": item.get("image_url"),
        "alertActive": portfolio_doc.get("alert_active", False),
        "alertType": portfolio_doc.get("alert_type", "none"),
        "alertThreshold": portfolio_doc.get("alert_threshold", 5.0)
    }


@router.get("", response_model=dict)
async def get_portfolio(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get all portfolio assets for the authenticated user"""
    try:
        # Fetch all portfolio assets for the user that are not sold
        cursor = db.portfolio_assets.find({
            "user_id": current_user["id"],
            "is_sold": False
        })
        
        portfolio_docs = await cursor.to_list(length=None)
        
        # Populate each asset with item details
        assets = []
        for portfolio_doc in portfolio_docs:
            asset = await get_portfolio_asset_with_item(db, portfolio_doc)
            if asset:
                assets.append(asset)
        
        return {"assets": assets}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch portfolio: {str(e)}"
        )


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_portfolio_asset(
    asset_data: PortfolioAssetCreate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Add a new asset to the user's portfolio"""
    try:
        # Validate that the item exists
        item = await db.luxury_items.find_one({"_id": ObjectId(asset_data.itemId)})
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Luxury item not found"
            )
        
        # Parse the purchase date and convert to datetime for MongoDB
        purchase_date = date.fromisoformat(asset_data.purchaseDate)
        purchase_datetime = datetime.combine(purchase_date, datetime.min.time())
        
        # Create portfolio asset document
        portfolio_doc = {
            "user_id": current_user["id"],
            "item_id": asset_data.itemId,
            "purchase_price": asset_data.purchasePrice,
            "purchase_date": purchase_datetime,
            "condition": asset_data.condition.value,
            "material": asset_data.material,
            "size": asset_data.size,
            "color": asset_data.color,
            "serial_number": asset_data.serialNumber,
            "is_sold": False,
            "sale_price": None,
            "sale_date": None,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert into database
        result = await db.portfolio_assets.insert_one(portfolio_doc)
        
        # Fetch the created asset with item details
        created_doc = await db.portfolio_assets.find_one({"_id": result.inserted_id})
        asset = await get_portfolio_asset_with_item(db, created_doc)
        
        return {
            "asset": asset,
            "message": "Asset added successfully"
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add asset: {str(e)}"
        )


@router.put("/{portfolio_id}")
async def update_portfolio_asset(
    portfolio_id: str,
    asset_data: PortfolioAssetUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Update a portfolio asset's details"""
    try:
        # Verify the asset exists and belongs to the user
        portfolio_doc = await db.portfolio_assets.find_one({
            "_id": ObjectId(portfolio_id),
            "user_id": current_user["id"]
        })
        
        if not portfolio_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio asset not found"
            )
        
        # Build update document with only provided fields
        update_data = {"updated_at": datetime.utcnow()}
        
        if asset_data.purchasePrice is not None:
            update_data["purchase_price"] = asset_data.purchasePrice
        
        if asset_data.purchaseDate is not None:
            purchase_date = date.fromisoformat(asset_data.purchaseDate)
            update_data["purchase_date"] = datetime.combine(purchase_date, datetime.min.time())
        
        if asset_data.condition is not None:
            update_data["condition"] = asset_data.condition.value
        
        if asset_data.material is not None:
            update_data["material"] = asset_data.material
        
        if asset_data.size is not None:
            update_data["size"] = asset_data.size
        
        if asset_data.color is not None:
            update_data["color"] = asset_data.color
        
        if asset_data.serialNumber is not None:
            update_data["serial_number"] = asset_data.serialNumber
        
        # Alert fields
        if asset_data.alertActive is not None:
            update_data["alert_active"] = asset_data.alertActive
        
        if asset_data.alertType is not None:
            update_data["alert_type"] = asset_data.alertType
        
        if asset_data.alertThreshold is not None:
            update_data["alert_threshold"] = asset_data.alertThreshold
        
        # Update the document
        await db.portfolio_assets.update_one(
            {"_id": ObjectId(portfolio_id)},
            {"$set": update_data}
        )
        
        # Fetch updated asset with item details
        updated_doc = await db.portfolio_assets.find_one({"_id": ObjectId(portfolio_id)})
        asset = await get_portfolio_asset_with_item(db, updated_doc)
        
        return {
            "asset": asset,
            "message": "Asset updated successfully"
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update asset: {str(e)}"
        )


@router.delete("/{portfolio_id}")
async def delete_portfolio_asset(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Remove an asset from the portfolio"""
    try:
        # Verify the asset exists and belongs to the user
        portfolio_doc = await db.portfolio_assets.find_one({
            "_id": ObjectId(portfolio_id),
            "user_id": current_user["id"]
        })
        
        if not portfolio_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio asset not found"
            )
        
        # Delete the asset
        await db.portfolio_assets.delete_one({"_id": ObjectId(portfolio_id)})
        
        return {"message": "Asset removed successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to remove asset: {str(e)}"
        )


@router.post("/{portfolio_id}/sell")
async def sell_portfolio_asset(
    portfolio_id: str,
    sale_data: PortfolioAssetSell,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Mark an asset as sold and record sale details"""
    try:
        # Verify the asset exists and belongs to the user
        portfolio_doc = await db.portfolio_assets.find_one({
            "_id": ObjectId(portfolio_id),
            "user_id": current_user["id"]
        })
        
        if not portfolio_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio asset not found"
            )
        
        if portfolio_doc.get("is_sold"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Asset is already sold"
            )
        
        # Parse sale date and convert to datetime for MongoDB
        sale_date = date.fromisoformat(sale_data.saleDate)
        sale_datetime = datetime.combine(sale_date, datetime.min.time())
        
        # Calculate realized gain and ROI
        purchase_price = portfolio_doc["purchase_price"]
        realized_gain = sale_data.salePrice - purchase_price
        realized_roi = (realized_gain / purchase_price) * 100 if purchase_price > 0 else 0
        
        # Update the asset as sold
        await db.portfolio_assets.update_one(
            {"_id": ObjectId(portfolio_id)},
            {
                "$set": {
                    "is_sold": True,
                    "sale_price": sale_data.salePrice,
                    "sale_date": sale_datetime,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "message": "Asset sold successfully",
            "realizedGain": round(realized_gain, 2),
            "realizedROI": round(realized_roi, 2)
        }
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sell asset: {str(e)}"
        )


@router.get("/analytics")
async def get_portfolio_analytics(
    timeframe: str = Query(default="1Y", regex="^(1D|1W|1M|YTD|1Y|5Y|10Y|ALL)$"),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get portfolio performance analytics with timeframe filtering"""
    try:
        # Fetch all portfolio assets for the user that are not sold
        cursor = db.portfolio_assets.find({
            "user_id": current_user["id"],
            "is_sold": False
        })
        
        portfolio_docs = await cursor.to_list(length=None)
        
        # Populate each asset with item details
        assets = []
        for portfolio_doc in portfolio_docs:
            asset = await get_portfolio_asset_with_item(db, portfolio_doc)
            if asset:
                assets.append(asset)
        
        # Calculate portfolio totals
        totals = calculate_portfolio_totals(assets)
        
        # Generate chart data based on portfolio trend
        # Use average trend percentage across all assets
        if assets:
            avg_trend = sum(asset.get("trendPercentage", 0) for asset in assets) / len(assets)
        else:
            avg_trend = 0
        
        chart_data = generate_chart_data(
            current_value=totals["totalValue"],
            trend_percentage=avg_trend,
            timeframe=timeframe
        )
        
        # Calculate timeframe-specific change
        timeframe_change, timeframe_percent = calculate_timeframe_change(chart_data)
        
        return {
            "totalValue": totals["totalValue"],
            "totalCost": totals["totalCost"],
            "totalGain": totals["totalGain"],
            "totalGainPercent": totals["totalGainPercent"],
            "timeframeChange": timeframe_change,
            "timeframePercent": timeframe_percent,
            "chartData": chart_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch portfolio analytics: {str(e)}"
        )


@router.get("/{portfolio_id}/analytics")
async def get_asset_analytics(
    portfolio_id: str,
    timeframe: str = Query(default="1Y", regex="^(1D|1W|1M|YTD|1Y|5Y|10Y|ALL)$"),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get individual asset performance analytics"""
    try:
        # Verify the asset exists and belongs to the user
        portfolio_doc = await db.portfolio_assets.find_one({
            "_id": ObjectId(portfolio_id),
            "user_id": current_user["id"]
        })
        
        if not portfolio_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Portfolio asset not found"
            )
        
        # Get the luxury item details
        item = await db.luxury_items.find_one({"_id": ObjectId(portfolio_doc["item_id"])})
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Luxury item not found"
            )
        
        # Calculate asset metrics
        metrics = calculate_asset_metrics(
            current_value=item["current_market_value"],
            purchase_price=portfolio_doc["purchase_price"],
            retail_price=item.get("retail_price")
        )
        
        # Generate chart data for this asset
        # Convert datetime to date if needed
        purchase_date = portfolio_doc["purchase_date"]
        if isinstance(purchase_date, datetime):
            purchase_date = purchase_date.date()
        
        chart_data = generate_chart_data(
            current_value=item["current_market_value"],
            trend_percentage=item["trend_percentage"],
            timeframe=timeframe,
            purchase_date=purchase_date
        )
        
        # Calculate timeframe-specific change
        timeframe_change, timeframe_percent = calculate_timeframe_change(chart_data)
        
        return {
            **metrics,
            "timeframeChange": timeframe_change,
            "timeframePercent": timeframe_percent,
            "chartData": chart_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch asset analytics: {str(e)}"
        )
