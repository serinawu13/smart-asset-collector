# Price Alerts & Notifications Development Plan

## 1. Overview
This document outlines the architecture and implementation plan for adding price alerts and notifications to the platform. Users will be able to set target price alerts on assets (e.g., watchlists or portfolio items) and receive notifications via in-app alerts, email, or both when conditions are met.

## 2. Database Schema Updates

### 2.1 Update `WatchlistItem` Model (`backend/app/models/watchlist_item.py`)
Currently, `WatchlistItem` has basic alert fields (`target_price`, `alert_active`, `alert_type`, `alert_threshold`). We need to expand this to support comprehensive condition rules and notification preferences.

**Proposed Changes:**
```python
class NotificationPreferences(BaseModel):
    in_app: bool = True
    email: bool = False

class PriceAlertCondition(str, Enum):
    ABOVE = "above"
    BELOW = "below"
    PERCENTAGE_UP = "percentage_up"
    PERCENTAGE_DOWN = "percentage_down"

class WatchlistItem(BaseModel):
    # Existing fields...
    user_id: ObjectId
    item_id: ObjectId
    # Updated Alert Fields
    alert_active: bool = False
    alert_condition: PriceAlertCondition = PriceAlertCondition.ABOVE
    alert_target_price: Optional[float] = None  # Specific price
    alert_threshold_percent: Optional[float] = None # Percentage change
    notification_prefs: NotificationPreferences = Field(default_factory=NotificationPreferences)
    last_notified_at: Optional[datetime] = None # Prevent spamming
    # ...
```

### 2.2 New Model: `Notification` (`backend/app/models/notification.py`)
To support in-app notifications, we need a collection to store them.

```python
class NotificationType(str, Enum):
    PRICE_ALERT = "price_alert"
    SYSTEM = "system"

class Notification(BaseModel):
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: ObjectId
    type: NotificationType
    title: str
    message: str
    item_id: Optional[ObjectId] = None # Reference to the item
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
```

## 3. API Endpoints

### 3.1 Alerts Management (`backend/app/routes/watchlist.py` or new `alerts.py`)
- `PUT /api/watchlist/{id}/alert`: Update alert settings for a watchlist item.
  - Body: `{ alert_active: bool, alert_condition: str, alert_target_price: float, notification_prefs: { in_app: bool, email: bool } }`

### 3.2 In-App Notifications Management (`backend/app/routes/notifications.py`)
- `GET /api/notifications`: Retrieve user's notifications (paginated, sort by `created_at` desc).
- `GET /api/notifications/unread-count`: Get badge count.
- `PUT /api/notifications/{id}/read`: Mark a specific notification as read.
- `PUT /api/notifications/read-all`: Mark all as read.

## 4. Notification Architecture

### 4.1 Price Checking Mechanism
- **Background Job Scheduler:** Use `APScheduler` (or Celery if scaling is needed, but APScheduler is simpler for MVP FastAPI) to run a background task periodically (e.g., every 5-15 minutes, or whenever a bulk price update occurs).
- **Logic:**
  1. Fetch all active alerts (`alert_active=True`).
  2. For each alert, get the latest price of the `item_id`.
  3. Evaluate the `alert_condition` against `alert_target_price` / `alert_threshold_percent`.
  4. If condition met AND `last_notified_at` is older than a cooldown period (e.g., 24 hours):
     - Trigger Notification Dispatcher.
     - Update `last_notified_at` on the `WatchlistItem`.

### 4.2 Notification Dispatcher
When an alert is triggered, check `notification_prefs`:
- **If `in_app` is True:** Insert a new document into the `notifications` collection.
- **If `email` is True:** 
  - Retrieve the user's email from `UserModel`.
  - Dispatch an email using an asynchronous task (e.g., `BackgroundTasks` in FastAPI or Celery) via an SMTP service (SendGrid, AWS SES, or standard SMTP).
  - Provide a clear email template showing the item, target price, and current price.

## 5. Frontend UI/UX Components

### 5.1 Watchlist / Item Detail Updates
- **Alert Configuration Modal/Section:** 
  - Add UI elements in `ItemDetailModal.tsx` or a new `SetAlertDialog.tsx` to configure alerts.
  - **Inputs:**
    - Toggle: "Enable Price Alert"
    - Select: Condition ("Goes Above", "Drops Below")
    - Input: Target Price
  - **Notification Toggles:** 
    - Checkbox/Switch: "Notify via App"
    - Checkbox/Switch: "Notify via Email"

### 5.2 In-App Notification Center
- **Header Badge:** Add a bell icon to `Header.tsx` displaying the unread notification count.
- **Notification Dropdown/Popover:** Clicking the bell opens a popover showing recent notifications.
  - Unread items are highlighted.
  - Clicking a price alert notification routes the user to the `ItemDetailModal` for that asset.
  - "Mark all as read" button.

### 5.3 State Management
- Add a React Context or Zustand store for Notifications (`NotificationContext`) to poll `unread-count` periodically or listen via WebSocket (optional MVP scope: polling every X minutes is sufficient).
- Update watchlist state queries to reflect the new alert preferences fields.
