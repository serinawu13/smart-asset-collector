import re
import logging
from typing import Optional
from statistics import median
from datetime import datetime, timezone
import httpx
from apify_client import ApifyClientAsync
from app.config import settings
from app.models.market_listing import MarketListingModel
from app.utils.normalizers import (
    extract_hermes_size_cm,
    normalize_vestiaire_condition,
    extract_hardware,
)

logger = logging.getLogger(__name__)

APIFY_ACTOR_ID = "parseforge/vestiairecollective-scraper"
APIFY_SYNC_URL = (
    "https://api.apify.com/v2/acts/parseforge~vestiairecollective-scraper"
    "/run-sync-get-dataset-items"
)

BRANDS_TO_SCRAPE = [
    {"query": "hermes+bag",  "brand_match": "Hermès"},
    {"query": "chanel+bag",  "brand_match": "Chanel"},
    {"query": "prada+bag",   "brand_match": "Prada"},
]

MAX_ITEMS_PER_BRAND = 20


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def parse_price(price) -> Optional[float]:
    """Coerce a price value (number or formatted string) into a float."""
    if price is None or price == "":
        return None
    if isinstance(price, (int, float)):
        return float(price)
    cleaned = re.sub(r"[^\d.]", "", str(price))
    return float(cleaned) if cleaned else None


