"""
Price Alert Scheduler

Background job scheduler that periodically checks active price alerts
and triggers notifications when conditions are met.
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List
from bson import ObjectId

from app.database import get_database
from app.utils.email_service import email_service
from app.models.watchlist_item import PriceAlertCondition

logger = logging.getLogger(__name__)


class PriceAlertChecker:
    """Service for checking price alerts and dispatching notifications"""
    
    def __init__(self):
        """Initialize the price alert checker"""
        self.cooldown_hours = 24  # Prevent spam by only notifying once per 24 hours
    
    async def check_all_alerts(self) -> Dict[str, int]:
        """
        Check all active price alerts and trigger notifications.
        
        Returns:
            Dict with counts of checked, triggered, and failed alerts
        """
        db = get_database()
        
        stats = {
            "checked": 0,
            "triggered": 0,
            "failed": 0
        }
        
        try:
            # Fetch all active alerts
            cursor = db.watchlist_items.find({"alert_active": True})
            watchlist_items = await cursor.to_list(length=None)
            
            logger.info(f"Checking {len(watchlist_items)} active price alerts...")
            
            for watchlist_item in watchlist_items:
                stats["checked"] += 1
                
                try:
                    # Check if alert should be triggered
                    should_trigger = await self._should_trigger_alert(watchlist_item)
                    
                    if should_trigger:
                        # Dispatch notifications
                        success = await self._dispatch_notifications(watchlist_item)
                        
                        if success:
                            stats["triggered"] += 1
                            # Update last_notified_at to prevent spam
                            await db.watchlist_items.update_one(
                                {"_id": watchlist_item["_id"]},
                                {"$set": {"last_notified_at": datetime.utcnow()}}
                            )
                        else:
                            stats["failed"] += 1
                            
                except Exception as e:
                    logger.error(f"Error checking alert for watchlist item {watchlist_item['_id']}: {e}")
                    stats["failed"] += 1
            
            logger.info(f"Alert check complete. Checked: {stats['checked']}, Triggered: {stats['triggered']}, Failed: {stats['failed']}")
            
        except Exception as e:
            logger.error(f"Error in check_all_alerts: {e}")
        
        return stats
    
    async def _should_trigger_alert(self, watchlist_item: Dict) -> bool:
        """
        Determine if an alert should be triggered based on conditions.
        
        Args:
            watchlist_item: Watchlist item document from database
            
        Returns:
            bool: True if alert should be triggered
        """
        db = get_database()
        
        # Check cooldown period
        last_notified = watchlist_item.get("last_notified_at")
        if last_notified:
            cooldown_threshold = datetime.utcnow() - timedelta(hours=self.cooldown_hours)
            if last_notified > cooldown_threshold:
                logger.debug(f"Alert {watchlist_item['_id']} in cooldown period")
                return False
        
        # Get current item price
        item = await db.luxury_items.find_one({"_id": watchlist_item["item_id"]})
        if not item:
            logger.warning(f"Item {watchlist_item['item_id']} not found for watchlist {watchlist_item['_id']}")
            return False
        
        current_price = item.get("current_market_value")
        if current_price is None:
            logger.warning(f"No current price for item {item['_id']}")
            return False
        
        # Check alert condition
        alert_condition = watchlist_item.get("alert_condition")
        alert_target_price = watchlist_item.get("alert_target_price")
        alert_threshold_percent = watchlist_item.get("alert_threshold_percent")
        
        # If using new alert system
        if alert_condition:
            if alert_condition == PriceAlertCondition.ABOVE.value:
                if alert_target_price and current_price >= alert_target_price:
                    logger.info(f"Alert triggered: Price {current_price} >= target {alert_target_price}")
                    return True
                    
            elif alert_condition == PriceAlertCondition.BELOW.value:
                if alert_target_price and current_price <= alert_target_price:
                    logger.info(f"Alert triggered: Price {current_price} <= target {alert_target_price}")
                    return True
                    
            elif alert_condition == PriceAlertCondition.PERCENTAGE_UP.value:
                if alert_threshold_percent:
                    # Would need historical price to calculate percentage change
                    # For now, skip percentage-based alerts
                    pass
                    
            elif alert_condition == PriceAlertCondition.PERCENTAGE_DOWN.value:
                if alert_threshold_percent:
                    # Would need historical price to calculate percentage change
                    # For now, skip percentage-based alerts
                    pass
        
        # Fallback to legacy alert system
        else:
            target_price = watchlist_item.get("target_price")
            alert_type = watchlist_item.get("alert_type", "none")
            
            if target_price and alert_type != "none":
                if alert_type == "up" and current_price >= target_price:
                    return True
                elif alert_type == "down" and current_price <= target_price:
                    return True
                elif alert_type == "both":
                    # Trigger if price moves significantly from target
                    threshold = watchlist_item.get("alert_threshold", 5.0)
                    percent_diff = abs((current_price - target_price) / target_price * 100)
                    if percent_diff >= threshold:
                        return True
        
        return False
    
    async def _dispatch_notifications(self, watchlist_item: Dict) -> bool:
        """
        Dispatch notifications based on user's global notification preferences.
        
        Args:
            watchlist_item: Watchlist item document from database
            
        Returns:
            bool: True if at least one notification was sent successfully
        """
        db = get_database()
        
        try:
            # Get user and item details
            user = await db.users.find_one({"_id": watchlist_item["user_id"]})
            item = await db.luxury_items.find_one({"_id": watchlist_item["item_id"]})
            
            if not user or not item:
                logger.error(f"User or item not found for watchlist {watchlist_item['_id']}")
                return False
            
            # Get notification preferences from user settings (global preferences)
            notification_prefs = user.get("notification_prefs", {"in_app": True, "email": False})
            
            success = False
            
            # Send in-app notification
            if notification_prefs.get("in_app", True):
                in_app_success = await self._create_in_app_notification(
                    user, item, watchlist_item
                )
                success = success or in_app_success
            
            # Send email notification
            if notification_prefs.get("email", False):
                email_success = await self._send_email_notification(
                    user, item, watchlist_item
                )
                success = success or email_success
            
            return success
            
        except Exception as e:
            logger.error(f"Error dispatching notifications for watchlist {watchlist_item['_id']}: {e}")
            return False
    
    async def _create_in_app_notification(
        self,
        user: Dict,
        item: Dict,
        watchlist_item: Dict
    ) -> bool:
        """Create an in-app notification"""
        db = get_database()
        
        try:
            current_price = item.get("current_market_value")
            alert_condition = watchlist_item.get("alert_condition", "above")
            target_price = watchlist_item.get("alert_target_price") or watchlist_item.get("target_price")
            
            # Format message
            currency = user.get("currency", "USD")
            current_str = f"{currency} {current_price:,.2f}"
            target_str = f"{currency} {target_price:,.2f}" if target_price else "your target"
            
            condition_text = {
                "above": f"has gone above {target_str}",
                "below": f"has dropped below {target_str}",
                "percentage_up": "has increased significantly",
                "percentage_down": "has decreased significantly"
            }.get(alert_condition, "has met your alert condition")
            
            title = f"Price Alert: {item['brand']} {item['model']}"
            message = f"The price {condition_text}. Current price: {current_str}"
            
            # Create notification document
            notification = {
                "user_id": user["_id"],
                "type": "price_alert",
                "title": title,
                "message": message,
                "item_id": item["_id"],
                "is_read": False,
                "created_at": datetime.utcnow()
            }
            
            await db.notifications.insert_one(notification)
            logger.info(f"Created in-app notification for user {user['_id']}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating in-app notification: {e}")
            return False
    
    async def _send_email_notification(
        self,
        user: Dict,
        item: Dict,
        watchlist_item: Dict
    ) -> bool:
        """Send an email notification"""
        try:
            current_price = item.get("current_market_value")
            alert_condition = watchlist_item.get("alert_condition", "above")
            target_price = watchlist_item.get("alert_target_price") or watchlist_item.get("target_price")
            currency = user.get("currency", "USD")
            
            success = await email_service.send_price_alert_email(
                to_email=user["email"],
                user_name=user["name"],
                item_brand=item["brand"],
                item_model=item["model"],
                alert_condition=alert_condition,
                target_price=target_price,
                current_price=current_price,
                currency=currency
            )
            
            if success:
                logger.info(f"Sent email notification to {user['email']}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending email notification: {e}")
            return False


# Global price alert checker instance
price_alert_checker = PriceAlertChecker()
