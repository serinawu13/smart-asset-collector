# Backend Development Plan — Smart Asset Collector (SAC)

---

## 1️⃣ Executive Summary

**What will be built:**
- FastAPI backend (Python 3.13, async) for Smart Asset Collector luxury asset tracking platform
- MongoDB Atlas database for user portfolios, watchlists, and luxury item catalog
- RESTful API supporting user authentication, portfolio management, watchlist tracking, and market data
- Real-time asset valuation and performance analytics

**Key Constraints:**
- Python 3.13 with FastAPI (async)
- MongoDB Atlas only (no local instance)
- Motor (async MongoDB driver) + Pydantic v2 models
- No Docker containers
- Manual testing after every task via frontend UI
- Single Git branch (`main`) workflow
- API base path: `/api/v1/*`
- Background tasks: synchronous by default, `BackgroundTasks` only if strictly necessary

**Sprint Structure:**
- **S0:** Environment setup and frontend connection
- **S1:** Basic authentication (signup, login, logout)
- **S2:** Luxury item catalog and search
- **S3:** Portfolio management (CRUD operations)
- **S4:** Watchlist management with price alerts
- **S5:** Performance analytics and historical data

---

## 2️⃣ In-Scope & Success Criteria

**Features in Scope:**
- User authentication (signup, login, logout, session management)
- Luxury item catalog browsing and search
- Portfolio asset management (add, view, edit, remove, sell)
- Watchlist tracking with price alert configuration
- Portfolio performance analytics with timeframe filtering
- Asset detail views with market trends
- User settings (currency preference)
- Market news feed (static data)

**Success Criteria:**
- All frontend features functional end-to-end
- User can sign up, log in, and access protected dashboard
- User can add/edit/remove assets from portfolio
- User can add/remove items from watchlist with alerts
- Portfolio value calculations accurate across all timeframes
- All task-level manual tests pass via UI
- Each sprint's code pushed to `main` after verification

---

## 3️⃣ API Design

**Base Path:** `/api/v1`

**Error Envelope:**
```json
{ "error": "Descriptive error message" }
```

### Health Check
- **GET** `/healthz`
- **Purpose:** Verify API and database connectivity
- **Response:** `{ "status": "ok", "database": "connected", "timestamp": "ISO8601" }`

### Authentication Endpoints

- **POST** `/api/v1/auth/signup`
  - **Purpose:** Create new user account
  - **Request:** `{ "name": "string", "email": "string", "password": "string" }`
  - **Response:** `{ "user": { "id": "string", "name": "string", "email": "string" }, "token": "JWT" }`
  - **Validation:** Email format, password min 8 chars, unique email

- **POST** `/api/v1/auth/login`
  - **Purpose:** Authenticate existing user
  - **Request:** `{ "email": "string", "password": "string" }`
  - **Response:** `{ "user": { "id": "string", "name": "string", "email": "string" }, "token": "JWT" }`
  - **Validation:** Valid credentials, password verification via Argon2

- **POST** `/api/v1/auth/logout`
  - **Purpose:** Invalidate user session (client-side token removal)
  - **Request:** Headers: `Authorization: Bearer <token>`
  - **Response:** `{ "message": "Logged out successfully" }`

- **GET** `/api/v1/auth/me`
  - **Purpose:** Get current authenticated user info
  - **Request:** Headers: `Authorization: Bearer <token>`
  - **Response:** `{ "id": "string", "name": "string", "email": "string", "currency": "string" }`

### Luxury Items Catalog

- **GET** `/api/v1/items`
  - **Purpose:** Browse luxury items catalog
  - **Query Params:** `category` (Watch|Bag|Jewelry), `search` (brand/model text), `limit` (default 50)
  - **Response:** `{ "items": [{ "id", "brand", "model", "category", "material", "size", "color", "currentMarketValue", "retailPrice", "trend", "trendPercentage", "mentions30Days", "imageUrl" }] }`

- **GET** `/api/v1/items/{item_id}`
  - **Purpose:** Get detailed item information
  - **Response:** Single item object with all fields

- **GET** `/api/v1/items/trending`
  - **Purpose:** Get top trending items by mentions
  - **Query Params:** `limit` (default 3)
  - **Response:** `{ "items": [...] }` sorted by `mentions30Days` descending

### Portfolio Management

- **GET** `/api/v1/portfolio`
  - **Purpose:** Get user's portfolio assets
  - **Request:** Headers: `Authorization: Bearer <token>`
  - **Response:** `{ "assets": [{ "portfolioId", "itemId", "brand", "model", "category", "purchasePrice", "purchaseDate", "condition", "serialNumber", "material", "size", "color", "currentMarketValue", "retailPrice", "trend", "trendPercentage", "imageUrl" }] }`

- **POST** `/api/v1/portfolio`
  - **Purpose:** Add asset to portfolio
  - **Request:** `{ "itemId": "string", "purchasePrice": number, "purchaseDate": "YYYY-MM-DD", "condition": "string", "size": "string", "material": "string", "color": "string?", "serialNumber": "string?" }`
  - **Response:** `{ "asset": {...}, "message": "Asset added successfully" }`
  - **Validation:** Valid itemId, positive purchasePrice, valid date

- **PUT** `/api/v1/portfolio/{portfolio_id}`
  - **Purpose:** Update portfolio asset details
  - **Request:** `{ "purchasePrice"?, "purchaseDate"?, "condition"?, "material"?, "size"?, "color"?, "serialNumber"? }`
  - **Response:** `{ "asset": {...}, "message": "Asset updated successfully" }`

- **DELETE** `/api/v1/portfolio/{portfolio_id}`
  - **Purpose:** Remove asset from portfolio
  - **Response:** `{ "message": "Asset removed successfully" }`

- **POST** `/api/v1/portfolio/{portfolio_id}/sell`
  - **Purpose:** Mark asset as sold (archive with sale details)
  - **Request:** `{ "salePrice": number, "saleDate": "YYYY-MM-DD" }`
  - **Response:** `{ "message": "Asset sold successfully", "realizedGain": number, "realizedROI": number }`

### Watchlist Management

- **GET** `/api/v1/watchlist`
  - **Purpose:** Get user's watchlist items
  - **Request:** Headers: `Authorization: Bearer <token>`
  - **Response:** `{ "items": [{ "watchlistId", "itemId", "brand", "model", "category", "currentMarketValue", "targetPrice", "alertActive", "alertType", "alertThreshold", "imageUrl", ... }] }`