def normalize(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def find_existing_item(brand: str, title: str, db_items: list) -> Optional[dict]:
    nb = normalize(brand)
    nt = normalize(title)
    for item in db_items:
        if normalize(item["brand"]) == nb:
            m = normalize(item["model"])
            if m and (m in nt or nt in m):
                return item
    return None


def compute_trend(market: float, retail: Optional[float]) -> tuple:
    if not retail or retail <= 0:
        return "stable", 0.0
    pct = ((market - retail) / retail) * 100
    if pct > 2:
        return "up", round(pct, 1)
    if pct < -2:
        return "down", round(abs(pct), 1)
    return "stable", round(abs(pct), 1)


def _vestiaire_search_url(query: str) -> str:
    return f"https://www.vestiairecollective.com/search/?q={query}"


def _vestiaire_run_input(query: str, max_items: int) -> dict:
    return {
        "startUrl": _vestiaire_search_url(query),
        "maxItems": max_items,
        "includeDetails": True,
        "proxyConfiguration": {
            "useApifyProxy": True,
            "apifyProxyGroups": ["RESIDENTIAL"],
            "apifyProxyCountry": "US",
        },
    }


# ---------------------------------------------------------------------------
# Main refresh function
# ---------------------------------------------------------------------------

async def run_bag_refresh(db) -> dict:
    token = settings.apify_token
    if not token:
        raise ValueError("APIFY_TOKEN is not configured")

    logger.info(
        f"Starting Vestiaire bag scrape — {len(BRANDS_TO_SCRAPE)} brands, "
        f"maxItems={MAX_ITEMS_PER_BRAND} per brand"
    )

    scraped_items: list = []
    async with httpx.AsyncClient(timeout=600.0) as client:
        for b in BRANDS_TO_SCRAPE:
            payload = _vestiaire_run_input(b["query"], MAX_ITEMS_PER_BRAND)
            resp = await client.post(
                APIFY_SYNC_URL,
                params={"token": token},
                json=payload,
            )
            resp.raise_for_status()
            batch = resp.json()
            logger.info(f"  {b['query']}: {len(batch)} items")
            scraped_items.extend(batch)

    logger.info(f"Vestiaire returned {len(scraped_items)} items total")

    collection = db["luxury_items"]
    existing_cursor = collection.find({"category": "Bag"})
    existing_items = await existing_cursor.to_list(length=None)

    # Accumulate prices per existing item (_id → list of prices)
    price_accumulator: dict = {}   # str(item_id) → {"item": doc, "prices": [], "retail": None, "image": None}
    # New items keyed by normalize(brand)+normalize(title)
    new_candidates: dict = {}

    skipped = 0

    for result in scraped_items:
        brand = (result.get("brand") or "").strip()
        title = (result.get("title") or "").strip()
        final_price = parse_price(result.get("price"))
        original_price = parse_price(result.get("originalPrice"))
        images = result.get("images") or []
        image = images[0] if images else result.get("imageUrl")

        if not final_price or not brand or not title:
            skipped += 1
            continue

        existing = find_existing_item(brand, title, existing_items)

        if existing:
            key = str(existing["_id"])
            if key not in price_accumulator:
                price_accumulator[key] = {
                    "item": existing,
                    "prices": [],
                    "retail": None,
                    "image": None,
                }
            price_accumulator[key]["prices"].append(final_price)
            if original_price and not price_accumulator[key]["retail"]:
                price_accumulator[key]["retail"] = original_price
            if image and not price_accumulator[key]["image"]:
                price_accumulator[key]["image"] = image
        else:
            key = normalize(brand) + "|" + normalize(title)
            if key not in new_candidates:
                new_candidates[key] = {
                    "brand": brand,
                    "model": title,
                    "prices": [],
                    "retail": original_price,
                    "image": image,
                    "material": result.get("material"),
                    "size": result.get("size"),
                    "color": result.get("color"),
                }
            new_candidates[key]["prices"].append(final_price)
            if original_price and not new_candidates[key]["retail"]:
                new_candidates[key]["retail"] = original_price

    # --- Update existing items ---
    updated = 0
    for key, data in price_accumulator.items():
        avg_price = round(sum(data["prices"]) / len(data["prices"]), 2)
        trend, trend_pct = compute_trend(avg_price, data["retail"])
        update_fields: dict = {
            "current_market_value": avg_price,
            "trend": trend,
            "trend_percentage": trend_pct,
        }
        if data["retail"]:
            update_fields["retail_price"] = data["retail"]
        if data["image"]:
            update_fields["image_url"] = data["image"]

        await collection.update_one(
            {"_id": data["item"]["_id"]},
            {"$set": update_fields},
        )
        logger.info(f"Updated {data['item']['brand']} {data['item']['model']} → ${avg_price}")
        updated += 1

    # --- Create new items (catalog discovery) ---
    created = 0
    for key, data in new_candidates.items():
        if not data["prices"]:
            continue

        # Deduplicate against DB (in case a prior refresh already added this)
        dup = await collection.find_one({
            "brand": {"$regex": f"^{re.escape(data['brand'])}$", "$options": "i"},
            "model": {"$regex": f"^{re.escape(data['model'])}$", "$options": "i"},
        })
        if dup:
            skipped += 1
            continue

        avg_price = round(sum(data["prices"]) / len(data["prices"]), 2)
        trend, trend_pct = compute_trend(avg_price, data["retail"])

        new_doc = {
            "brand": data["brand"],
            "model": data["model"],
            "category": "Bag",
            "current_market_value": avg_price,
            "retail_price": data["retail"],
            "trend": trend,
            "trend_percentage": trend_pct,
            "image_url": data["image"],
            "material": data["material"],
            "size": data["size"],
            "color": data["color"],
            "mentions_30_days": 0,
        }
        await collection.insert_one(new_doc)
        logger.info(f"Created new item: {data['brand']} {data['model']} @ ${avg_price}")
        created += 1

    return {"updated": updated, "created": created, "skipped": skipped}


# ---------------------------------------------------------------------------
# Hermès Birkin / Kelly — Vestiaire pipeline
# ---------------------------------------------------------------------------

_HERMES_QUERIES = ["hermes+birkin", "hermes+kelly"]
_MAX_HERMES_ITEMS = 50


async def scrape_hermes_vestiaire(apify_token: str) -> list[dict]:
    """Call the Apify Vestiaire actor for Hermès Birkin + Kelly listings (one run per query)."""
    logger.info(
        f"Starting Hermès Vestiaire scrape — {len(_HERMES_QUERIES)} queries, "
        f"maxItems={_MAX_HERMES_ITEMS} per query"
    )
    client = ApifyClientAsync(apify_token)
    items: list[dict] = []

    for query in _HERMES_QUERIES:
        run_input = _vestiaire_run_input(query, _MAX_HERMES_ITEMS)
        actor_client = client.actor(APIFY_ACTOR_ID)
        run = await actor_client.call(run_input=run_input)
        dataset_id = run["defaultDatasetId"] if run else None
        if not dataset_id:
            logger.warning(f"  {query}: actor returned no dataset id")
            continue
        result = await client.dataset(dataset_id).list_items()
        batch = list(result.items)
        logger.info(f"  {query}: {len(batch)} raw items")
        if batch:
            sample = batch[0]
            logger.info(f"  {query} sample keys: {sorted(sample.keys())}")
            logger.info(f"  {query} sample item (truncated): {str(sample)[:1500]}")
        items.extend(batch)

    logger.info(f"Vestiaire returned {len(items)} raw Hermès listings total")
    return items


def _coerce_str(value) -> str:
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, dict):
        for k in ("name", "label", "value", "text"):
            v = value.get(k)
            if isinstance(v, str) and v.strip():
                return v.strip()
    return ""


