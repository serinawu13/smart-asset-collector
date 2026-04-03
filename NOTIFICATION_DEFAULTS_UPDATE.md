# Notification Defaults Update

## Summary
Updated the application to have both **In-App** and **Email** notifications turned **ON by default** for all new and existing users.

## Changes Made

### Backend Changes

#### 1. **User Model** (`backend/app/models/user.py`)
- ✅ Already had correct defaults: `in_app: bool = True` and `email: bool = True` (lines 28-29)

#### 2. **Settings Route** (`backend/app/routes/settings.py`)
- Updated `NotificationPreferencesSchema` default for email from `False` to `True` (line 17)
- Updated fallback defaults in `get_settings()` from `{"in_app": True, "email": False}` to `{"in_app": True, "email": True}` (lines 40, 46)
- Updated fallback defaults in `update_settings()` from `{"in_app": True, "email": False}` to `{"in_app": True, "email": True}` (lines 96, 103)

#### 3. **Auth Route** (`backend/app/routes/auth.py`)
- Added `notification_prefs` field to user document creation in `signup()` function (lines 53-56)
- New users now get `{"in_app": True, "email": True}` by default

#### 4. **Price Alert Scheduler** (`backend/app/utils/price_alert_scheduler.py`)
- Updated fallback defaults in `_dispatch_notifications()` from `{"in_app": True, "email": False}` to `{"in_app": True, "email": True}` (line 182)
- Updated email notification check from `notification_prefs.get("email", False)` to `notification_prefs.get("email", True)` (line 194)

### Frontend Changes

#### 5. **Header Component** (`frontend/components/Header.tsx`)
- Updated fallback defaults in `handleNotificationToggle()` from `{ inApp: true, email: false }` to `{ inApp: true, email: true }` (line 47)

## Impact

### For New Users
- When signing up, users will automatically have both in-app and email notifications enabled
- They can disable either or both in the settings if they prefer

### For Existing Users
- Existing users without notification preferences set will now default to both enabled
- Users who have explicitly set their preferences will retain their choices
- The fallback defaults ensure consistent behavior across the application

### For Price Alerts
- Email notifications will now be sent by default when price alerts are triggered
- Users can still opt out via the settings menu in the header

## Testing Recommendations

1. **New User Signup**: Create a new account and verify both notification preferences are enabled
2. **Settings UI**: Check that the notification toggles in the header settings show both as enabled by default
3. **Price Alerts**: Set up a price alert and verify both in-app and email notifications are sent when triggered
4. **Existing Users**: Verify that users without preferences set get the new defaults
5. **User Preferences**: Ensure users can still toggle notifications on/off and their choices persist

## Files Modified

- `backend/app/routes/settings.py`
- `backend/app/routes/auth.py`
- `backend/app/utils/price_alert_scheduler.py`
- `frontend/components/Header.tsx`
