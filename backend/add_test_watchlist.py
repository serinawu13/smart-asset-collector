import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime
from app.config import settings

async def add_test_watchlist_item():
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.sac_db
    
    # Get the first user
    user = await db.users.find_one()
    if not user:
        print("❌ No users found. Please sign up first.")
        client.close()
        return
    
    print(f"✓ Found user: {user['name']} ({user['email']})")
    
    # Get the first luxury item (Rolex Submariner)
    item = await db.luxury_items.find_one({"brand": "Rolex"})
    if not item:
        print("❌ No luxury items found in database")
        client.close()
        return
    
    print(f"✓ Found item: {item['brand']} {item['model']}")
    
    # Check if already in watchlist
    existing = await db.watchlist_items.find_one({
        "user_id": user["_id"],
        "item_id": item["_id"]
    })
    
    if existing:
        print(f"⚠️  Item already in watchlist: {item['brand']} {item['model']}")
        client.close()
        return
    
    # Add to watchlist
    watchlist_item = {
        "user_id": user["_id"],
        "item_id": item["_id"],
        "target_price": 15000,
        "alert_active": True,
        "alert_type": "down",
        "alert_threshold": 5,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.watchlist_items.insert_one(watchlist_item)
    print(f"\n✅ Added to watchlist: {item['brand']} {item['model']}")
    print(f"   Watchlist ID: {result.inserted_id}")
    print(f"   Target Price: ${watchlist_item['target_price']:,}")
    print(f"   Alert: {watchlist_item['alert_type']} by {watchlist_item['alert_threshold']}%")
    print(f"\n🔄 Refresh your dashboard to see the item in your watchlist!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(add_test_watchlist_item())
