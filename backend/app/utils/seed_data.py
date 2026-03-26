"""
Database Seed Script
Seeds MongoDB with initial luxury items catalog and market news
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from datetime import datetime, timezone
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Luxury items data - using placeholder images with item names
# Note: Replace these with actual product images from your CDN or image hosting service
LUXURY_ITEMS = [
    {
        "brand": "Rolex",
        "model": "Submariner Date 126610LN",
        "category": "Watch",
        "material": "Oystersteel",
        "size": "41mm",
        "color": "Black",
        "current_market_value": 14500,
        "retail_price": 10250,
        "trend": "up",
        "trend_percentage": 2.4,
        "mentions_30_days": 12450,
        "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&q=80"
    },
    {
        "brand": "Patek Philippe",
        "model": "Nautilus 5711/1A",
        "category": "Watch",
        "material": "Stainless Steel",
        "size": "40mm",
        "color": "Blue",
        "current_market_value": 125000,
        "retail_price": 34890,
        "trend": "stable",
        "trend_percentage": 0.0,
        "mentions_30_days": 8920,
        "image_url": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&h=800&fit=crop&q=80"
    },
    {
        "brand": "Audemars Piguet",
        "model": "Royal Oak 15500ST",
        "category": "Watch",
        "material": "Stainless Steel",
        "size": "41mm",
        "color": "Blue",
        "current_market_value": 58000,
        "retail_price": 27800,
        "trend": "up",
        "trend_percentage": 1.8,
        "mentions_30_days": 6340,
        "image_url": "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&h=800&fit=crop&q=80"
    },
    {
        "brand": "Hermès",
        "model": "Birkin 30",
        "category": "Bag",
        "material": "Togo Leather",
        "size": "30cm",
        "color": "Black",
        "current_market_value": 18500,
        "retail_price": 12000,
        "trend": "up",
        "trend_percentage": 3.2,
        "mentions_30_days": 15680,
        "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop&q=80"
    },
    {
        "brand": "Hermès",
        "model": "Kelly 28",
        "category": "Bag",
        "material": "Epsom Leather",
        "size": "28cm",
        "color": "Gold",
        "current_market_value": 16200,
        "retail_price": 10500,
        "trend": "up",
        "trend_percentage": 2.1,
        "mentions_30_days": 11230,
        "image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop&q=80"
    },
    {
        "brand": "Chanel",
        "model": "Classic Flap Medium",
        "category": "Bag",
        "material": "Lambskin",
        "size": "Medium",
        "color": "Black",
        "current_market_value": 9800,
        "retail_price": 8800,
        "trend": "stable",
        "trend_percentage": 0.5,
        "mentions_30_days": 9870,
        "image_url": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&h=800&fit=crop&q=80"
    },
    {
        "brand": "Cartier",
        "model": "Love Bracelet",
        "category": "Jewelry",
        "material": "18K Yellow Gold",
        "size": "17",
        "color": "Gold",
        "current_market_value": 7850,
        "retail_price": 7100,
        "trend": "up",
        "trend_percentage": 1.5,
        "mentions_30_days": 13420,
        "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&q=80"
    },
    {
        "brand": "Van Cleef & Arpels",
        "model": "Alhambra Necklace",
        "category": "Jewelry",
        "material": "18K Yellow Gold",
        "size": "One Size",
        "color": "Gold",
        "current_market_value": 4200,
        "retail_price": 3850,
        "trend": "stable",
        "trend_percentage": 0.3,
        "mentions_30_days": 5640,
        "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop&q=80"
    }
]


# Market news data based on frontend mockData
MARKET_NEWS = [
    {
        "source": "Business of Fashion",
        "title": "The Resale Market for Luxury Watches Shows Signs of Stabilization",
        "date": "2 hours ago",
        "category": "Watches",
        "url": "https://www.businessoffashion.com/",
        "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "Vogue Business",
        "title": "Hermès Birkin Bags Continue to Outperform Traditional Investments",
        "date": "5 hours ago",
        "category": "Bags",
        "url": "https://www.voguebusiness.com/",
        "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "Financial Times",
        "title": "High Jewelry Sees Record Auction Results in Q1 2026",
        "date": "1 day ago",
        "category": "Jewelry",
        "url": "https://www.ft.com/",
        "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "WatchPro",
        "title": "Patek Philippe Nautilus Discontinuation Drives Secondary Market Prices",
        "date": "2 days ago",
        "category": "Watches",
        "url": "https://www.watchpro.com/",
        "image_url": "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "Bloomberg",
        "title": "Luxury Handbag Market Reaches All-Time High Valuation",
        "date": "3 days ago",
        "category": "Bags",
        "url": "https://www.bloomberg.com/",
        "image_url": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "Robb Report",
        "title": "Cartier Love Bracelet Celebrates 50 Years of Iconic Design",
        "date": "4 days ago",
        "category": "Jewelry",
        "url": "https://robbreport.com/",
        "image_url": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "Hodinkee",
        "title": "Rolex Submariner Demand Continues to Surge in Secondary Markets",
        "date": "5 days ago",
        "category": "Watches",
        "url": "https://www.hodinkee.com/",
        "image_url": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "WWD",
        "title": "Chanel Announces Price Increase Across Classic Flap Collection",
        "date": "6 days ago",
        "category": "Bags",
        "url": "https://wwd.com/",
        "image_url": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "JCK Online",
        "title": "Van Cleef & Arpels Alhambra Collection Sees Strong Collector Interest",
        "date": "1 week ago",
        "category": "Jewelry",
        "url": "https://www.jckonline.com/",
        "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    },
    {
        "source": "Luxury Daily",
        "title": "Audemars Piguet Royal Oak Celebrates 50th Anniversary",
        "date": "1 week ago",
        "category": "Watches",
        "url": "https://www.luxurydaily.com/",
        "image_url": "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=400&h=300&fit=crop&q=80",
        "published_at": datetime.now(timezone.utc)
    }
]


async def seed_luxury_items():
    """
    Seed the luxury_items collection with initial data
    """
    try:
        # Connect to MongoDB
        logger.info("Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(settings.mongodb_uri)
        db = client.get_default_database()
        collection = db["luxury_items"]
        
        # Check if collection already has data
        existing_count = await collection.count_documents({})
        if existing_count > 0:
            logger.warning(f"Collection 'luxury_items' already has {existing_count} documents.")
            response = input("Do you want to clear existing data and reseed? (yes/no): ")
            if response.lower() == 'yes':
                logger.info("Clearing existing luxury items...")
                await collection.delete_many({})
            else:
                logger.info("Skipping seed operation.")
                client.close()
                return
        
        # Insert luxury items
        logger.info(f"Inserting {len(LUXURY_ITEMS)} luxury items...")
        result = await collection.insert_many(LUXURY_ITEMS)
        logger.info(f"Successfully inserted {len(result.inserted_ids)} luxury items")
        
        # Create indexes for better query performance
        logger.info("Creating indexes...")
        await collection.create_index("brand")
        await collection.create_index("category")
        await collection.create_index("mentions_30_days")
        await collection.create_index([("brand", "text"), ("model", "text")])
        logger.info("Indexes created successfully")
        
        # Display inserted items
        logger.info("\n=== Inserted Luxury Items ===")
        for item in LUXURY_ITEMS:
            logger.info(f"  - {item['brand']} {item['model']} ({item['category']})")
        
        logger.info("\n✅ Database seeding completed successfully!")
        
        # Close connection
        client.close()
        
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        raise


async def clear_luxury_items():
    """
    Clear all luxury items from the database
    """
    try:
        logger.info("Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(settings.mongodb_uri)
        db = client.get_default_database()
        collection = db["luxury_items"]
        
        result = await collection.delete_many({})
        logger.info(f"Deleted {result.deleted_count} luxury items")
        
        client.close()
        
    except Exception as e:
        logger.error(f"Error clearing database: {e}")
        raise


async def seed_market_news():
    """
    Seed the market_news collection with initial data
    """
    try:
        # Connect to MongoDB
        logger.info("Connecting to MongoDB Atlas...")
        client = AsyncIOMotorClient(settings.mongodb_uri)
        db = client.get_default_database()
        collection = db["market_news"]
        
        # Check if collection already has data
        existing_count = await collection.count_documents({})
        if existing_count > 0:
            logger.warning(f"Collection 'market_news' already has {existing_count} documents.")
            response = input("Do you want to clear existing data and reseed? (yes/no): ")
            if response.lower() == 'yes':
                logger.info("Clearing existing market news...")
                await collection.delete_many({})
            else:
                logger.info("Skipping seed operation.")
                client.close()
                return
        
        # Insert market news
        logger.info(f"Inserting {len(MARKET_NEWS)} market news articles...")
        result = await collection.insert_many(MARKET_NEWS)
        logger.info(f"Successfully inserted {len(result.inserted_ids)} market news articles")
        
        # Create indexes for better query performance
        logger.info("Creating indexes...")
        await collection.create_index([("published_at", -1)])
        logger.info("Indexes created successfully")
        
        # Display inserted articles
        logger.info("\n=== Inserted Market News ===")
        for article in MARKET_NEWS:
            logger.info(f"  - {article['title']} ({article['source']})")
        
        logger.info("\n✅ Market news seeding completed successfully!")
        
        # Close connection
        client.close()
        
    except Exception as e:
        logger.error(f"Error seeding market news: {e}")
        raise


async def seed_all():
    """
    Seed all collections (luxury items and market news)
    """
    logger.info("=== Starting full database seed ===\n")
    await seed_luxury_items()
    logger.info("\n")
    await seed_market_news()
    logger.info("\n=== All seeding completed! ===")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "clear":
            asyncio.run(clear_luxury_items())
        elif sys.argv[1] == "news":
            asyncio.run(seed_market_news())
        elif sys.argv[1] == "all":
            asyncio.run(seed_all())
        else:
            logger.info("Usage: python -m app.utils.seed_data [clear|news|all]")
    else:
        asyncio.run(seed_luxury_items())
