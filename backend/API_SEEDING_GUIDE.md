# API Seeding Guide for Luxury Items

This guide explains how to use the Admin API to seed the luxury items catalogue with more goods.

## Available Admin Endpoints

### 1. Bulk Seed Items
**POST** `/api/v1/admin/items/seed`

Add multiple luxury items at once.

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/items/seed" \
  -H "Content-Type: application/json" \
  -d @seed_items_example.json
```

**Example using Python:**
```python
import requests
import json

# Load items from file
with open('seed_items_example.json', 'r') as f:
    items = json.load(f)

# Send request
response = requests.post(
    'http://localhost:8000/api/v1/admin/items/seed',
    json=items
)

print(response.json())
```

**Example Response:**
```json
{
  "success": true,
  "message": "Successfully inserted 5 luxury items",
  "insertedIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", ...]
}
```

---

### 2. Create Single Item
**POST** `/api/v1/admin/items`

Add one luxury item to the catalogue.

**Example using cURL:**
```bash
curl -X POST "http://localhost:8000/api/v1/admin/items" \
  -H "Content-Type: application/json" \
  -d '{
    "brand": "Rolex",
    "model": "GMT-Master II 126710BLRO",
    "category": "Watch",
    "material": "Oystersteel",
    "size": "40mm",
    "color": "Blue/Red",
    "currentMarketValue": 18500,
    "retailPrice": 10700,
    "trend": "up",
    "trendPercentage": 2.8,
    "mentions30Days": 15200,
    "imageUrl": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&q=80"
  }'
```

**Example using JavaScript/Fetch:**
```javascript
const newItem = {
  brand: "Rolex",
  model: "GMT-Master II 126710BLRO",
  category: "Watch",
  material: "Oystersteel",
  size: "40mm",
  color: "Blue/Red",
  currentMarketValue: 18500,
  retailPrice: 10700,
  trend: "up",
  trendPercentage: 2.8,
  mentions30Days: 15200,
  imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop&q=80"
};

const response = await fetch('http://localhost:8000/api/v1/admin/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newItem)
});

const result = await response.json();
console.log(result);
```

---

### 3. Clear All Items
**DELETE** `/api/v1/admin/items/clear`

⚠️ **Warning:** This deletes ALL items from the catalogue!

**Example using cURL:**
```bash
curl -X DELETE "http://localhost:8000/api/v1/admin/items/clear"
```

---

## Item Schema

Each luxury item must include the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `brand` | string | ✅ | Brand name (1-100 chars) |
| `model` | string | ✅ | Model name (1-200 chars) |
| `category` | string | ✅ | Must be: "Watch", "Bag", or "Jewelry" |
| `material` | string | ❌ | Material (max 100 chars) |
| `size` | string | ❌ | Size (max 50 chars) |
| `color` | string | ❌ | Color (max 50 chars) |
| `currentMarketValue` | number | ✅ | Current market value (must be > 0) |
| `retailPrice` | number | ❌ | Original retail price (must be > 0) |
| `trend` | string | ✅ | Must be: "up", "down", or "stable" |
| `trendPercentage` | number | ✅ | Trend percentage (can be negative) |
| `mentions30Days` | number | ❌ | Mentions in last 30 days (default: 0) |
| `imageUrl` | string | ❌ | Image URL (max 500 chars) |

---

## Integration with External APIs

You can integrate with external luxury goods APIs to automatically populate your catalogue:

### Example: Fetching from External API
```python
import requests

# Fetch from external luxury goods API
external_data = requests.get('https://api.luxurygoods.example/items').json()

# Transform to your schema
items = []
for item in external_data:
    items.append({
        "brand": item['brand_name'],
        "model": item['model_number'],
        "category": item['type'],  # Map to Watch/Bag/Jewelry
        "material": item.get('material'),
        "size": item.get('dimensions'),
        "color": item.get('color'),
        "currentMarketValue": item['market_price'],
        "retailPrice": item.get('msrp'),
        "trend": "stable",  # Calculate based on price history
        "trendPercentage": 0.0,
        "mentions30Days": item.get('popularity', 0),
        "imageUrl": item.get('image_url')
    })

# Seed to your database
response = requests.post(
    'http://localhost:8000/api/v1/admin/items/seed',
    json=items
)
print(f"Seeded {len(items)} items")
```

---

## Testing the API

1. **Start your backend server:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **View API documentation:**
   Open http://localhost:8000/docs in your browser to see interactive API documentation

3. **Test with the example file:**
   ```bash
   curl -X POST "http://localhost:8000/api/v1/admin/items/seed" \
     -H "Content-Type: application/json" \
     -d @seed_items_example.json
   ```

4. **Verify items were added:**
   ```bash
   curl "http://localhost:8000/api/v1/items"
   ```

---

## Image URLs

For `imageUrl`, you can use:
- **Unsplash** (free): `https://images.unsplash.com/photo-{id}?w=800&h=800&fit=crop&q=80`
- **Your own CDN**: Upload product images to your hosting service
- **Placeholder services**: `https://via.placeholder.com/800x800`
- **Brand official images**: Ensure you have rights to use them

---

## Production Considerations

### Security
- Add authentication to admin endpoints (JWT tokens)
- Implement rate limiting
- Validate all input data
- Use HTTPS in production

### Example with Authentication:
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != "your-secret-admin-token":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    return credentials.credentials

# Add to endpoint
@router.post("/items/seed")
async def seed_luxury_items(
    items: List[LuxuryItemCreate],
    token: str = Depends(verify_admin_token)
):
    # ... rest of code
```

---

## Need Help?

- **API Documentation**: http://localhost:8000/docs
- **Check logs**: Look at backend console for error messages
- **Validate JSON**: Use https://jsonlint.com/ to check your JSON format
