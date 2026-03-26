"""
Notifications Routes

Handles in-app notification endpoints:
- GET /api/v1/notifications - Get user's notifications (paginated)
- GET /api/v1/notifications/unread-count - Get unread notification count
- PUT /api/v1/notifications/{notification_id}/read - Mark notification as read
- PUT /api/v1/notifications/read-all - Mark all notifications as read
"""

from datetime import datetime
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId

from app.database import get_database
from app.utils.auth import get_current_user
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    UnreadCountResponse,
    MarkReadRequest
)

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.get("", response_model=NotificationListResponse)
async def get_notifications(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    current_user: Dict = Depends(get_current_user)
) -> NotificationListResponse:
    """
    Get paginated notifications for the authenticated user.
    
    - Fetches notifications sorted by creation date (newest first)
    - Supports pagination
    - Returns notification list with pagination metadata
    """
    db = get_database()
    
    # Calculate skip value for pagination
    skip = (page - 1) * page_size
    
    # Get total count
    total = await db.notifications.count_documents({"user_id": ObjectId(current_user["id"])})
    
    # Fetch notifications
    cursor = db.notifications.find(
        {"user_id": ObjectId(current_user["id"])}
    ).sort("created_at", -1).skip(skip).limit(page_size)
    
    notifications = await cursor.to_list(length=page_size)
    
    # Format response
    notification_list = []
    for notif in notifications:
        notification_list.append(NotificationResponse(
            id=str(notif["_id"]),
            userId=str(notif["user_id"]),
            type=notif["type"],
            title=notif["title"],
            message=notif["message"],
            itemId=str(notif["item_id"]) if notif.get("item_id") else None,
            isRead=notif["is_read"],
            createdAt=notif["created_at"]
        ))
    
    has_more = (skip + page_size) < total
    
    return NotificationListResponse(
        notifications=notification_list,
        total=total,
        page=page,
        pageSize=page_size,
        hasMore=has_more
    )


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: Dict = Depends(get_current_user)
) -> UnreadCountResponse:
    """
    Get the count of unread notifications for the authenticated user.
    
    - Returns the number of unread notifications
    - Used for badge display in UI
    """
    db = get_database()
    
    count = await db.notifications.count_documents({
        "user_id": ObjectId(current_user["id"]),
        "is_read": False
    })
    
    return UnreadCountResponse(count=count)


@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Mark a specific notification as read.
    
    - Validates notification exists and belongs to user
    - Updates is_read status to True
    - Returns success message
    """
    db = get_database()
    
    # Validate notification_id
    try:
        notif_id = ObjectId(notification_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID format"
        )
    
    # Check if notification exists and belongs to user
    notification = await db.notifications.find_one({
        "_id": notif_id,
        "user_id": ObjectId(current_user["id"])
    })
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Update notification
    await db.notifications.update_one(
        {"_id": notif_id},
        {"$set": {"is_read": True}}
    )
    
    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_notifications_read(
    current_user: Dict = Depends(get_current_user)
) -> Dict:
    """
    Mark all notifications as read for the authenticated user.
    
    - Updates all unread notifications to read status
    - Returns count of updated notifications
    """
    db = get_database()
    
    # Update all unread notifications for the user
    result = await db.notifications.update_many(
        {
            "user_id": ObjectId(current_user["id"]),
            "is_read": False
        },
        {"$set": {"is_read": True}}
    )
    
    return {
        "message": "All notifications marked as read",
        "count": result.modified_count
    }
