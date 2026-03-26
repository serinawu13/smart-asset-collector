# Testing Guide - Frontend-Backend Integration

## 🚀 Quick Start

### Prerequisites
- ✅ Backend is already running on `http://localhost:8000`
- ⚠️ Node.js and npm need to be installed for frontend

### Step 1: Start the Frontend Server

Open a new terminal and run:

```bash
cd frontend
npm install  # If you haven't already
npm run dev
```

The frontend should start on `http://localhost:3000`

---

## 🧪 Test Scenarios

### Test 1: User Signup (New Account)

1. **Open your browser** to `http://localhost:3000`
2. **Click the "Sign Up" tab** (right button)
3. **Fill in the form:**
   - Name: `John Doe`
   - Email: `john@example.com`
   - Password: `password123` (min 6 characters)
4. **Click "Create Account"**

**Expected Result:**
- ✅ Redirects to `/dashboard`
- ✅ Shows welcome message with your name
- ✅ Header shows "John Doe" in user badge
- ✅ Portfolio shows empty state (no assets yet)

**Check Browser Console:**
```
POST http://localhost:8000/api/v1/auth/signup → 201 Created
GET http://localhost:8000/api/v1/portfolio → 200 OK (empty array)
```

**Check localStorage:**
- Open DevTools → Application → Local Storage → `http://localhost:3000`
- Should see `auth_token` with a JWT value

---

### Test 2: User Login (Existing Account)

1. **Click "Exit" button** in the header to logout
2. **Should redirect to landing page**
3. **Click "Login" tab** (left button)
4. **Fill in the form:**
   - Email: `john@example.com`
   - Password: `password123`
5. **Click "Enter Vault"**

**Expected Result:**
- ✅ Redirects to `/dashboard`
- ✅ Shows your portfolio (empty if no assets added)
- ✅ Token stored in localStorage

**Check Browser Console:**
```
POST http://localhost:8000/api/v1/auth/login → 200 OK
GET http://localhost:8000/api/v1/portfolio → 200 OK
```

---

### Test 3: Add Sample Data to Portfolio

Since the AddAssetModal isn't integrated yet, let's add data directly via the backend:

**Option A: Use the Backend Seed Script**

```bash
# In a new terminal
cd backend
python3 -c "
from app.utils.seed_data import seed_luxury_items
import asyncio
asyncio.run(seed_luxury_items())
"
```

**Option B: Use the API Directly (via curl or Postman)**

First, get your token from localStorage (copy the value), then:

```bash
# Replace YOUR_TOKEN with the actual token from localStorage
TOKEN="YOUR_TOKEN_HERE"

# Add a luxury item to the catalog
curl -X POST http://localhost:8000/api/v1/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "category": "Watch",
    "brand": "Rolex",
    "model": "Submariner Date",
    "reference_number": "126610LN",
    "year": 2023,
    "condition": "New",
    "description": "Black dial, ceramic bezel",
    "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800",
    "market_value": 14500
  }'

# Get the item_id from the response, then add it to your portfolio
curl -X POST http://localhost:8000/api/v1/portfolio \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "item_id": "ITEM_ID_FROM_PREVIOUS_RESPONSE",
    "purchase_price": 10250,
    "purchase_date": "2023-01-15",
    "quantity": 1,
    "notes": "Purchased from authorized dealer"
  }'
```

**Option C: Use Python Script**

Create a file `test_add_asset.py`:

```python
import requests
import json

# Your token from localStorage
TOKEN = "YOUR_TOKEN_HERE"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

# 1. Create a luxury item
item_data = {
    "category": "Watch",
    "brand": "Rolex",
    "model": "Submariner Date",
    "reference_number": "126610LN",
    "year": 2023,
    "condition": "New",
    "market_value": 14500,
    "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800"
}

response = requests.post(
    "http://localhost:8000/api/v1/items",
    headers=headers,
    json=item_data
)
item = response.json()
print(f"Created item: {item['item_id']}")

# 2. Add to portfolio
portfolio_data = {
    "item_id": item['item_id'],
    "purchase_price": 10250,
    "purchase_date": "2023-01-15",
    "quantity": 1,
    "notes": "Test asset"
}

response = requests.post(
    "http://localhost:8000/api/v1/portfolio",
    headers=headers,
    json=portfolio_data
)
print(f"Added to portfolio: {response.json()}")
```