- **POST** `/api/v1/watchlist`
  - **Purpose:** Add item to watchlist
  - **Request:** `{ "itemId": "string", "targetPrice"?: number, "alertActive": boolean, "alertType": "up|down|both|none", "alertThreshold": number }`
  - **Response:** `{ "item": {...}, "message": "Added to watchlist" }`

- **PUT** `/api/v1/watchlist/{watchlist_id}`
  - **Purpose:** Update watchlist item (alerts, target price)
  - **Request:** `{ "targetPrice"?, "alertActive"?, "alertType"?, "alertThreshold"? }`
  - **Response:** `{ "item": {...}, "message": "Watchlist updated" }`

- **DELETE** `/api/v1/watchlist/{watchlist_id}`
  - **Purpose:** Remove item from watchlist
  - **Response:** `{ "message": "Removed from watchlist" }`

### Analytics & Performance

- **GET** `/api/v1/portfolio/analytics`
  - **Purpose:** Get portfolio performance metrics
  - **Query Params:** `timeframe` (1D|1W|1M|YTD|1Y|5Y|10Y|ALL)
  - **Response:** `{ "totalValue": number, "totalCost": number, "totalGain": number, "totalGainPercent": number, "timeframeChange": number, "timeframePercent": number, "chartData": [{ "label": "string", "value": number }] }`

- **GET** `/api/v1/portfolio/{portfolio_id}/analytics`
  - **Purpose:** Get individual asset performance
  - **Query Params:** `timeframe` (1D|1W|1M|YTD|1Y|5Y|10Y|ALL)
  - **Response:** `{ "currentValue": number, "purchasePrice": number, "totalGain": number, "totalROI": number, "timeframeChange": number, "timeframePercent": number, "chartData": [...] }`

### User Settings

- **GET** `/api/v1/settings`
  - **Purpose:** Get user preferences
  - **Response:** `{ "currency": "USD|EUR|GBP|CHF" }`

- **PUT** `/api/v1/settings`
  - **Purpose:** Update user preferences
  - **Request:** `{ "currency": "USD|EUR|GBP|CHF" }`
  - **Response:** `{ "settings": {...}, "message": "Settings updated" }`

### Market News (Static)

- **GET** `/api/v1/news`
  - **Purpose:** Get market news feed
  - **Query Params:** `limit` (default 4)
  - **Response:** `{ "articles": [{ "id", "source", "title", "date", "category", "url", "imageUrl" }] }`

---

## 4️⃣ Data Model (MongoDB Atlas)

### Collection: `users`
**Fields:**
- `_id`: ObjectId (auto-generated)
- `name`: string (required)
- `email`: string (required, unique, indexed)
- `password_hash`: string (required, Argon2 hashed)
- `currency`: string (default: "USD")
- `created_at`: datetime (required)
- `updated_at`: datetime (required)

**Example Document:**
```json
{
  "_id": "ObjectId('...')",
  "name": "Jane Collector",
  "email": "jane@example.com",
  "password_hash": "$argon2id$v=19$m=65536...",
  "currency": "USD",
  "created_at": "2026-03-18T12:00:00Z",
  "updated_at": "2026-03-18T12:00:00Z"
}
```

### Collection: `luxury_items`
**Fields:**
- `_id`: ObjectId (auto-generated)
- `brand`: string (required)
- `model`: string (required)
- `category`: string (required, enum: Watch|Bag|Jewelry)
- `material`: string (optional)
- `size`: string (optional)
- `color`: string (optional)
- `current_market_value`: number (required)
- `retail_price`: number (optional)
- `trend`: string (required, enum: up|down|stable)
- `trend_percentage`: number (required)
- `mentions_30_days`: number (optional, default: 0)
- `image_url`: string (optional)

**Example Document:**
```json
{
  "_id": "ObjectId('...')",
  "brand": "Rolex",
  "model": "Submariner Date 126610LN",
  "category": "Watch",
  "material": "Oystersteel",
  "size": "41mm",
  "current_market_value": 14500,
  "retail_price": 10250,
  "trend": "up",
  "trend_percentage": 2.4,
  "mentions_30_days": 12450,
  "image_url": "https://images.unsplash.com/..."
}
```

### Collection: `portfolio_assets`
**Fields:**
- `_id`: ObjectId (auto-generated, used as portfolioId)
- `user_id`: ObjectId (required, references users)
- `item_id`: ObjectId (required, references luxury_items)
- `purchase_price`: number (required)
- `purchase_date`: date (required)
- `condition`: string (required, enum: Pristine|Excellent|Good|Fair)
- `material`: string (required)
- `size`: string (required)
- `color`: string (optional)
- `serial_number`: string (optional)
- `is_sold`: boolean (default: false)
- `sale_price`: number (optional)
- `sale_date`: date (optional)
- `created_at`: datetime (required)
- `updated_at`: datetime (required)

**Example Document:**
```json
{
  "_id": "ObjectId('...')",
  "user_id": "ObjectId('...')",
  "item_id": "ObjectId('...')",
  "purchase_price": 10250,
  "purchase_date": "2021-05-15",
  "condition": "Excellent",
  "material": "Oystersteel",
  "size": "41mm",
  "serial_number": "M8K12345",
  "is_sold": false,
  "created_at": "2026-03-18T12:00:00Z",
  "updated_at": "2026-03-18T12:00:00Z"
}
```

### Collection: `watchlist_items`
**Fields:**
- `_id`: ObjectId (auto-generated, used as watchlistId)
- `user_id`: ObjectId (required, references users)
- `item_id`: ObjectId (required, references luxury_items)
- `target_price`: number (optional)
- `alert_active`: boolean (default: false)
- `alert_type`: string (enum: up|down|both|none, default: none)
- `alert_threshold`: number (default: 5, percentage)
- `created_at`: datetime (required)
- `updated_at`: datetime (required)

**Example Document:**
```json
{
  "_id": "ObjectId('...')",
  "user_id": "ObjectId('...')",
  "item_id": "ObjectId('...')",
  "target_price": 100000,
  "alert_active": true,
  "alert_type": "down",
  "alert_threshold": 5,
  "created_at": "2026-03-18T12:00:00Z",
  "updated_at": "2026-03-18T12:00:00Z"
}
```

### Collection: `market_news`
**Fields:**
- `_id`: ObjectId (auto-generated)
- `source`: string (required)
- `title`: string (required)
- `date`: string (required, e.g., "2 hours ago")
- `category`: string (required)
- `url`: string (required)
- `image_url`: string (optional)
- `published_at`: datetime (required)

