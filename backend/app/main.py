"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, timezone
import logging

from app.config import settings
from app.database import connect_to_mongodb, close_mongodb_connection, get_database
from app.routes import auth, items, portfolio, watchlist, news, notifications, admin, exchange_rates
from app.routes import settings as settings_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


async def _ensure_indexes():
    """Create indexes for the market_listings and scrape_jobs collections."""
    try:
        db = get_database()
        listings = db["market_listings"]
        await listings.create_index(
            [("source", 1), ("listing_url", 1)], unique=True, name="source_url_unique"
        )
        await listings.create_index(
            [("brand", 1), ("model", 1), ("size_cm", 1)], name="brand_model_size"
        )
        await listings.create_index(
            [("category", 1), ("scraped_at", -1)], name="category_scraped_at"
        )
        await listings.create_index([("sold", 1)], name="sold")
        logger.info("market_listings indexes ensured")
    except Exception as e:
        logger.warning(f"Index creation skipped (DB may not be connected): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    # Startup
    logger.info("Starting Smart Asset Collector Backend...")
    await connect_to_mongodb()
    await _ensure_indexes()
    yield
    # Shutdown
    logger.info("Shutting down Smart Asset Collector Backend...")
    await close_mongodb_connection()


# Create FastAPI application
app = FastAPI(
    title="Smart Asset Collector API",
    description="Backend API for luxury asset tracking platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(items.router)
app.include_router(portfolio.router)
app.include_router(watchlist.router)
app.include_router(settings_router.router)
app.include_router(news.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(exchange_rates.router)


@app.get("/healthz")
async def health_check():
    """Health check endpoint to verify API and database connectivity"""
    try:
        # Ping database to verify connection
        db = get_database()
        await db.command('ping')
        
        return {
            "status": "ok",
            "database": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "error",
            "database": "disconnected",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": str(e)
        }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Smart Asset Collector API",
        "version": "1.0.0",
        "docs": "/docs"
    }
