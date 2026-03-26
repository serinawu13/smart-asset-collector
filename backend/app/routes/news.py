"""
Market News Routes
Handles market news feed
"""
from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any
from app.database import get_database
from app.schemas.market_news import MarketNewsResponse

router = APIRouter(prefix="/api/v1/news", tags=["news"])


@router.get("", response_model=Dict[str, List[MarketNewsResponse]])
async def get_news(
    limit: int = Query(default=4, ge=1, le=20),
    db = Depends(get_database)
):
    """
    Get market news feed
    
    Args:
        limit: Maximum number of articles to return (default: 4, max: 20)
        db: Database connection
    
    Returns:
        Array of news articles sorted by published_at descending
    """
    # Fetch news articles from database
    cursor = db["market_news"].find().sort("published_at", -1).limit(limit)
    articles = await cursor.to_list(length=limit)
    
    # Format response
    news_list = []
    for article in articles:
        news_list.append(MarketNewsResponse(
            id=str(article["_id"]),
            source=article["source"],
            title=article["title"],
            date=article["date"],
            category=article["category"],
            url=article["url"],
            image_url=article.get("image_url")
        ))
    
    return {"articles": news_list}
