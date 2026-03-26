# Price Alerts & Notifications - Implementation Status (Updated Architecture)

## Overview
This document tracks the implementation progress of the price alerts and notifications feature with **global notification preferences** managed in user settings.

## Architecture Decision: Global Notification Preferences

**Key Change:** Notification delivery preferences (in-app, email) are now configured **once in user settings** and apply to **all price alerts**, rather than being set per-item. This provides a better user experience and simpler management.

### Benefits:
- ✅ Simpler UX - set preferences once, not for every alert
- ✅ Consistent notification behavior across all alerts
- ✅ Easier to manage and update preferences
- ✅ Reduces cognitive load for users

## ✅ Completed Components

### Backend Implementation (100% Complete)

#### 1. Database Models
- ✅ **Updated [`UserModel`](backend/app/models/user.py:26)** with:
  - `NotificationPreferences` class with `in_app` and `email` fields
  - `notification_prefs` field on user model (defaults: in_app=True, email=False)

- ✅ **Updated [`WatchlistItem`](backend/app/models/watchlist_item.py:1)** model with:
  - `PriceAlertCondition` enum (above, below, percentage_up, percentage_down)
  - Alert fields: `alert_condition`, `alert_target_price`, `alert_threshold_percent`
  - `last_notified_at` timestamp for cooldown management
  - Removed per-item notification preferences (now global)

- ✅ **Created [`Notification`](backend/app/models/notification.py:1)** model for in-app notifications

#### 2. API Endpoints

**Settings Endpoints** ([`backend/app/routes/settings.py`](backend/app/routes/settings.py:1)):
- ✅ `GET /api/v1/settings` - Returns currency AND notificationPrefs
- ✅ `PUT /api/v1/settings` - Updates currency and/or notificationPrefs

**Watchlist Alert Endpoints** ([`backend/app/routes/watchlist.py`](backend/app/routes/watchlist.py:305)):
- ✅ `PUT /api/v1/watchlist/{id}/alert` - Configure alert condition and target price
  - Note: No longer accepts notification preferences (managed globally)

**Notifications Endpoints** ([`backend/app/routes/notifications.py`](backend/app/routes/notifications.py:1)):
- ✅ `GET /api/v1/notifications` - Get paginated notifications
- ✅ `GET /api/v1/notifications/unread-count` - Get unread count for badge
- ✅ `PUT /api/v1/notifications/{id}/read` - Mark single notification as read
- ✅ `PUT /api/v1/notifications/read-all` - Mark all notifications as read

#### 3. Background Services
- ✅ **Email Service** ([`backend/app/utils/email_service.py`](backend/app/utils/email_service.py:1))
  - Professional HTML email templates
  - Graceful fallback when SMTP not configured

- ✅ **Price Alert Scheduler** ([`backend/app/utils/price_alert_scheduler.py`](backend/app/utils/price_alert_scheduler.py:165))
  - **Updated to use global user notification preferences**
  - Fetches preferences from user model, not watchlist item
  - 24-hour cooldown period
  - Supports both new and legacy alert systems

### Frontend Implementation (85% Complete)

#### 1. Type Definitions
- ✅ **Updated [`frontend/lib/types.ts`](frontend/lib/types.ts:89)** with all notification types

#### 2. API Client
- ✅ **Updated [`frontend/lib/api.ts`](frontend/lib/api.ts:1)** with:
  - Updated `getSettings()` - now returns notificationPrefs
  - Updated `updateSettings()` - now accepts notificationPrefs
  - `updatePriceAlert()` - configure alert (no notification prefs)
  - `getNotifications()`, `getUnreadNotificationCount()`, `markNotificationRead()`, `markAllNotificationsRead()`

## 🚧 Remaining Work

### 1. Settings Page - Notification Preferences UI
**Location:** Settings page/modal (needs to be created or updated)

