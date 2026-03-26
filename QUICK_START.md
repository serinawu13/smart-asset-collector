# Quick Start Guide - After Homebrew Installs

## 📦 Once Homebrew Installation Completes

### Step 1: Install Node.js
```bash
brew install node
```

Wait for it to complete, then verify:
```bash
node --version
npm --version
```

You should see version numbers (e.g., v20.x.x and 10.x.x)

### Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

This will take a few minutes to download all packages.

### Step 3: Start the Frontend Server
```bash
npm run dev
```

You should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

### Step 4: Open Your Browser
Navigate to: **`http://localhost:3000`**

---

## 🎯 What You'll See

### Landing Page
- Clean, minimal design with "SAC" logo
- Two tabs: "Login" and "Sign Up"
- Form fields for authentication

### Test the Flow:

**1. Sign Up (Create New Account)**
- Click "Sign Up" tab
- Enter:
  - Name: `Your Name`
  - Email: `your@email.com`
  - Password: `password123` (min 6 chars)
- Click "Create Account"
- Should redirect to dashboard

**2. Dashboard (After Login)**
- Shows "Welcome to your private vault, [Your Name]"
- Empty state initially (no assets yet)
- Header shows your name and "Exit" button
- Portfolio Overview section (will show chart when you have assets)
- Collection section (will list your assets)

**3. Logout**
- Click "Exit" button in header
- Redirects back to landing page
- Token cleared from browser

**4. Login Again**
- Click "Login" tab
- Enter same email/password
- Click "Enter Vault"
- Back to dashboard

---

## 🔍 Behind the Scenes

When you interact with the frontend, check your browser's Developer Tools:

**Open DevTools:** Press `F12` or `Cmd+Option+I` (Mac)

**Console Tab:**
- See API calls being made
- Any errors will appear here

**Network Tab:**
- Filter by "Fetch/XHR"
- See all API requests to `http://localhost:8000`
- Click on any request to see:
  - Request headers (including Authorization token)
  - Response data
  - Status codes (200 = success, 201 = created, etc.)

**Application Tab:**
- Go to "Local Storage" → `http://localhost:3000`
- See `auth_token` stored after login
- This token is sent with every API request

---

## 📊 Backend Terminal

Keep an eye on the backend terminal (Terminal 6) - you'll see:
```
INFO: 127.0.0.1:xxxxx - "POST /api/v1/auth/signup HTTP/1.1" 201 Created
INFO: 127.0.0.1:xxxxx - "GET /api/v1/portfolio HTTP/1.1" 200 OK
```

This confirms the frontend is successfully communicating with the backend!

---

## 🎨 What's Integrated

✅ **Authentication Flow**
- Signup creates account in MongoDB
- Login returns JWT token
- Token stored in browser localStorage
- Token sent with every API request
- Logout clears token

✅ **Protected Routes**
- Dashboard requires authentication
- Automatically redirects to login if not authenticated
- User info displayed in header

✅ **Portfolio Data**
- Fetches from `/api/v1/portfolio`
- Shows loading state while fetching
- Displays empty state for new users
- Will show assets when you add them

✅ **Real-time Calculations**
- Backend calculates gain/loss
- Frontend displays with color coding (green = gain, red = loss)
- Total portfolio value
- Individual asset performance

---

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Then try npm run dev again
```

**CORS errors in console?**
- Make sure backend is running on port 8000
- Frontend must be on port 3000
- CORS is configured for this exact setup

**Can't connect to backend?**
- Check Terminal 6 - backend should be running
- Visit `http://localhost:8000/docs` to verify

**Token expired?**
- Tokens last 24 hours
- Just logout and login again

---

## 🚀 Next Steps After Testing

Once you verify the integration works:

1. **Add Sample Data**
   - Use the Swagger UI at `http://localhost:8000/docs`
   - Create luxury items
   - Add them to your portfolio
   - Refresh dashboard to see them

2. **Explore the Code**
   - [`frontend/lib/api.ts`](frontend/lib/api.ts) - API client
   - [`frontend/contexts/AuthContext.tsx`](frontend/contexts/AuthContext.tsx) - Auth state
   - [`frontend/components/PortfolioOverview.tsx`](frontend/components/PortfolioOverview.tsx) - Portfolio chart
   - [`frontend/components/AssetList.tsx`](frontend/components/AssetList.tsx) - Asset list

3. **Future Enhancements**
   - Integrate AddAssetModal with backend
   - Add Watchlist functionality
   - Implement Market News
   - Add token refresh mechanism

---

## ✅ Success Checklist

- [ ] Homebrew installed
- [ ] Node.js installed (`node --version` works)
- [ ] Frontend dependencies installed (`npm install` completed)
- [ ] Frontend server running (`npm run dev` successful)
- [ ] Browser opens to `http://localhost:3000`
- [ ] Can create account (signup works)
- [ ] Redirects to dashboard after signup
- [ ] Can see user name in header
- [ ] Can logout successfully
- [ ] Can login with existing account
- [ ] Backend terminal shows API requests
- [ ] Browser DevTools shows successful API calls (200/201 status)

**When all boxes are checked, the integration is fully working! 🎉**

---

## 📞 Need Help?

If something doesn't work:
1. Check both terminal outputs (backend and frontend)
2. Check browser console for errors
3. Verify MongoDB is running (backend needs it)
4. Make sure ports 3000 and 8000 are not blocked
5. Review [`INTEGRATION_PROGRESS.md`](INTEGRATION_PROGRESS.md) for technical details
