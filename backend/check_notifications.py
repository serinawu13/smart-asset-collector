"""
Script to check notifications in the database and see the unread count per user.
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from datetime import datetime
from bson import ObjectId
from app.database import connect_to_mongodb, close_mongodb_connection, get_database


async def check_notifications():
    """Check all notifications in the database."""
    
    # Initialize database connection
    await connect_to_mongodb()
    
    try:
        db = get_database()
        
        # Get all users
        users = await db.users.find().to_list(length=100)
        
        print("=" * 80)
        print("NOTIFICATION STATUS BY USER")
        print("=" * 80)
        
        for user in users:
            user_id = user["_id"]
            user_email = user.get('email', 'Unknown')
            
            # Count total notifications for this user
            total_count = await db.notifications.count_documents({"user_id": user_id})
            
            # Count unread notifications for this user
            unread_count = await db.notifications.count_documents({
                "user_id": user_id,
                "is_read": False
            })
            
            # Get the most recent notification
            recent_notif = await db.notifications.find_one(
                {"user_id": user_id},
                sort=[("created_at", -1)]
            )
            
            print(f"\n📧 User: {user_email}")
            print(f"   User ID: {user_id}")
            print(f"   Total notifications: {total_count}")
            print(f"   Unread notifications: {unread_count}")
            
            if recent_notif:
                print(f"   Most recent: {recent_notif.get('title', 'N/A')}")
                print(f"   Created: {recent_notif.get('created_at', 'N/A')}")
                print(f"   Is Read: {recent_notif.get('is_read', False)}")
        
        print("\n" + "=" * 80)
        
    except Exception as e:
        print(f"❌ Error checking notifications: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Close database connection
        await close_mongodb_connection()


if __name__ == "__main__":
    asyncio.run(check_notifications())