def _coerce_brand(raw: dict) -> str:
    for key in ("brand", "brandName", "designer"):
        v = raw.get(key)
        s = _coerce_str(v)
        if s:
            return s
    return ""


def _coerce_title(raw: dict) -> str:
    for key in ("title", "name", "productName", "model", "description"):
        v = raw.get(key)
        s = _coerce_str(v)
        if s:
            return s
    return ""


def _coerce_url(raw: dict) -> str:
    for key in ("productUrl", "url", "link", "productLink", "permalink", "href"):
        v = raw.get(key)
        if isinstance(v, str) and v.startswith("http"):
            return v
    return ""


def _coerce_price(raw: dict, keys: tuple) -> Optional[float]:
    for key in keys:
        v = raw.get(key)
        if v is None or v == "":
            continue
        if isinstance(v, (int, float)) and v > 0:
            return float(v)
        if isinstance(v, dict):
            for sub in ("amount", "value", "cents"):
                inner = v.get(sub)
                if isinstance(inner, (int, float)) and inner > 0:
                    return float(inner) / 100 if sub == "cents" else float(inner)
        parsed = parse_price(v)
        if parsed:
            return parsed
    return None


def _coerce_images(raw: dict) -> list[str]:
    for key in ("images", "pictures", "imageUrls", "gallery"):
        arr = raw.get(key)
        if isinstance(arr, list) and arr:
            out: list[str] = []
            for img in arr:
                if isinstance(img, str):
                    out.append(img)
                elif isinstance(img, dict):
                    u = img.get("url") or img.get("src") or img.get("href") or img.get("large") or img.get("medium")
                    if isinstance(u, str):
                        out.append(u)
            if out:
                return out
    single = raw.get("imageUrl") or raw.get("image") or raw.get("thumbnail") or raw.get("cover")
    if isinstance(single, str):
        return [single]
    if isinstance(single, dict):
        u = single.get("url") or single.get("src")
        if isinstance(u, str):
            return [u]
    return []


_REJECT_KEYWORDS = ("watch", "wallet", "purse", "bracelet", "belt", "scarf", "charm", "ring", "earring", "necklace")


def normalize_vestiaire_listing(raw: dict) -> Optional[MarketListingModel]:
    """Normalize a single Vestiaire result into a MarketListingModel. Returns None if not a Birkin/Kelly bag."""
    title = _coerce_title(raw)
    brand = _coerce_brand(raw)

    combined = (brand + " " + title).lower()
    combined_ascii = combined.replace("è", "e").replace("é", "e")
    if "hermes" not in combined_ascii:
        return None

    title_lower = title.lower()
    if "birkin" in title_lower:
        model = "Birkin"
    elif "kelly" in title_lower:
        model = "Kelly"
    else:
        return None

    # Reject non-bag products that happen to share the Birkin/Kelly name (watch, wallet, bracelet, …).
    category_field = _coerce_str(raw.get("category")).lower()
    if any(kw in title_lower for kw in _REJECT_KEYWORDS):
        return None
    if category_field and "bag" not in category_field and "handbag" not in category_field:
        # Allow when category is empty/unknown, but exclude explicit non-bag categories.
        return None

    final_price = _coerce_price(raw, ("price", "priceWithoutDuty", "salePrice", "currentPrice", "priceUsd"))
    if not final_price:
        return None

    listing_url = _coerce_url(raw)
    if not listing_url:
        return None

    images = _coerce_images(raw)

    sold_flag = bool(raw.get("sold")) or "sold" in title_lower

    return MarketListingModel(
        source="vestiaire",
        category="Bag",
        brand="Hermès",
        model=model,
        size_cm=extract_hermes_size_cm(title, size_field=_coerce_str(raw.get("size"))),
        color=(_coerce_str(raw.get("color")) or None),
        material=(_coerce_str(raw.get("material")) or None),
        hardware=extract_hardware(title),
        condition=normalize_vestiaire_condition(_coerce_str(raw.get("condition"))),
        price_usd=final_price,
        retail_price=_coerce_price(raw, ("originalPrice", "retailPrice", "msrp")),
        sold=sold_flag,
        listing_url=listing_url,
        images=images[:3],
        scraped_at=datetime.now(timezone.utc),
        specifications={},
        raw_data=raw,
    )


