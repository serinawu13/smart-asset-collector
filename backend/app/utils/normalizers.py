import re
from typing import Optional

# Hermès bag width (inches) → size (cm) lookup table
_WIDTH_TO_CM: dict[float, int] = {9.8: 25, 11.8: 30, 13.8: 35, 15.7: 40}
_KNOWN_SIZES: set[int] = {25, 30, 35, 40}

# Vestiaire text condition → internal scale
_VESTIAIRE_CONDITION_MAP: dict[str, str] = {
    "excellent": "Excellent",
    "never worn": "Excellent",
    "never worn, with tag": "Excellent",
    "never worn with tag": "Excellent",
    "pristine": "Excellent",
    "very good": "Very Good",
    "good": "Good",
    "fair": "Fair",
}


def extract_hermes_size_cm(
    title: str,
    attributes: Optional[list] = None,
    size_field: Optional[str] = None,
) -> Optional[int]:
    """Return Hermès bag size in cm from a listing title, a flat size string, or an attributes array."""
    if size_field:
        m = re.search(r'(\d+)', str(size_field))
        if m:
            size = int(m.group(1))
            if size in _KNOWN_SIZES:
                return size

    match = re.search(r'(?:birkin|kelly)\s*(\d+)', title or '', re.IGNORECASE)
    if match:
        size = int(match.group(1))
        if size in _KNOWN_SIZES:
            return size

    for attr in (attributes or []):
        name = (attr.get("attributeName") or "").lower()
        value = attr.get("attributeValue") or ""
        if "width" in name:
            inch_match = re.search(r'([\d.]+)', value)
            if inch_match:
                width = float(inch_match.group(1))
                for inch_val, cm_val in _WIDTH_TO_CM.items():
                    if abs(width - inch_val) < 0.5:
                        return cm_val
    return None


def normalize_vestiaire_condition(condition_str: str) -> str:
    """Map a listing's text condition label to the internal condition scale."""
    key = (condition_str or "").lower().strip()
    return _VESTIAIRE_CONDITION_MAP.get(key, "Good")


def extract_hermes_color(title: str, attributes: Optional[list] = None) -> Optional[str]:
    """Extract color from a listing's attributes array; returns None if absent."""
    for attr in (attributes or []):
        name = (attr.get("attributeName") or "").lower()
        value = (attr.get("attributeValue") or "").strip()
        if ("color" in name or "colour" in name) and value:
            return value
    return None


def extract_hardware(title: str, attributes: Optional[list] = None) -> Optional[str]:
    """Extract hardware color from a listing's attributes array or the title string."""
    for attr in (attributes or []):
        name = (attr.get("attributeName") or "").lower()
        value = (attr.get("attributeValue") or "").strip()
        if "hardware" in name and value:
            return value

    text = (title or "").lower()
    if "palladium" in text:
        return "Palladium Hardware"
    if "gold" in text:
        return "Gold Hardware"
    return None
