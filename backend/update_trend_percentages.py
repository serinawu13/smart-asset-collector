"""
Update existing luxury items with trend_percentage values
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def update_trend_percentages():
    """
    Update existing luxury items with trend_percentage values
    """
    try:
        # Connect to MongoDB
        logger.info("Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(settings.mongodb_uri)
        db = client.get_default_database()
        collection = db["luxury_items"]
        
        # Update each item with trend_percentage
        updates = [
            {"brand": "Rolex", "model": "Submariner Date 126610LN", "trend_percentage": 2.4},
            {"brand": "Patek Philippe", "model": "Nautilus 5711/1A", "trend_percentage": 0.0},
            {"brand": "Audemars Piguet", "model": "Royal Oak 15500ST", "trend_percentage": 1.8},
            {"brand": "Hermès", "model": "Birkin 30", "trend_percentage": 3.2},
            {"brand": "Hermès", "model": "Kelly 28", "trend_percentage": 2.1},
            {"brand": "Chanel", "model": "Classic Flap Medium", "trend_percentage": 0.5},
            {"brand": "Cartier", "model": "Love Bracelet", "trend_percentage": 1.5},
            {"brand": "Van Cleef & Arpels", "model": "Alhambra Necklace", "trend_percentage": 0.3},
        ]
        
        updated_count = 0
        for update in updates:
            result = await collection.update_one(
                {"brand": update["brand"], "model": update["model"]},
                {"$set": {"trend_percentage": update["trend_percentage"]}}
            )
            if result.matched_count > 0:
                updated_count += 1
                logger.info(f"✓ Updated {update['brand']} {update['model']}: {update['trend_percentage']}%")
            else:
                logger.warning(f"✗ Not found: {update['brand']} {update['model']}")
        
        logger.info(f"\n✅ Updated {updated_count} items with trend_percentage values")
        
        # Close connection
        client.close()
        
    except Exception as e:
        logger.error(f"Error updating database: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(update_trend_percentages())
