import time
import httpx
from fastapi import APIRouter
from app.config import settings

router = APIRouter(prefix="/api/v1/exchange-rates", tags=["exchange-rates"])

_cache: dict = {"rates": None, "fetched_at": 0.0}
_TTL = 24 * 60 * 60  # 24 hours
_FALLBACK = {"USD": 1.0, "EUR": 0.92, "GBP": 0.79, "CHF": 0.88}


@router.get("")
async def get_exchange_rates():
    now = time.time()
    if _cache["rates"] and (now - _cache["fetched_at"]) < _TTL:
        return {"source": "cache", "rates": _cache["rates"]}

    api_key = settings.exchange_rate_api_key
    if not api_key:
        return {"source": "fallback", "rates": _FALLBACK}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.exchangeratesapi.io/v1/latest",
                params={"access_key": api_key, "symbols": "USD,EUR,GBP,CHF"},
                timeout=10.0,
            )
        resp.raise_for_status()
        data = resp.json()
        if not data.get("success"):
            raise ValueError(data.get("error", {}).get("info", "API error"))

        raw = data["rates"]
        # Free plan base is EUR; normalize everything relative to USD
        usd_rate = raw.get("USD", 1.0)
        rates = {currency: raw[currency] / usd_rate for currency in raw}
        rates["USD"] = 1.0

        _cache["rates"] = rates
        _cache["fetched_at"] = now
        return {"source": "api", "rates": rates}
    except Exception:
        stale = _cache["rates"]
        return {"source": "cache_stale" if stale else "fallback", "rates": stale or _FALLBACK}