**Required UI Elements:**
```tsx
<div className="space-y-4">
  <h3 className="font-semibold">Notification Preferences</h3>
  <p className="text-sm text-muted-foreground">
    Choose how you want to receive price alert notifications
  </p>
  
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <Label>In-App Notifications</Label>
        <p className="text-sm text-muted-foreground">
          Show notifications in the app
        </p>
      </div>
      <Switch 
        checked={notifyInApp} 
        onCheckedChange={setNotifyInApp} 
      />
    </div>
    
    <div className="flex items-center justify-between">
      <div>
        <Label>Email Notifications</Label>
        <p className="text-sm text-muted-foreground">
          Send notifications to {user.email}
        </p>
      </div>
      <Switch 
        checked={notifyEmail} 
        onCheckedChange={setNotifyEmail} 
      />
    </div>
  </div>
  
  <Button onClick={saveNotificationPreferences}>
    Save Preferences
  </Button>
</div>
```

**Implementation Steps:**
1. Create or update Settings page component
2. Fetch current settings with `api.getSettings()`
3. Display notification preference toggles
4. Save changes with `api.updateSettings({ notificationPrefs: { inApp, email } })`
5. Show success/error feedback

### 2. ItemDetailModal - Price Alert Configuration
**File:** [`frontend/components/ItemDetailModal.tsx`](frontend/components/ItemDetailModal.tsx:1)

**Required UI Elements:**
```tsx
<div className="space-y-4">
  <h3 className="font-semibold">Price Alert</h3>
  
  <div className="flex items-center justify-between">
    <Label>Enable Price Alert</Label>
    <Switch checked={alertActive} onCheckedChange={setAlertActive} />
  </div>
  
  {alertActive && (
    <>
      <div>
        <Label>Alert Condition</Label>
        <Select value={alertCondition} onValueChange={setAlertCondition}>
          <SelectItem value="above">Notify when price goes above</SelectItem>
          <SelectItem value="below">Notify when price drops below</SelectItem>
        </Select>
      </div>
      
      <div>
        <Label>Target Price ({currency})</Label>
        <Input 
          type="number" 
          value={targetPrice} 
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="Enter target price"
        />
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Notification preferences are managed in Settings. 
          Currently: {notifyInApp ? '✓ App' : ''} {notifyEmail ? '✓ Email' : ''}
        </AlertDescription>
      </Alert>
      
      <Button onClick={saveAlert}>Save Alert</Button>
    </>
  )}
</div>
```

**Implementation Steps:**
1. Add state for alert configuration
2. Load existing alert settings when modal opens
3. Call `api.updatePriceAlert(watchlistId, { alertActive, alertCondition, alertTargetPrice })`
4. Show link/hint about notification preferences in Settings

### 3. NotificationCenter Component
**File:** `frontend/components/NotificationCenter.tsx` (To Be Created)

**Features:**
- Bell icon in header with unread count badge
- Dropdown/popover showing recent notifications
- Click notification to view related item
- Mark as read functionality
- Auto-refresh unread count every 60 seconds

**Implementation Example:**
```tsx
export function NotificationCenter() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch unread count periodically
  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await api.getUnreadNotificationCount();
      setUnreadCount(count);
    };
    
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Fetch notifications when opened
  const fetchNotifications = async () => {
    const data = await api.getNotifications(1, 10);
    setNotifications(data.notifications);
  };
  
  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    fetchNotifications();
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Notifications</h4>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No notifications
              </p>
            ) : (
              notifications.map((notif) => (
                <NotificationItem 
                  key={notif.id} 
                  notification={notif}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))
            )}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

### 4. Header Integration
**File:** [`frontend/components/Header.tsx`](frontend/components/Header.tsx:1)

**Required:**
- Import and add `<NotificationCenter />` component
- Position near user profile/settings button

### 5. Backend Scheduler Integration
**File:** [`backend/app/main.py`](backend/app/main.py:1)

**Required:**
```bash
# Install APScheduler
pip install apscheduler
# Add to requirements.txt
```

**Code to Add:**
```python
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.utils.price_alert_scheduler import price_alert_checker

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Smart Asset Collector Backend...")
    await connect_to_mongodb()
    
    # Start price alert checker (every 15 minutes)
    scheduler.add_job(
        price_alert_checker.check_all_alerts,
        'interval',
        minutes=15,
        id='price_alert_checker'
    )
    scheduler.start()
    logger.info("Price alert scheduler started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Smart Asset Collector Backend...")
    scheduler.shutdown()
    await close_mongodb_connection()
