"""
Script to create a test notification for ALL users in the database.
This ensures the currently logged-in user will see it.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from datetime import datetime
from bson import ObjectId
from app.database import connect_to_mongodb, close_mongodb_connection, get_database


async def create_test_notifications():
    """Create a test notification for all users in the database."""
    
    # Initialize database connection
    await connect_to_mongodb()
    
    try:
        db = get_database()
        
        # Get all users from the database
        users = await db.users.find().to_list(length=100)
        
        if not users:
            print("❌ No users found in database. Please create a user first.")
            return
        
        print(f"✓ Found {len(users)} user(s)")
        
        # Get a random luxury item for the notification (optional)
        item = await db.luxury_items.find_one()
        item_id = item["_id"] if item else None
        item_name = item.get("name", "Rolex Submariner") if item else "Rolex Submariner"
        
        # Create test notification for each user
        notifications_created = 0
        for user in users:
            user_id = user["_id"]
            user_email = user.get('email', 'Unknown')
            
            # Create test notification
            test_notification = {
                "user_id": user_id,
                "type": "price_alert",
                "title": f"🔔 Price Alert: {item_name}",
                "message": f"Great news! The price of {item_name} has increased by 15% in the last 24 hours. Current estimated value: $125,000. This is a significant market movement.",
                "item_id": item_id,
                "is_read": False,
                "created_at": datetime.utcnow()
            }
            
            # Insert notification
            result = await db.notifications.insert_one(test_notification)
            notifications_created += 1
            
            print(f"✓ Created notification for user: {user_email}")
            print(f"  Notification ID: {result.inserted_id}")
        
        print(f"\n🎉 Successfully created {notifications_created} test notification(s)!")
        print(f"📱 Refresh your browser or wait up to 1 minute to see the notification in the UI")
        
    except Exception as e:
        print(f"❌ Error creating test notification: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Close database connection
        await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(create_test_notifications())
