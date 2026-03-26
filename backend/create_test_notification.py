"""
Script to create a test notification for testing the notification center UI.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from datetime import datetime
from bson import ObjectId
from app.database import connect_to_mongodb, close_mongodb_connection, get_database


async def create_test_notification():
    """Create a test notification for the first user in the database."""
    
    # Initialize database connection
    await connect_to_mongodb()
    
    try:
        db = get_database()
        
        # Get the first user from the database
        user = await db.users.find_one()
        
        if not user:
            print("❌ No users found in database. Please create a user first.")
            return
        
        user_id = user["_id"]
        print(f"✓ Found user: {user.get('email', 'Unknown')}")
        
        # Get a random luxury item for the notification (optional)
        item = await db.luxury_items.find_one()
        item_id = item["_id"] if item else None
        item_name = item.get("name", "Luxury Item") if item else "Luxury Item"
        
        # Create test notification
        test_notification = {
            "user_id": user_id,
            "type": "price_alert",
            "title": f"🔔 Price Alert: {item_name}",
            "message": f"The price of {item_name} has increased by 15% in the last 24 hours. Current value: $125,000",
            "item_id": item_id,
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        
        # Insert notification
        result = await db.notifications.insert_one(test_notification)
        
        print(f"✓ Test notification created successfully!")
        print(f"  Notification ID: {result.inserted_id}")
        print(f"  Title: {test_notification['title']}")
        print(f"  Message: {test_notification['message']}")
        print(f"\n🎉 Check your notification center in the UI!")
        
    except Exception as e:
        print(f"❌ Error creating test notification: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Close database connection
        await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(create_test_notification())
