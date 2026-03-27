"""MongoDB database connection using Motor (async driver)"""
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
import logging
import certifi
import ssl

logger = logging.getLogger(__name__)

# Global database client and database instances
client: Optional[AsyncIOMotorClient] = None
db: Optional[AsyncIOMotorDatabase] = None


async def connect_to_mongodb():
    """Initialize MongoDB connection"""
    global client, db
    
    try:
        logger.info("Connecting to MongoDB Atlas...")
        
        client = AsyncIOMotorClient(
            settings.mongodb_connection_string,
            maxPoolSize=10,
            minPoolSize=1,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=10000,
            tlsCAFile=certifi.where()
        )
        
        # Get database name from URI or use default
        db = client.get_default_database()
        
        # Test connection
        await client.admin.command('ping')
        logger.info(f"Successfully connected to MongoDB database: {db.name}")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        logger.warning("Application will start without database connection. Check MongoDB Atlas network access settings.")
        # Don't raise - allow app to start for debugging
        client = None
        db = None


async def close_mongodb_connection():
    """Close MongoDB connection"""
    global client
    
    if client:
        logger.info("Closing MongoDB connection...")
        client.close()
        logger.info("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    if db is None:
        raise RuntimeError("Database not connected. Check MongoDB Atlas network access settings and connection string.")
    return db
