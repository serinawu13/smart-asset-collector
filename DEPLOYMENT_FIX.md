# Deployment Fix for "Load Failed" Error

## Problem
The frontend was unable to connect to the backend API because:
1. Frontend was hardcoded to use `http://localhost:8000/api/v1`
2. Backend CORS was only allowing `http://localhost:3000`

## Solution Applied

### 1. Frontend API Configuration
- Updated [`frontend/lib/api.ts`](frontend/lib/api.ts) to use environment variables
- Created [`frontend/.env.example`](frontend/.env.example) with production API URL
- Created [`frontend/.env.local`](frontend/.env.local) for local development

### 2. Backend CORS Configuration
- Updated [`render.yaml`](render.yaml) to include `CORS_ORIGINS` environment variable
- Added both production frontend URL and localhost for development

## Deployment Steps

### Option 1: Update Environment Variable in Render Dashboard (Quickest)

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your **backend service** (`vault-backend` or `smart-asset-collector-backend`)
3. Go to **Environment** tab
4. Add a new environment variable:
   - **Key**: `CORS_ORIGINS`
   - **Value**: `https://smart-asset-collector.onrender.com,http://localhost:3000`
5. Click **Save Changes**
6. The backend will automatically redeploy

7. Then, select your **frontend service** (`smart-asset-collector`)
8. Go to **Environment** tab
9. Add a new environment variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://smart-asset-collector-backend.onrender.com/api/v1`
10. Click **Save Changes**
11. The frontend will automatically redeploy

### Option 2: Redeploy from Git (Recommended for long-term)

1. Commit and push the changes:
   ```bash
   git add .
   git commit -m "Fix CORS and API URL configuration for production deployment"
   git push origin main
   ```

2. Render will automatically detect the changes and redeploy both services

3. Wait for both deployments to complete (check the Render dashboard)

## Verification

After redeployment:

1. Visit your frontend URL: https://smart-asset-collector.onrender.com
2. Try to sign up with a new account
3. The signup should now work without "Load Failed" error

## Testing the Backend Directly

You can test if the backend is working by visiting:
- Health check: https://smart-asset-collector-backend.onrender.com/healthz
- API docs: https://smart-asset-collector-backend.onrender.com/docs

## Local Development

For local development, the configuration will automatically use:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000/api/v1`

No changes needed for local development!

## Files Modified

1. [`frontend/lib/api.ts`](frontend/lib/api.ts) - Added environment variable support
2. [`frontend/.env.example`](frontend/.env.example) - Production API URL template
3. [`frontend/.env.local`](frontend/.env.local) - Local development API URL
4. [`render.yaml`](render.yaml) - Added CORS_ORIGINS environment variable

## Troubleshooting

If you still see "Load Failed" after redeployment:

1. **Check browser console** (F12 → Console tab) for specific error messages
2. **Verify environment variables** in Render dashboard are set correctly
3. **Check CORS errors** - should see the actual error in browser console
4. **Clear browser cache** and try again
5. **Check backend logs** in Render dashboard for any errors

## Additional Notes

- The backend now accepts requests from both production and localhost
- The frontend will automatically use the correct API URL based on environment
- All changes are backward compatible with local development
