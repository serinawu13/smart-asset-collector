# Fix: Custom Domain CORS Error

## Problem
Your custom domains `smartassetcollector.com` and `www.smartassetcollector.com` are showing "Load Failed" errors when trying to login, while the Render subdomain `https://smart-asset-collector.onrender.com` works fine.

## Root Cause
The backend's CORS (Cross-Origin Resource Sharing) configuration only allowed requests from:
- `https://smart-asset-collector.onrender.com` (Render subdomain)
- `http://localhost:3000` (local development)

When users visit your custom domains, the browser blocks API requests because the custom domains are not in the allowed CORS origins list.

## Solution

### Step 1: Update CORS Configuration (✅ COMPLETED)

The [`render.yaml`](render.yaml:22) file has been updated to include your custom domains:

```yaml
- key: CORS_ORIGINS
  value: https://smart-asset-collector.onrender.com,https://smartassetcollector.com,https://www.smartassetcollector.com,http://localhost:3000
```

### Step 2: Deploy Backend Changes

You need to deploy the updated backend to Render:

#### Option A: Push to Git (Recommended)
```bash
git add render.yaml
git commit -m "Add custom domains to CORS configuration"
git push origin main
```

Render will automatically detect the changes and redeploy the backend.

#### Option B: Manual Deploy via Render Dashboard
1. Go to https://dashboard.render.com
2. Click on your **backend service** (vault-backend)
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment to complete (usually 2-3 minutes)

### Step 3: Verify Backend Environment Variable

After deployment, verify the CORS_ORIGINS environment variable is updated:

1. Go to https://dashboard.render.com
2. Click on your **backend service** (vault-backend)
3. Click **"Environment"** in the left sidebar
4. Verify `CORS_ORIGINS` shows:
   ```
   https://smart-asset-collector.onrender.com,https://smartassetcollector.com,https://www.smartassetcollector.com,http://localhost:3000
   ```

### Step 4: Test Custom Domains

After backend deployment completes:

1. **Test Apex Domain:**
   - Visit https://smartassetcollector.com
   - Try logging in with demo credentials
   - Should work without "Load Failed" error

2. **Test WWW Subdomain:**
   - Visit https://www.smartassetcollector.com
   - Try logging in with demo credentials
   - Should work without "Load Failed" error

3. **Verify in Browser Console:**
   - Open Developer Tools (F12)
   - Go to Network tab
   - Try logging in
   - Check that API requests to backend return 200 OK (not CORS errors)

## How CORS Works

When a browser makes a request from one domain (e.g., `smartassetcollector.com`) to another domain (e.g., `vault-backend.onrender.com`), it first sends a "preflight" OPTIONS request to check if the server allows cross-origin requests.

**Before Fix:**
```
Browser: "Can smartassetcollector.com make requests to you?"
Backend: "No, only smart-asset-collector.onrender.com and localhost:3000"
Browser: ❌ Blocks the request → "Load Failed"
```

**After Fix:**
```
Browser: "Can smartassetcollector.com make requests to you?"
Backend: "Yes, smartassetcollector.com is allowed!"
Browser: ✅ Allows the request → Login succeeds
```

## Verification Checklist

After deploying:

- [ ] Backend has been redeployed with updated CORS configuration
- [ ] CORS_ORIGINS environment variable includes all custom domains
- [ ] Login works on https://smartassetcollector.com
- [ ] Login works on https://www.smartassetcollector.com
- [ ] Login still works on https://smart-asset-collector.onrender.com
- [ ] No CORS errors in browser console

## Troubleshooting

### If login still fails after deployment:

1. **Check Backend Deployment Status**
   - In Render dashboard → Backend service → Events
   - Ensure deployment completed successfully
   - Look for any deployment errors

2. **Verify Environment Variable**
   - In Render dashboard → Backend service → Environment
   - Confirm CORS_ORIGINS includes your custom domains
   - If not, manually update it and redeploy

3. **Clear Browser Cache**
   - Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   - Or use incognito/private window to test

4. **Check Browser Console**
   - Open Developer Tools (F12)
   - Look for CORS-related errors
   - Should NOT see: "Access-Control-Allow-Origin" errors
   - Should see: Successful API responses (200 OK)

5. **Wake Up Backend**
   - Visit https://vault-backend.onrender.com/healthz
   - Wait for response (may take 30-60 seconds if sleeping)
   - Then try login again

### Test Backend Directly

```bash
# Health check
curl https://vault-backend.onrender.com/healthz

# Test login from command line
curl -X POST https://vault-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: https://smartassetcollector.com" \
  -d '{"email":"demo@example.com","password":"demo12345"}'
```

The response should include an `access-control-allow-origin` header with your domain.

## Additional Notes

### Frontend Configuration
Your frontend already has the correct API URL configuration in the environment variables. No frontend changes are needed.

### Multiple Domains
The CORS configuration now supports:
- **Apex domain:** smartassetcollector.com
- **WWW subdomain:** www.smartassetcollector.com
- **Render subdomain:** smart-asset-collector.onrender.com
- **Local development:** localhost:3000

All four domains can now successfully communicate with the backend.

### Security
CORS is a security feature that prevents malicious websites from making unauthorized requests to your API. By explicitly listing allowed origins, you ensure only your legitimate domains can access the backend.

## Summary

**The Fix:**
1. ✅ Updated `render.yaml` to include custom domains in CORS_ORIGINS
2. ⏳ Deploy backend to Render (push to git or manual deploy)
3. ⏳ Test login on both custom domains

**Expected Result:**
After deployment, login should work on all domains:
- ✅ https://smartassetcollector.com
- ✅ https://www.smartassetcollector.com
- ✅ https://smart-asset-collector.onrender.com
- ✅ http://localhost:3000 (development)

The "Load Failed" error will be resolved once the backend is redeployed with the updated CORS configuration.
