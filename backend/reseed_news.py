#!/usr/bin/env python3
"""Quick script to reseed market news with updated URLs"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.utils.seed_data import MARKET_NEWS

async def reseed():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.get_default_database()
    collection = db["market_news"]
    
    # Clear existing news
    result = await collection.delete_many({})
    print(f"Deleted {result.deleted_count} existing articles")
    
    # Insert new news with updated URLs
    result = await collection.insert_many(MARKET_NEWS)
    print(f"Inserted {len(result.inserted_ids)} new articles with updated URLs")
    
    client.close()
    print("✅ Market news reseeded successfully!")

if __name__ == "__main__":
    asyncio.run(reseed())
