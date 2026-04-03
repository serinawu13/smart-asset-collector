# Deployment Steps to Fix Live URL

## Problem Identified
The deployed backend at `https://smart-asset-collector-backend.onrender.com` cannot connect to MongoDB Atlas, causing signup to fail with "Load Failed" error.

**Error:** `Database not connected. Check MongoDB Atlas network access settings and connection string.`

## Root Causes
1. Backend is missing the `MONGODB_URI` environment variable in Render
2. The `render.yaml` was configured for a Render database instead of MongoDB Atlas
3. Frontend needs the production API URL configured

---

## Solution: Configure Environment Variables in Render

### Step 1: Configure Backend Environment Variables

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Select your backend service: **`vault-backend`**
3. Click on **Environment** in the left sidebar
4. Add/Update these environment variables:

   | Key | Value |
   |-----|-------|
   | `MONGODB_URI` | `mongodb+srv://serinawu13_db_user:5au3VFLJTD8NEHiH@saccluster0.syxfdap.mongodb.net/sac_db?retryWrites=true&w=majority&appName=SACCluster0` |
   | `JWT_SECRET` | `your-super-secret-jwt-key-min-32-characters-long-change-in-production` |
   | `CORS_ORIGINS` | `https://smart-asset-collector.onrender.com,http://localhost:3000` |
   | `APP_ENV` | `production` |

4. Click **Save Changes**
5. The backend will automatically redeploy (takes 2-3 minutes)

### Step 2: Configure Frontend Environment Variables

1. In Render Dashboard, select your frontend service: **`smart-asset-collector`**
2. Click on **Environment** in the left sidebar
3. Add this environment variable:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://smart-asset-collector-backend.onrender.com/api/v1` |

4. Click **Save Changes**
5. The frontend will automatically redeploy (takes 2-3 minutes)

### Step 3: Configure MongoDB Atlas Network Access

**IMPORTANT:** MongoDB Atlas needs to allow connections from Render's servers.

1. Go to **MongoDB Atlas**: https://cloud.mongodb.com
2. Select your project: **SACCluster0**
3. Click **Network Access** in the left sidebar
4. Click **Add IP Address**
5. Select **"Allow Access from Anywhere"** (or add `0.0.0.0/0`)
   - This is necessary because Render uses dynamic IPs
6. Click **Confirm**

---

## Step 4: Verify Deployment

### Check Backend Health
```bash
curl https://smart-asset-collector-backend.onrender.com/healthz
```

**Expected Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-03-27T16:24:00.000000+00:00"
}
```

If you see `"database": "disconnected"`, the MongoDB connection is still failing.

### Test Signup Endpoint
```bash
curl -X POST https://smart-asset-collector-backend.onrender.com/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test123@example.com","password":"testpass123"}'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test123@example.com",
    "currency": "USD"
  },
  "token": "eyJhbGc..."
}
```

### Test Frontend
1. Open: https://smart-asset-collector.onrender.com
2. Click **Sign Up** tab
3. Enter:
   - Name: Your Name
   - Email: your@email.com
   - Password: password123
4. Click **Create Account**
5. Should successfully create account and redirect to dashboard

---

## Alternative: Deploy via Git Push

If you prefer to configure via code instead of the Render dashboard:

### 1. Update render.yaml (Already Done)
The `render.yaml` has been updated to use `MONGODB_URI` instead of `DATABASE_URL`.

### 2. Commit and Push
```bash
git add render.yaml
git commit -m "Fix MongoDB configuration for Render deployment"
git push origin main
```

### 3. Set Environment Variables in Render Dashboard
You still need to set the `MONGODB_URI` value in the Render dashboard because it contains sensitive credentials and shouldn't be in the code.

---

## Troubleshooting

### Issue: "Database not connected" after deployment

**Solution:**
1. Check MongoDB Atlas Network Access allows `0.0.0.0/0`
2. Verify `MONGODB_URI` is set correctly in Render (no typos)
3. Check Render logs for connection errors:
   - Go to backend service → **Logs** tab
   - Look for MongoDB connection errors

### Issue: CORS errors in browser console

**Solution:**
1. Verify `CORS_ORIGINS` includes your frontend URL
2. Make sure there are no trailing slashes
3. Check backend logs for CORS-related errors

### Issue: Frontend still shows "Load Failed"

**Solution:**
1. Check browser console (F12) for the actual error
2. Verify `NEXT_PUBLIC_API_URL` is set in frontend environment
3. Clear browser cache and hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
4. Check Network tab to see what URL the frontend is calling

### Issue: "Internal Server Error" on signup

**Solution:**
1. Check backend logs in Render dashboard
2. Verify all environment variables are set
3. Make sure MongoDB Atlas allows connections
4. Test the `/healthz` endpoint first

---

## Environment Variables Summary

### Backend (`vault-backend`)
```
MONGODB_URI=mongodb+srv://serinawu13_db_user:5au3VFLJTD8NEHiH@saccluster0.syxfdap.mongodb.net/sac_db?retryWrites=true&w=majority&appName=SACCluster0
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long-change-in-production
CORS_ORIGINS=https://smart-asset-collector.onrender.com,http://localhost:3000
APP_ENV=production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (`smart-asset-collector`)
```
NEXT_PUBLIC_API_URL=https://smart-asset-collector-backend.onrender.com/api/v1
```

---

## Expected Timeline

1. **Set environment variables**: 2 minutes
2. **Backend redeploy**: 2-3 minutes
3. **Frontend redeploy**: 2-3 minutes
4. **Total time**: ~7-8 minutes

---

## Success Checklist

- [ ] MongoDB Atlas Network Access allows `0.0.0.0/0`
- [ ] Backend `MONGODB_URI` environment variable set in Render
- [ ] Backend `JWT_SECRET` environment variable set in Render
- [ ] Backend `CORS_ORIGINS` environment variable set in Render
- [ ] Frontend `NEXT_PUBLIC_API_URL` environment variable set in Render
- [ ] Backend redeployed successfully
- [ ] Frontend redeployed successfully
- [ ] `/healthz` endpoint returns `"database": "connected"`
- [ ] Signup endpoint returns user object and token
- [ ] Frontend signup form works without "Load Failed" error

---

## Next Steps After Deployment

Once everything is working:

1. **Test the full flow:**
   - Sign up with a new account
   - Login with existing account
   - Navigate to dashboard
   - Logout and login again

2. **Monitor logs:**
   - Check Render logs for any errors
   - Monitor MongoDB Atlas for connection issues

3. **Security improvements:**
   - Change `JWT_SECRET` to a more secure random string
   - Consider using Render's secret management
   - Review MongoDB Atlas security settings

---

## Need Help?

If you're still seeing errors after following these steps:

1. Check the Render logs for your backend service
2. Check the browser console for frontend errors
3. Verify all environment variables are set correctly
4. Make sure MongoDB Atlas network access is configured
5. Test each endpoint individually using curl

The most common issue is MongoDB Atlas blocking connections - make sure network access is set to allow all IPs (`0.0.0.0/0`).