async def upsert_market_listings(db, listings: list[MarketListingModel]) -> dict:
    """Upsert normalized listings into the market_listings collection."""
    collection = db["market_listings"]
    inserted = 0
    updated = 0

    for listing in listings:
        doc = {
            "source": listing.source,
            "category": listing.category,
            "brand": listing.brand,
            "model": listing.model,
            "size_cm": listing.size_cm,
            "color": listing.color,
            "material": listing.material,
            "hardware": listing.hardware,
            "condition": listing.condition,
            "price_usd": listing.price_usd,
            "retail_price": listing.retail_price,
            "sold": listing.sold,
            "listing_url": listing.listing_url,
            "images": listing.images,
            "scraped_at": listing.scraped_at,
            "specifications": listing.specifications,
            "raw_data": listing.raw_data,
        }
        result = await collection.update_one(
            {"source": listing.source, "listing_url": listing.listing_url},
            {"$set": doc},
            upsert=True,
        )
        if result.upserted_id:
            inserted += 1
        else:
            updated += 1

    logger.info(f"market_listings upsert: {inserted} inserted, {updated} updated")
    return {"inserted": inserted, "updated": updated}


async def refresh_catalog_from_listings(db) -> dict:
    """
    Aggregate market_listings → upsert luxury_items catalog entries.
    Groups by (brand, model, size_cm) and computes median price across sources.
    """
    listings_col = db["market_listings"]
    items_col = db["luxury_items"]

    pipeline = [
        {"$match": {"brand": "Hermès", "category": "Bag", "sold": False}},
        {"$group": {
            "_id": {"brand": "$brand", "model": "$model", "size_cm": "$size_cm"},
            "prices": {"$push": "$price_usd"},
            "retail_prices": {"$push": "$retail_price"},
            "images": {"$push": {"$arrayElemAt": ["$images", 0]}},
        }},
    ]

    groups = await listings_col.aggregate(pipeline).to_list(length=None)
    created = 0
    updated_count = 0

    for group in groups:
        key = group["_id"]
        brand = key["brand"]
        model_name = key["model"]
        size_cm = key.get("size_cm")

        prices = [p for p in group["prices"] if p and p > 0]
        if not prices:
            continue

        median_price = round(median(prices), 2)
        catalog_model = f"{model_name} {size_cm}" if size_cm else model_name
        size_str = f"{size_cm}cm" if size_cm else None
        retail = next((r for r in group.get("retail_prices", []) if r and r > 0), None)
        image = next((img for img in group.get("images", []) if img), None)
        trend, trend_pct = compute_trend(median_price, retail)

        update_doc = {
            "brand": brand,
            "model": catalog_model,
            "category": "Bag",
            "current_market_value": median_price,
            "trend": trend,
            "trend_percentage": trend_pct,
            "mentions_30_days": 0,
        }
        if size_str:
            update_doc["size"] = size_str
        if retail:
            update_doc["retail_price"] = retail
        if image:
            update_doc["image_url"] = image

        result = await items_col.update_one(
            {"brand": brand, "model": catalog_model, "category": "Bag"},
            {"$set": update_doc},
            upsert=True,
        )
        if result.upserted_id:
            logger.info(f"Created catalog entry: {brand} {catalog_model} @ ${median_price}")
            created += 1
        else:
            logger.info(f"Updated catalog entry: {brand} {catalog_model} → ${median_price}")
            updated_count += 1

    return {"updated": updated_count, "created": created}