**Example Document:**
```json
{
  "_id": "ObjectId('...')",
  "source": "Business of Fashion",
  "title": "The Resale Market for Luxury Watches Shows Signs of Stabilization",
  "date": "2 hours ago",
  "category": "Watches",
  "url": "#",
  "image_url": "https://images.unsplash.com/...",
  "published_at": "2026-03-18T10:00:00Z"
}
```

---

## 5️⃣ Frontend Audit & Feature Map

### Landing Page (`/`)
- **Route:** `/`
- **Component:** `page.tsx`
- **Purpose:** User signup/login entry point
- **Data Needed:** None (static)
- **Backend Endpoints:** `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`
- **Auth Required:** No

### Dashboard (`/dashboard`)
- **Route:** `/dashboard`
- **Component:** `dashboard/page.tsx`
- **Purpose:** Main portfolio overview and asset management
- **Data Needed:** User info, portfolio assets, watchlist items, market news
- **Backend Endpoints:** 
  - `GET /api/v1/auth/me`
  - `GET /api/v1/portfolio`
  - `GET /api/v1/portfolio/analytics`
  - `GET /api/v1/watchlist`
  - `GET /api/v1/news`
- **Auth Required:** Yes

### Portfolio Overview Component
- **Component:** `PortfolioOverview.tsx`
- **Purpose:** Display total portfolio value with chart and timeframe selector
- **Data Needed:** Portfolio analytics with timeframe filtering
- **Backend Endpoints:** `GET /api/v1/portfolio/analytics?timeframe={1D|1W|1M|YTD|1Y|5Y|10Y|ALL}`
- **Auth Required:** Yes

### Asset List Component
- **Component:** `AssetList.tsx`
- **Purpose:** Display categorized portfolio assets
- **Data Needed:** Portfolio assets grouped by category
- **Backend Endpoints:** `GET /api/v1/portfolio`
- **Auth Required:** Yes

### Watchlist Component
- **Component:** `Watchlist.tsx`
- **Purpose:** Display and manage watchlist items with alerts
- **Data Needed:** Watchlist items with alert settings
- **Backend Endpoints:** 
  - `GET /api/v1/watchlist`
  - `PUT /api/v1/watchlist/{id}`
  - `DELETE /api/v1/watchlist/{id}`
- **Auth Required:** Yes

### Add Asset Modal
- **Component:** `AddAssetModal.tsx`
- **Purpose:** Search catalog and add items to portfolio
- **Data Needed:** Luxury items catalog with search/filter
- **Backend Endpoints:** 
  - `GET /api/v1/items?category={category}&search={query}`
  - `POST /api/v1/portfolio`
- **Auth Required:** Yes

### Item Detail Modal
- **Component:** `ItemDetailModal.tsx`
- **Purpose:** View/edit asset details, manage watchlist, sell assets
- **Data Needed:** Asset details, performance analytics
- **Backend Endpoints:**
  - `GET /api/v1/portfolio/{id}/analytics?timeframe={timeframe}`
  - `PUT /api/v1/portfolio/{id}`
  - `DELETE /api/v1/portfolio/{id}`
  - `POST /api/v1/portfolio/{id}/sell`
  - `POST /api/v1/watchlist`
  - `PUT /api/v1/watchlist/{id}`
  - `DELETE /api/v1/watchlist/{id}`
- **Auth Required:** Yes

### Header Component
- **Component:** `Header.tsx`
- **Purpose:** Global search, notifications, user settings
- **Data Needed:** Luxury items for search, trending items, user settings
- **Backend Endpoints:**
  - `GET /api/v1/items?search={query}&limit=5`
  - `GET /api/v1/items/trending?limit=3`
  - `GET /api/v1/settings`
  - `PUT /api/v1/settings`
  - `POST /api/v1/auth/logout`
- **Auth Required:** Yes

### Market News Component
- **Component:** `MarketNews.tsx`
- **Purpose:** Display market news feed
- **Data Needed:** News articles
- **Backend Endpoints:** `GET /api/v1/news?limit=4`
- **Auth Required:** Yes

---

## 6️⃣ Configuration & ENV Vars

