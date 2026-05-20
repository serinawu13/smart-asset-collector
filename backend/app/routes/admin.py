"""
Admin Routes
Endpoints for administrative tasks like seeding data and price refresh.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.config import settings
from app.database import get_database
from app.schemas.luxury_item import LuxuryItemCreate, LuxuryItemResponse
from app.routes.items import format_luxury_item
from app.utils.apify_scraper import (
    run_bag_refresh,
    scrape_hermes_vestiaire,
    normalize_vestiaire_listing,
    upsert_market_listings,
    refresh_catalog_from_listings,
)

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


@router.post("/bags/refresh", response_model=dict)
async def refresh_bag_prices():
    """
    Scrape Vestiaire Collective for Hermès, Chanel, and Prada handbags.

    - Updates `current_market_value` and `trend` for existing bag catalog items.
    - Creates new `LuxuryItem` records for newly discovered models (catalog discovery).

    Takes 30–120 seconds. Returns a summary of what changed.
    """
    try:
        db = get_database()
        result = await run_bag_refresh(db)
        return {"success": True, **result}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
    except Exception as e:
        logger.error(f"Bag refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bag refresh failed: {str(e)}",
        )


async def _run_hermes_scrape(job_id: str) -> None:
    """Background task: scrape Vestiaire for Hermès Birkin/Kelly, store listings, update catalog."""
    db = get_database()
    jobs_col = db["scrape_jobs"]

    try:
        token = settings.apify_token
        if not token:
            raise ValueError("APIFY_TOKEN is not configured in environment")

        # One-time cleanup of legacy TheRealReal listings (idempotent: deletes 0 on subsequent runs).
        cleanup = await db["market_listings"].delete_many({"source": "therealreal"})
        if cleanup.deleted_count:
            logger.info(f"Removed {cleanup.deleted_count} legacy therealreal market_listings")

        raw_listings = await scrape_hermes_vestiaire(token)

        normalized = [normalize_vestiaire_listing(r) for r in raw_listings]
        normalized = [n for n in normalized if n is not None]
        logger.info(f"Job {job_id}: normalized {len(normalized)}/{len(raw_listings)} listings")

        upsert_result = await upsert_market_listings(db, normalized)
        catalog_result = await refresh_catalog_from_listings(db)

        await jobs_col.update_one(
            {"job_id": job_id},
            {"$set": {
                "status": "completed",
                "result": {
                    "listings_scraped": len(raw_listings),
                    "listings_normalized": len(normalized),
                    "listings_inserted": upsert_result["inserted"],
                    "listings_updated": upsert_result["updated"],
                    "catalog_created": catalog_result["created"],
                    "catalog_updated": catalog_result["updated"],
                },
                "finished_at": datetime.now(timezone.utc),
            }},
        )
        logger.info(f"Hermès scrape job {job_id} completed successfully")

    except Exception as e:
        logger.error(f"Hermès scrape job {job_id} failed: {e}")
        await jobs_col.update_one(
            {"job_id": job_id},
            {"$set": {
                "status": "failed",
                "error": str(e),
                "finished_at": datetime.now(timezone.utc),
            }},
        )


@router.post("/hermes/refresh", response_model=dict)
async def start_hermes_refresh(background_tasks: BackgroundTasks):
    """
    Kick off a background Hermès Birkin/Kelly price refresh via Vestiaire Collective.

    Returns immediately with a job_id. Poll GET /admin/hermes/refresh/status/{job_id}
    for progress. Typical completion: 30–120 seconds.
    """
    db = get_database()
    job_id = str(uuid.uuid4())

    await db["scrape_jobs"].insert_one({
        "job_id": job_id,
        "status": "running",
        "result": None,
        "error": None,
        "started_at": datetime.now(timezone.utc),
        "finished_at": None,
    })

    background_tasks.add_task(_run_hermes_scrape, job_id)

    return {
        "job_id": job_id,
        "status": "started",
        "message": f"Scrape running in background. Poll /api/v1/admin/hermes/refresh/status/{job_id}",
    }


@router.get("/hermes/refresh/status/{job_id}", response_model=dict)
async def get_hermes_refresh_status(job_id: str):
    """Poll the status of a Hermès scrape job."""
    db = get_database()
    job = await db["scrape_jobs"].find_one({"job_id": job_id})

    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job {job_id} not found",
        )

    return {
        "job_id": job["job_id"],
        "status": job["status"],
        "result": job.get("result"),
        "error": job.get("error"),
        "started_at": job["started_at"].isoformat() if job.get("started_at") else None,
        "finished_at": job["finished_at"].isoformat() if job.get("finished_at") else None,
    }


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