Run it:
```bash
python3 test_add_asset.py
```

---

### Test 4: View Portfolio with Data

1. **Refresh the dashboard** (`http://localhost:3000/dashboard`)
2. **Should now see:**
   - ✅ Portfolio Overview chart with total value
   - ✅ Asset List showing your items grouped by category
   - ✅ Gain/Loss calculations (green if positive, red if negative)
   - ✅ Current market value vs purchase price

**Check Browser Console:**
```
GET http://localhost:8000/api/v1/portfolio → 200 OK
Response includes:
- portfolio_id
- item_details (brand, model, etc.)
- purchase_price
- current_market_value
- gain_loss
- gain_loss_percentage
```

---

### Test 5: Logout

1. **Click the "Exit" button** in the header
2. **Should redirect to landing page** (`http://localhost:3000`)
3. **Check localStorage** - `auth_token` should be removed
4. **Try accessing dashboard directly** - `http://localhost:3000/dashboard`
   - Should redirect back to landing page (protected route)

---

## 🔍 Debugging Tips

### Check Backend Logs
The backend terminal should show all API requests:
```
INFO:     127.0.0.1:xxxxx - "POST /api/v1/auth/signup HTTP/1.1" 201 Created
INFO:     127.0.0.1:xxxxx - "GET /api/v1/portfolio HTTP/1.1" 200 OK
```

### Check Frontend Console
Open DevTools (F12) → Console tab:
- Should see API calls being made
- Any errors will appear here

### Check Network Tab
DevTools → Network tab:
- Filter by "Fetch/XHR"
- See all API requests and responses
- Check request headers (should include Authorization)
- Check response data

### Common Issues

**1. CORS Error**
```
Access to fetch at 'http://localhost:8000/api/v1/...' has been blocked by CORS policy
```
**Solution:** Backend CORS is configured for `http://localhost:3000`. Make sure frontend is running on port 3000.

**2. 401 Unauthorized**
```
{"detail": "Not authenticated"}
```
**Solution:** Token might be expired or invalid. Logout and login again.

**3. Connection Refused**
```
Failed to fetch
```
**Solution:** Make sure backend is running on port 8000.

**4. Empty Portfolio**
```
Portfolio shows "No Assets Yet"
```
**Solution:** This is correct for new users. Add assets using one of the methods in Test 3.

---

## 📊 What to Look For

### Successful Integration Indicators

✅ **Authentication Works:**
- Can signup with new account
- Can login with existing account
- Token stored in localStorage
- Protected routes redirect when not authenticated

✅ **Portfolio Data Loads:**
- API calls visible in Network tab
- Loading state shows briefly
- Data displays correctly
- Empty state shows when no assets

✅ **Real-time Calculations:**
- Total portfolio value calculated from backend
- Gain/Loss percentages shown
- Color-coded (green for gains, red for losses)

✅ **User Experience:**
- Smooth transitions between pages
- Error messages display when API fails
- Loading states prevent confusion
- Logout clears session properly

---

## 🎯 Quick Verification Checklist

- [ ] Frontend starts on `http://localhost:3000`
- [ ] Backend running on `http://localhost:8000`
- [ ] Can create new account (signup)
- [ ] Redirects to dashboard after signup
- [ ] Token appears in localStorage
- [ ] Portfolio components load (even if empty)
- [ ] Can logout successfully
- [ ] Can login with existing account
- [ ] Protected routes redirect when not authenticated
- [ ] API calls visible in Network tab
- [ ] No CORS errors in console

---

## 📞 Need Help?

If you encounter issues:

1. **Check both terminal outputs** (backend and frontend)
2. **Open browser DevTools** (F12) and check Console + Network tabs
3. **Verify MongoDB is running** (backend needs database connection)
4. **Check the `.env` file** in backend directory has correct settings
5. **Review [`INTEGRATION_PROGRESS.md`](INTEGRATION_PROGRESS.md)** for technical details

---

## 🎉 Success Criteria

You'll know the integration is working when:

1. ✅ You can signup/login without errors
2. ✅ Dashboard loads with your user name
3. ✅ Portfolio components fetch data from backend
4. ✅ Browser console shows successful API calls (200/201 status codes)
5. ✅ Logout works and clears the session
6. ✅ Protected routes redirect properly

**The integration is complete and ready for testing!**