**Required Environment Variables:**
- `APP_ENV` — Environment (development, production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/sac_db`)
- `JWT_SECRET` — Secret key for JWT token signing (min 32 chars)
- `JWT_EXPIRES_IN` — JWT expiration in seconds (default: 86400 = 24 hours)
- `CORS_ORIGINS` — Comma-separated allowed frontend URLs (e.g., `http://localhost:3000,https://app.example.com`)

**Example `.env` file:**
```
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/sac_db?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=86400
CORS_ORIGINS=http://localhost:3000
```

---

## 7️⃣ Background Work

**Not Required:** No background tasks or async jobs needed for MVP. All operations are synchronous request-response patterns.

---

## 8️⃣ Integrations

**Not Required:** No external integrations needed for MVP. Market data and news are static/seeded data.

---

## 9️⃣ Testing Strategy (Manual via Frontend)

**Validation Approach:**
- All testing performed through frontend UI
- Every task includes Manual Test Step and User Test Prompt
- After each task completion, test via frontend before proceeding
- After all tasks in a sprint pass, commit and push to `main`
- If any test fails, fix and retest before pushing

**Test Flow:**
1. Complete backend task implementation
2. Start backend server locally
3. Start frontend development server
4. Execute Manual Test Step via UI
5. Verify expected result matches actual result
6. If pass → proceed to next task
7. If fail → debug, fix, retest
8. After all sprint tasks pass → commit and push to `main`

---

## 🔟 Dynamic Sprint Plan & Backlog

---

## 🧱 S0 – Environment Setup & Frontend Connection

**Objectives:**
- Create FastAPI project structure with Python 3.13
- Connect to MongoDB Atlas using Motor
- Implement `/healthz` endpoint with DB ping
- Enable CORS for frontend
- Replace frontend dummy API URLs with real backend
- Initialize Git repository with `.gitignore`
- Push initial setup to GitHub `main` branch

**User Stories:**
- As a developer, I need a working FastAPI skeleton so I can build features
- As a developer, I need MongoDB Atlas connectivity so I can persist data
- As a developer, I need CORS enabled so frontend can communicate with backend
- As a user, I want to see the app connect to a real backend

**Tasks:**

### Task 1: Initialize FastAPI project structure
- Create project directory structure:
  ```
  backend/
  ├── app/
  │   ├── __init__.py
  │   ├── main.py
  │   ├── config.py
  │   ├── database.py
  │   ├── models/
  │   │   └── __init__.py
  │   ├── routes/
  │   │   └── __init__.py
  │   ├── schemas/
  │   │   └── __init__.py
  │   └── utils/
  │       └── __init__.py
  ├── .env.example
  ├── .gitignore
  ├── requirements.txt
  └── README.md
  ```
- Create `requirements.txt` with dependencies:
  ```
  fastapi==0.115.0
  uvicorn[standard]==0.32.0
  motor==3.6.0
  pydantic==2.9.2
  pydantic-settings==2.6.0
  python-jose[cryptography]==3.3.0
  passlib[argon2]==1.7.4
  python-multipart==0.0.12
  ```
- Create `.env.example` with all required variables
- Create `.gitignore` with Python/FastAPI patterns

**Manual Test Step:** Verify project structure created correctly with all files present

**User Test Prompt:** "Check that the backend directory structure matches the specification with all required files and folders."

### Task 2: Configure environment and database connection
- Implement `app/config.py` using Pydantic Settings for env vars
- Implement `app/database.py` with Motor async MongoDB client
- Add connection pooling and error handling
- Create database initialization function

**Manual Test Step:** Run Python script to test MongoDB Atlas connection succeeds

**User Test Prompt:** "Execute the database connection test and verify it connects to MongoDB Atlas without errors."

### Task 3: Create FastAPI app with health check endpoint
- Implement `app/main.py` with FastAPI app instance
- Add CORS middleware with `CORS_ORIGINS` from env
- Create `GET /healthz` endpoint that:
  - Pings MongoDB Atlas
  - Returns `{ "status": "ok", "database": "connected", "timestamp": "ISO8601" }`
  - Returns 503 if DB connection fails
- Configure uvicorn server to run on `PORT` from env

**Manual Test Step:** Start backend with `uvicorn app.main:app --reload`, visit `http://localhost:8000/healthz` in browser, verify JSON response shows database connected

**User Test Prompt:** "Start the backend server and navigate to http://localhost:8000/healthz. Confirm you see a JSON response with status 'ok' and database 'connected'."

### Task 4: Update frontend to use real backend URLs
- Update frontend environment configuration to point to `http://localhost:8000/api/v1`
- Replace all mock data API calls with real fetch calls
- Add error handling for API failures
- Test CORS is working correctly

**Manual Test Step:** Start both backend and frontend, open browser DevTools Network tab, refresh frontend, verify no CORS errors and `/healthz` returns 200 OK

**User Test Prompt:** "Start both servers, open the app in your browser, open DevTools Network tab, and refresh. Verify the health check endpoint returns successfully without CORS errors."

### Task 5: Initialize Git repository and push to GitHub
- Run `git init` in project root (not in backend subdirectory)
- Set default branch to `main`: `git branch -M main`
- Create initial commit with all S0 files
- Create GitHub repository
- Add remote and push to `main`

**Manual Test Step:** Verify repository exists on GitHub with all files visible in `main` branch

**User Test Prompt:** "Visit your GitHub repository and confirm all backend files are present in the main branch."

**Definition of Done:**
- FastAPI server runs without errors
- `/healthz` endpoint returns success with MongoDB Atlas connection
- CORS enabled and frontend can make requests
- Frontend connects to backend (no CORS errors)
- Git repository initialized with `.gitignore`
- Code pushed to GitHub `main` branch

**Post-Sprint:** Commit all changes and push to `main`

---

## 🧩 S1 – Basic Auth (Signup / Login / Logout)

**Objectives:**
- Implement JWT-based authentication system
- Create user signup with password hashing (Argon2)
- Create user login with JWT token generation
- Implement logout endpoint
- Protect `/api/v1/auth/me` endpoint
- Update frontend to store JWT and send in headers

**User Stories:**
- As a new user, I want to create an account so I can track my assets
- As a returning user, I want to log in so I can access my portfolio
- As a logged-in user, I want to log out so I can secure my account
- As a logged-in user, I want my session to persist across page refreshes

**Tasks:**

### Task 1: Create User model and schema
- Create `app/models/user.py` with User Pydantic model
- Create `app/schemas/user.py` with UserCreate, UserResponse, UserLogin schemas
- Add validation for email format and password length (min 8 chars)

**Manual Test Step:** Import models in Python REPL and verify validation works (invalid email rejected, short password rejected)

**User Test Prompt:** "Test the user models by importing them and creating instances with valid and invalid data to confirm validation works."

### Task 2: Implement password hashing utilities
- Create `app/utils/auth.py` with Argon2 hash and verify functions
- Use `passlib` with Argon2id algorithm
- Add functions: `hash_password(password: str) -> str` and `verify_password(plain: str, hashed: str) -> bool`

**Manual Test Step:** Test hash and verify functions in Python REPL (hash a password, verify it matches, verify wrong password fails)

**User Test Prompt:** "Test password hashing by hashing a password and verifying it, then confirm a wrong password fails verification."

### Task 3: Implement JWT token utilities
- Add JWT creation and validation functions to `app/utils/auth.py`
- Use `python-jose` library
- Functions: `create_access_token(user_id: str) -> str` and `decode_access_token(token: str) -> dict`
- Token payload: `{ "sub": user_id, "exp": expiration_timestamp }`
- Use `JWT_SECRET` and `JWT_EXPIRES_IN` from config

**Manual Test Step:** Test token creation and decoding in Python REPL (create token, decode it, verify user_id matches)

**User Test Prompt:** "Test JWT token creation and decoding to ensure tokens are generated correctly and can be decoded to retrieve user information."

### Task 4: Create signup endpoint
- Create `app/routes/auth.py` with `POST /api/v1/auth/signup`
- Validate email uniqueness (check if user exists)
- Hash password with Argon2
- Insert user into `users` collection
- Generate JWT token
- Return user info and token
- Handle duplicate email error with 400 status

**Manual Test Step:** Use frontend signup form, enter name/email/password, submit, verify success message and redirect to dashboard

**User Test Prompt:** "Go to the landing page, fill out the signup form with a new email, and submit. Verify you see a success message and are redirected to the dashboard."

### Task 5: Create login endpoint
- Create `POST /api/v1/auth/login` in `app/routes/auth.py`
- Find user by email
- Verify password with Argon2
- Generate JWT token
- Return user info and token
- Handle invalid credentials with 401 status

**Manual Test Step:** Use frontend login form with correct credentials, verify redirect to dashboard; try wrong password, verify error message shown

**User Test Prompt:** "Log in with valid credentials and confirm you're redirected to the dashboard. Then try logging in with an incorrect password and verify an error message appears."

### Task 6: Create logout endpoint
- Create `POST /api/v1/auth/logout` in `app/routes/auth.py`
- Return success message (token invalidation handled client-side)

**Manual Test Step:** Log in, click logout button in header settings, verify redirect to landing page and protected routes blocked

**User Test Prompt:** "After logging in, click the logout button in the user settings menu. Confirm you're redirected to the landing page and cannot access the dashboard without logging in again."

### Task 7: Create protected /auth/me endpoint
- Create `GET /api/v1/auth/me` in `app/routes/auth.py`
- Add JWT authentication dependency
- Extract user_id from token
- Fetch user from database
- Return user info (id, name, email, currency)
- Handle invalid/expired token with 401 status

**Manual Test Step:** Log in, open DevTools Network tab, verify `/api/v1/auth/me` called on dashboard load and returns user info

**User Test Prompt:** "Log in and open the browser DevTools Network tab. Refresh the dashboard and verify the /auth/me endpoint is called and returns your user information."

### Task 8: Update frontend authentication flow
- Store JWT token in localStorage on signup/login
- Add Authorization header to all API requests
- Implement token refresh on page load
- Redirect to login if token invalid/expired
- Clear token on logout

**Manual Test Step:** Log in, refresh page, verify still logged in; clear localStorage, refresh, verify redirected to login

**User Test Prompt:** "Log in, refresh the page, and confirm you remain logged in. Then manually clear localStorage in DevTools, refresh again, and verify you're redirected to the login page."

**Definition of Done:**
- User can sign up with name, email, password
- User can log in with email and password
- User can log out and session is cleared
- JWT token stored and sent with requests
- Protected routes require valid token
- Invalid credentials show error messages

**Post-Sprint:** Commit all changes and push to `main`

---

## 🧱 S2 – Luxury Item Catalog & Search

**Objectives:**
- Seed MongoDB Atlas with luxury items catalog
- Implement catalog browsing endpoints
- Implement search functionality
- Implement trending items endpoint
- Update frontend to fetch real catalog data

**User Stories:**
- As a user, I want to browse luxury items so I can add them to my portfolio
- As a user, I want to search for specific brands/models so I can find items quickly
- As a user, I want to see trending items so I can discover popular assets

**Tasks:**

### Task 1: Create luxury item model and seed data
- Create `app/models/luxury_item.py` with LuxuryItem Pydantic model
- Create `app/schemas/luxury_item.py` with response schemas
- Create seed script `app/utils/seed_data.py` to populate `luxury_items` collection
- Seed with 8 items from frontend mockData (Rolex, Patek, AP, Hermès Birkin, Kelly, Chanel, Cartier, Van Cleef)

**Manual Test Step:** Run seed script, verify 8 items inserted into MongoDB Atlas via MongoDB Compass or Atlas UI

**User Test Prompt:** "Run the seed script and check MongoDB Atlas to confirm 8 luxury items are present in the luxury_items collection."

### Task 2: Implement GET /api/v1/items endpoint
- Create `app/routes/items.py` with `GET /api/v1/items`
- Support query params: `category` (Watch|Bag|Jewelry), `search` (text), `limit` (default 50)
- Filter by category if provided
- Search in brand and model fields (case-insensitive) if search param provided
- Return array of items with all fields

**Manual Test Step:** Open frontend AddAssetModal, select "Watches" category, verify Rolex, Patek, and AP appear in list

**User Test Prompt:** "Open the 'Add Asset' modal, select the 'Watches' category, and confirm you see Rolex, Patek Philippe, and Audemars Piguet in the results."

### Task 3: Implement search functionality
- Update `GET /api/v1/items` to support text search
- Search across brand and model fields
- Use case-insensitive regex matching
- Remove accents/diacritics for better matching (e.g., "Hermes" matches "Hermès")

**Manual Test Step:** In AddAssetModal search box, type "rolex", verify Rolex Submariner appears; type "birkin", verify Hermès Birkin appears

**User Test Prompt:** "In the Add Asset modal search box, type 'rolex' and verify the Rolex Submariner appears. Then type 'birkin' and confirm the Hermès Birkin shows up."

### Task 4: Implement GET /api/v1/items/{item_id} endpoint
- Create `GET /api/v1/items/{item_id}` in `app/routes/items.py`
- Fetch single item by ObjectId
- Return 404 if item not found
- Return full item details

**Manual Test Step:** Click on an item in AddAssetModal, verify item details modal opens with correct brand, model, and market value

**User Test Prompt:** "Click on any item in the Add Asset modal and verify the item details appear correctly in the next screen."

### Task 5: Implement GET /api/v1/items/trending endpoint
- Create `GET /api/v1/items/trending` in `app/routes/items.py`
- Sort items by `mentions_30_days` descending
- Support `limit` query param (default 3)
- Return top trending items

**Manual Test Step:** Open frontend, click search bar in header (without typing), verify trending section shows Hermès Birkin, Cartier Love, and Rolex Submariner (top 3 by mentions)

**User Test Prompt:** "Click the search bar in the header without typing anything. Verify the 'Trending Now' section displays the Hermès Birkin, Cartier Love Bracelet, and Rolex Submariner."

### Task 6: Update frontend to use real catalog API
- Replace `luxuryDatabase` imports with API calls to `/api/v1/items`
- Update AddAssetModal to fetch from API
- Update Header search to fetch from API
- Add loading states and error handling

**Manual Test Step:** Open AddAssetModal, verify items load from backend; search for "patek", verify results appear; check Network tab shows API calls to `/api/v1/items`

**User Test Prompt:** "Open the Add Asset modal and verify items load. Search for 'patek' and confirm results appear. Check the Network tab to ensure API calls are being made to /api/v1/items."

**Definition of Done:**
- Luxury items seeded in MongoDB Atlas
- Catalog browsing works with category filter
- Search functionality works across brand/model
- Trending items endpoint returns top 3 by mentions
- Frontend displays real catalog data from backend

**Post-Sprint:** Commit all changes and push to `main`

---

## 🧱 S3 – Portfolio Management (CRUD Operations)

**Objectives:**
- Implement portfolio asset CRUD endpoints
- Support adding assets from catalog to portfolio
- Support viewing portfolio assets
- Support editing asset details
- Support removing assets from portfolio
- Support selling assets with sale tracking

**User Stories:**
- As a user, I want to add items to my portfolio so I can track their value
- As a user, I want to view all my portfolio assets so I can see my collection
- As a user, I want to edit asset details so I can keep information accurate
- As a user, I want to remove assets so I can manage my collection
- As a user, I want to record asset sales so I can track realized gains

**Tasks:**

### Task 1: Create portfolio asset model
- Create `app/models/portfolio_asset.py` with PortfolioAsset Pydantic model
- Create `app/schemas/portfolio_asset.py` with request/response schemas
- Include all fields: user_id, item_id, purchase_price, purchase_date, condition, material, size, color, serial_number, is_sold, sale_price, sale_date

**Manual Test Step:** Import models in Python REPL and verify validation works for required fields

**User Test Prompt:** "Test the portfolio asset models by creating instances with valid and invalid data to confirm validation works correctly."

### Task 2: Implement POST /api/v1/portfolio endpoint
- Create `app/routes/portfolio.py` with `POST /api/v1/portfolio`
- Require authentication (JWT)
- Validate itemId exists in luxury_items collection
- Insert portfolio asset with user_id from token
- Return created asset with item details populated

**Manual Test Step:** Log in, open AddAssetModal, select Rolex Submariner, fill purchase details, submit, verify success message and asset appears in Collection list

**User Test Prompt:** "Log in, open the Add Asset modal, select the Rolex Submariner, fill in purchase details, and submit. Verify a success message appears and the asset shows up in your Collection."

### Task 3: Implement GET /api/v1/portfolio endpoint
- Create `GET /api/v1/portfolio` in `app/routes/portfolio.py`
- Require authentication
- Fetch all portfolio assets for authenticated user where `is_sold = false`
- Populate item details from luxury_items collection (lookup/join)
- Return array of assets with combined portfolio + item data

**Manual Test Step:** After adding an asset, refresh dashboard, verify asset appears in Collection list with correct brand, model, and current market value

**User Test Prompt:** "After adding an asset, refresh the dashboard and confirm the asset appears in your Collection with the correct brand, model, and current market value."

### Task 4: Implement PUT /api/v1/portfolio/{portfolio_id} endpoint
- Create `PUT /api/v1/portfolio/{portfolio_id}` in `app/routes/portfolio.py`
- Require authentication
- Verify portfolio asset belongs to authenticated user
- Update allowed fields: purchase_price, purchase_date, condition, material, size, color, serial_number
- Return updated asset

**Manual Test Step:** Click on portfolio asset to open detail modal, click edit icon on Purchase Details, change purchase price, save, verify new price displayed

**User Test Prompt:** "Click on a portfolio asset to open its detail modal, click the edit icon next to Purchase Details, change the purchase price, save, and verify the new price is displayed."

### Task 5: Implement DELETE /api/v1/portfolio/{portfolio_id} endpoint
- Create `DELETE /api/v1/portfolio/{portfolio_id}` in `app/routes/portfolio.py`
- Require authentication
- Verify portfolio asset belongs to authenticated user
- Delete asset from database
- Return success message

**Manual Test Step:** Open asset detail modal, click "Remove" button at bottom, confirm removal, verify asset disappears from Collection list

**User Test Prompt:** "Open an asset's detail modal, click the 'Remove' button at the bottom, confirm the removal, and verify the asset disappears from your Collection."

### Task 6: Implement POST /api/v1/portfolio/{portfolio_id}/sell endpoint
- Create `POST /api/v1/portfolio/{portfolio_id}/sell` in `app/routes/portfolio.py`
- Require authentication
- Verify portfolio asset belongs to authenticated user
- Update asset: set `is_sold = true`, `sale_price`, `sale_date`
- Calculate realized gain and ROI
- Return success message with realized metrics

**Manual Test Step:** Open asset detail modal, click "Liquidate Asset", enter sale price and date, submit, verify asset removed from Collection (sold assets hidden)

**User Test Prompt:** "Open an asset's detail modal, click 'Liquidate Asset', enter a sale price and date, submit, and verify the asset is removed from your Collection (sold assets are hidden from view)."

### Task 7: Update frontend portfolio components
- Update PortfolioOverview to fetch from `GET /api/v1/portfolio/analytics`
- Update AssetList to fetch from `GET /api/v1/portfolio`
- Update AddAssetModal to POST to `/api/v1/portfolio`
- Update ItemDetailModal to PUT/DELETE portfolio assets
- Add loading states and error handling

**Manual Test Step:** Perform full flow: add asset, view in list, edit details, verify changes persist after refresh, remove asset, verify removed

**User Test Prompt:** "Complete the full flow: add an asset, view it in the list, edit its details, refresh to confirm changes persist, then remove the asset and verify it's gone."

**Definition of Done:**
- User can add assets from catalog to portfolio
- User can view all portfolio assets grouped by category
- User can edit asset purchase details and specifications
- User can remove assets from portfolio
- User can sell assets and record sale details
- All portfolio operations persist to MongoDB Atlas

**Post-Sprint:** Commit all changes and push to `main`

---

## 🧱 S4 – Watchlist Management with Price Alerts

**Objectives:**
- Implement watchlist CRUD endpoints
- Support adding items to watchlist
- Support configuring price alerts (up/down/both/none)
- Support alert threshold settings
- Update frontend watchlist component

**User Stories:**
- As a user, I want to add items to my watchlist so I can track items I'm interested in
- As a user, I want to set price alerts so I'm notified of market changes
- As a user, I want to configure alert thresholds so I control sensitivity
- As a user, I want to remove items from watchlist when no longer interested

**Tasks:**

### Task 1: Create watchlist item model
- Create `app/models/watchlist_item.py` with WatchlistItem Pydantic model
- Create `app/schemas/watchlist_item.py` with request/response schemas
- Include fields: user_id, item_id, target_price, alert_active, alert_type, alert_threshold

**Manual Test Step:** Import models in Python REPL and verify validation works for alert types (up|down|both|none)

**User Test Prompt:** "Test the watchlist models by creating instances with different alert types to confirm validation works correctly."

### Task 2: Implement POST /api/v1/watchlist endpoint
- Create `app/routes/watchlist.py` with `POST /api/v1/watchlist`
- Require authentication
- Validate itemId exists in luxury_items collection
- Check if item already in user's watchlist (prevent duplicates)
- Insert watchlist item with user_id from token
- Return created watchlist item with item details

**Manual Test Step:** Search for Patek Nautilus in header, click result, click "Add to Watchlist" in modal, verify success and item appears in Watchlist section

**User Test Prompt:** "Search for 'Patek Nautilus' in the header search, click the result, click 'Add to Watchlist' in the modal, and verify the item appears in your Watchlist section."

### Task 3: Implement GET /api/v1/watchlist endpoint
- Create `GET /api/v1/watchlist` in `app/routes/watchlist.py`
- Require authentication
- Fetch all watchlist items for authenticated user
- Populate item details from luxury_items collection
- Return array of watchlist items with combined data

**Manual Test Step:** After adding item to watchlist, refresh dashboard, verify item appears in Watchlist section with bell icon and current market value

**User Test Prompt:** "After adding an item to your watchlist, refresh the dashboard and confirm the item appears in the Watchlist section with a bell icon and current market value."

### Task 4: Implement PUT /api/v1/watchlist/{watchlist_id} endpoint
- Create `PUT /api/v1/watchlist/{watchlist_id}` in `app/routes/watchlist.py`
- Require authentication
- Verify watchlist item belongs to authenticated user
- Update allowed fields: target_price, alert_active, alert_type, alert_threshold
- Return updated watchlist item

**Manual Test Step:** Click watchlist item to open detail modal, click bell icon, configure alert (e.g., "When price goes DOWN by at least 5%"), save, verify alert settings persist

**User Test Prompt:** "Click a watchlist item to open its detail modal, click the bell icon, configure an alert (e.g., 'When price goes DOWN by at least 5%'), save, and verify the alert settings are saved."

### Task 5: Implement DELETE /api/v1/watchlist/{watchlist_id} endpoint
- Create `DELETE /api/v1/watchlist/{watchlist_id}` in `app/routes/watchlist.py`
- Require authentication
- Verify watchlist item belongs to authenticated user
- Delete watchlist item from database
- Return success message

**Manual Test Step:** Open watchlist item detail modal, click "Remove from Watchlist", verify item disappears from Watchlist section

**User Test Prompt:** "Open a watchlist item's detail modal, click 'Remove from Watchlist', and verify the item disappears from your Watchlist section."

### Task 6: Update frontend watchlist components
- Update Watchlist component to fetch from `GET /api/v1/watchlist`
- Update ItemDetailModal to POST/PUT/DELETE watchlist items
- Update alert configuration UI to save to backend
- Add loading states and error handling

**Manual Test Step:** Perform full flow: add item to watchlist, configure alert, toggle alert on/off, verify changes persist after refresh, remove from watchlist

**User Test Prompt:** "Complete the full flow: add an item to watchlist, configure an alert, toggle the alert on/off, refresh to confirm changes persist, then remove the item from watchlist."

**Definition of Done:**
- User can add items to watchlist from search or catalog
- User can view all watchlist items grouped by category
- User can configure price alerts with type and threshold
- User can toggle alerts on/off
- User can remove items from watchlist
- All watchlist operations persist to MongoDB Atlas

**Post-Sprint:** Commit all changes and push to `main`

---

## 🧱 S5 – Performance Analytics & Historical Data

**Objectives:**
- Implement portfolio analytics endpoint with timeframe filtering
- Implement individual asset analytics endpoint
- Generate mock historical chart data based on trends
- Calculate portfolio totals and returns
- Update frontend charts to use real analytics data

**User Stories:**
- As a user, I want to see my total portfolio value so I know my net worth
- As a user, I want to see portfolio performance over time so I can track growth
- As a user, I want to filter by timeframe so I can analyze different periods
- As a user, I want to see individual asset performance so I can make decisions

**Tasks:**

### Task 1: Implement portfolio totals calculation
- Create `app/utils/analytics.py` with portfolio calculation functions
- Calculate total current value (sum of all asset current market values)
- Calculate total cost (sum of all purchase prices)
- Calculate total gain (total value - total cost)
- Calculate total gain percentage ((gain / cost) * 100)

**Manual Test Step:** Add 2-3 assets to portfolio, verify PortfolioOverview shows correct total value matching sum of individual asset values

**User Test Prompt:** "Add 2-3 assets to your portfolio and verify the Portfolio Overview displays the correct total value matching the sum of individual asset values."

### Task 2: Implement timeframe chart data generation
- Create function to generate mock historical data based on timeframe
- Support timeframes: 1D, 1W, 1M, YTD, 1Y, 5Y, 10Y, ALL
- Calculate start value based on current value and trend percentage
- Generate data points with appropriate labels (hours, days, weeks, months, years)
- Add realistic variance to simulate market fluctuations

**Manual Test Step:** View portfolio chart, click different timeframes (1D, 1W, 1M, etc.), verify chart updates with appropriate data points and labels

**User Test Prompt:** "View the portfolio chart and click through different timeframes (1D, 1W, 1M, etc.). Verify the chart updates with appropriate data points and labels for each timeframe."

### Task 3: Implement GET /api/v1/portfolio/analytics endpoint
- Create `GET /api/v1/portfolio/analytics` in `app/routes/portfolio.py`
- Require authentication
- Support `timeframe` query param (default: 1Y)
- Calculate portfolio totals
- Generate chart data for selected timeframe
- Calculate timeframe-specific change and percentage
- Return analytics object with totals and chart data

**Manual Test Step:** Select different timeframes in PortfolioOverview, verify chart redraws and timeframe stats update (e.g., "Past Week" shows different gain than "Past Year")

**User Test Prompt:** "Select different timeframes in the Portfolio Overview and verify the chart redraws and timeframe statistics update correctly (e.g., 'Past Week' shows different gains than 'Past Year')."

### Task 4: Implement GET /api/v1/portfolio/{portfolio_id}/analytics endpoint
- Create `GET /api/v1/portfolio/{portfolio_id}/analytics` in `app/routes/portfolio.py`
- Require authentication
- Verify asset belongs to authenticated user
- Support `timeframe` query param
- Calculate individual asset metrics (current value, purchase price, total gain, ROI)
- Generate chart data based on asset's trend percentage
- Return asset analytics with chart data

**Manual Test Step:** Click on portfolio asset to open detail modal, verify chart displays with current market value, select different timeframes, verify chart updates

**User Test Prompt:** "Click on a portfolio asset to open its detail modal, verify the performance chart displays, then select different timeframes and confirm the chart updates accordingly."

### Task 5: Implement retail price comparison metrics
- Add retail price comparison to analytics calculations
- Calculate market vs retail premium/discount
- Include in both portfolio and individual asset analytics
- Display in Performance Metrics section

**Manual Test Step:** Open asset detail modal, verify Performance Metrics section shows "Market vs Retail" with percentage (e.g., "+41.46%" for Rolex Submariner)

**User Test Prompt:** "Open an asset's detail modal and verify the Performance Metrics section displays 'Market vs Retail' with the correct percentage (e.g., '+41.46%' for Rolex Submariner)."

### Task 6: Update frontend analytics components
- Update PortfolioOverview to fetch from `GET /api/v1/portfolio/analytics`
- Update ItemDetailModal to fetch from `GET /api/v1/portfolio/{id}/analytics`
- Update charts to use real data from backend
- Add loading states during analytics calculations
- Handle timeframe changes with API calls

**Manual Test Step:** Perform full analytics flow: view portfolio chart, change timeframes, open asset detail, view asset chart, change timeframes, verify all data loads correctly

**User Test Prompt:** "Complete the full analytics flow: view the portfolio chart, change timeframes, open an asset detail modal, view its chart, change timeframes, and verify all data loads correctly."

**Definition of Done:**
- Portfolio total value calculated correctly
- Portfolio chart displays with timeframe filtering
- Individual asset charts display with timeframe filtering
- Timeframe changes update chart data and statistics
- Retail price comparison metrics displayed
- All analytics data accurate and performant

**Post-Sprint:** Commit all changes and push to `main`

---

## 🧱 S6 – User Settings & Market News

**Objectives:**
- Implement user settings endpoints (currency preference)
- Seed market news data
- Implement market news endpoint
- Update frontend to use real settings and news data

**User Stories:**
- As a user, I want to set my preferred currency so values display correctly
- As a user, I want to see market news so I stay informed about luxury markets
- As a user, I want my settings to persist across sessions

**Tasks:**

### Task 1: Implement GET /api/v1/settings endpoint
- Create `app/routes/settings.py` with `GET /api/v1/settings`
- Require authentication
- Fetch user from database
- Return user settings (currency preference)

**Manual Test Step:** Log in, open header settings dropdown, verify current currency preference displayed (default: USD)

**User Test Prompt:** "Log in, open the user settings dropdown in the header, and verify your current currency preference is displayed (default should be USD)."

### Task 2: Implement PUT /api/v1/settings endpoint
- Create `PUT /api/v1/settings` in `app/routes/settings.py`
- Require authentication
- Validate currency value (USD|EUR|GBP|CHF)
- Update user's currency preference in database
- Return updated settings

**Manual Test Step:** Open settings dropdown, change currency from USD to EUR, verify setting saves; refresh page, verify EUR still selected

**User Test Prompt:** "Open the settings dropdown, change the currency from USD to EUR, and verify the setting saves. Refresh the page and confirm EUR is still selected."

### Task 3: Seed market news data
- Create seed function in `app/utils/seed_data.py` for market news
- Seed 4 news articles from frontend mockData
- Include source, title, date, category, url, image_url fields

**Manual Test Step:** Run seed script, verify 4 news articles inserted into MongoDB Atlas

**User Test Prompt:** "Run the seed script and check MongoDB Atlas to confirm 4 news articles are present in the market_news collection."

### Task 4: Implement GET /api/v1/news endpoint
- Create `app/routes/news.py` with `GET /api/v1/news`
- Support `limit` query param (default 4)
- Fetch news articles sorted by published_at descending
- Return array of news articles

**Manual Test Step:** View dashboard, scroll to Market News section, verify 4 news articles displayed with titles, sources, and images

**User Test Prompt:** "View the dashboard, scroll to the Market News section, and verify 4 news articles are displayed with titles, sources, and images."

### Task 5: Update frontend to use real settings and news
- Update Header settings to fetch/update via API
- Update MarketNews component to fetch from API
- Add loading states and error handling

**Manual Test Step:** Change currency setting, verify all prices on page update to new currency format; verify news articles load from backend

**User Test Prompt:** "Change the currency setting and verify all prices on the page update to the new currency format. Also confirm news articles load from the backend."

**Definition of Done:**
- User can view and update currency preference
- Currency preference persists across sessions
- Market news displays from backend
- All settings and news operations work end-to-end

**Post-Sprint:** Commit all changes and push to `main`

---

## ✅ FINAL VALIDATION & DEPLOYMENT READINESS

**Complete End-to-End Testing:**
1. Sign up new user → verify account created
2. Log in → verify dashboard loads
3. Add 3 assets to portfolio → verify all appear in Collection
4. Add 2 items to watchlist → verify appear in Watchlist
5. Configure price alert → verify settings save
6. Edit asset details → verify changes persist
7. View portfolio analytics across all timeframes → verify charts update
8. View individual asset analytics → verify metrics accurate
9. Change currency setting → verify prices update
10. Sell an asset → verify removed from portfolio
11. Remove watchlist item → verify removed
12. Log out → verify redirected to landing
13. Log back in → verify all data persists

**Performance Checks:**
- All API endpoints respond within 500ms
- Database queries optimized with proper indexing
- No N+1 query issues in list endpoints
- Frontend loads without errors

**Security Validation:**
- All protected endpoints require valid JWT
- Passwords hashed with Argon2
- User can only access their own data
- CORS properly configured

**Code Quality:**
- All code follows Python PEP 8 style guide
- Proper error handling on all endpoints
- Async/await used correctly throughout
- Environment variables properly configured

**Documentation:**
- README.md includes setup instructions
- API endpoints documented
- Environment variables documented
- Deployment instructions included

**Git Hygiene:**
- All code committed to `main` branch
- Commit messages descriptive
- No sensitive data in repository
- `.gitignore` properly configured

---

## 📋 APPENDIX: Quick Reference

### Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # MongoDB connection
│   ├── models/              # Pydantic models
│   │   ├── user.py
│   │   ├── luxury_item.py
│   │   ├── portfolio_asset.py
│   │   └── watchlist_item.py
│   ├── routes/              # API endpoints
│   │   ├── auth.py
│   │   ├── items.py
│   │   ├── portfolio.py
│   │   ├── watchlist.py
│   │   ├── settings.py
│   │   └── news.py
│   ├── schemas/             # Request/response schemas
│   └── utils/               # Helper functions
│       ├── auth.py          # JWT & password hashing
│       ├── analytics.py     # Performance calculations
│       └── seed_data.py     # Database seeding
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example environment file
├── .gitignore
├── requirements.txt
└── README.md
```

### Common Commands
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000

# Seed database
python -m app.utils.seed_data

# Run with environment variables
export $(cat .env | xargs) && uvicorn app.main:app --reload
```

### MongoDB Collections
- `users` — User accounts and preferences
- `luxury_items` — Catalog of luxury goods
- `portfolio_assets` — User-owned assets
- `watchlist_items` — User watchlist tracking
- `market_news` — News articles feed

### Authentication Flow
1. User signs up → password hashed with Argon2 → user created → JWT issued
2. User logs in → password verified → JWT issued
3. Protected requests → JWT in Authorization header → user_id extracted → data filtered by user

### Key Dependencies
- `fastapi` — Web framework
- `uvicorn` — ASGI server
- `motor` — Async MongoDB driver
- `pydantic` — Data validation
- `python-jose` — JWT handling
- `passlib[argon2]` — Password hashing

---

**END OF BACKEND DEVELOPMENT PLAN**