```

### 6. Email Configuration (Optional)
**File:** `backend/.env`

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@smartassetcollector.com
```

## 📋 Implementation Checklist

### Phase 1: Settings UI (High Priority)
- [ ] Create/update Settings page with notification preferences section
- [ ] Add switches for in-app and email notifications
- [ ] Wire up to `api.getSettings()` and `api.updateSettings()`
- [ ] Test saving and loading preferences

### Phase 2: Alert Configuration UI
- [ ] Update ItemDetailModal with price alert section
- [ ] Add alert condition selector and target price input
- [ ] Show current notification preferences (read-only, link to Settings)
- [ ] Wire up to `api.updatePriceAlert()`
- [ ] Test creating and updating alerts

### Phase 3: Notification Center
- [ ] Create NotificationCenter component
- [ ] Add bell icon with badge to Header
- [ ] Implement notification list with mark as read
- [ ] Add auto-refresh for unread count
- [ ] Test notification display and interactions

### Phase 4: Backend Scheduler
- [ ] Install APScheduler
- [ ] Integrate scheduler in main.py
- [ ] Configure check interval (15 minutes recommended)
- [ ] Test alert checking and notification creation

### Phase 5: Email Setup (Optional)
- [ ] Configure SMTP settings
- [ ] Test email delivery
- [ ] Handle email failures gracefully

## 🎯 User Flow

### Setting Up Notifications (One Time)
1. User clicks Settings button
2. User sees "Notification Preferences" section
3. User toggles "In-App Notifications" and/or "Email Notifications"
4. User clicks "Save Preferences"
5. Preferences apply to ALL price alerts

### Creating a Price Alert
1. User clicks on watchlist item
2. ItemDetailModal opens
3. User toggles "Enable Price Alert"
4. User selects condition ("Goes Above" or "Drops Below")
5. User enters target price
6. User sees note: "Notifications will be sent via: App, Email" (based on settings)
7. User clicks "Save Alert"

### Receiving Notifications
1. Background scheduler checks alerts every 15 minutes
2. When condition met:
   - If user has in-app enabled: Notification appears in bell icon
   - If user has email enabled: Email sent to user's address
3. User clicks bell icon to see notifications
4. User clicks notification to view item details
5. User can mark as read or mark all as read

## 🔧 Technical Notes

### Database Indexes
```javascript
// Recommended indexes
db.users.createIndex({ "email": 1 });
db.watchlist_items.createIndex({ "user_id": 1, "alert_active": 1 });
db.notifications.createIndex({ "user_id": 1, "is_read": 1, "created_at": -1 });
```

### Migration Notes
- Existing users will default to: `{ in_app: true, email: false }`
- Existing watchlist items with per-item notification_prefs will be ignored
- System will use global user preferences instead

### API Changes Summary
- `GET /api/v1/settings` - Now returns `notificationPrefs`
- `PUT /api/v1/settings` - Now accepts `notificationPrefs`
- `PUT /api/v1/watchlist/{id}/alert` - No longer accepts `notificationPrefs`

## 📚 Related Documentation
- [PRICE_ALERTS_PLAN.md](PRICE_ALERTS_PLAN.md) - Original architecture plan
- [Backend API Documentation](http://localhost:8000/docs) - Interactive API docs

## ✅ Success Criteria
- [x] Users can set global notification preferences in Settings
- [x] Users can create price alerts on watchlist items
- [x] System checks alerts periodically
- [x] System uses user's global preferences for notification delivery
- [ ] Users can view notification preferences in Settings UI
- [ ] Users can configure alerts in ItemDetailModal UI
- [ ] Users can view notifications in NotificationCenter
- [ ] Email notifications work when configured
- [ ] All features work without errors

---

**Last Updated:** 2026-03-26
**Status:** Backend Complete (100%), Frontend In Progress (85%)
**Architecture:** Global notification preferences in user settings
**Next Milestone:** Complete Settings UI and ItemDetailModal updates
