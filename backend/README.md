# Smart Asset Collector - Backend

FastAPI backend for luxury asset tracking platform.

## Setup

1. **Install Python 3.13+**

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update `MONGODB_URI` with your MongoDB Atlas connection string
   - Update `JWT_SECRET` with a secure random string (min 32 characters)

4. **Run development server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

5. **Access API:**
   - Health check: http://localhost:8000/healthz
   - API docs: http://localhost:8000/docs

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment configuration
│   ├── database.py          # MongoDB connection
│   ├── models/              # Pydantic models
│   ├── routes/              # API endpoints
│   ├── schemas/             # Request/response schemas
│   └── utils/               # Helper functions
├── .env                     # Environment variables (gitignored)
├── .env.example             # Example environment file
├── .gitignore
├── requirements.txt
└── README.md
```

## API Documentation

Base path: `/api/v1`

See `/docs` for interactive API documentation (Swagger UI).

## Environment Variables

- `APP_ENV` — Environment (development, production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string
- `JWT_SECRET` — Secret key for JWT token signing (min 32 chars)
- `JWT_EXPIRES_IN` — JWT expiration in seconds (default: 86400 = 24 hours)
- `CORS_ORIGINS` — Comma-separated allowed frontend URLs
