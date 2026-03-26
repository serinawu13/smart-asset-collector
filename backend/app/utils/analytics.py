"""Analytics utilities for portfolio performance calculations"""
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
import math


def calculate_portfolio_totals(assets: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Calculate portfolio totals from asset list
    
    Args:
        assets: List of portfolio assets with item details
        
    Returns:
        Dictionary with totalValue, totalCost, totalGain, totalGainPercent
    """
    if not assets:
        return {
            "totalValue": 0,
            "totalCost": 0,
            "totalGain": 0,
            "totalGainPercent": 0
        }
    
    total_value = sum(asset.get("currentMarketValue", 0) for asset in assets)
    total_cost = sum(asset.get("purchasePrice", 0) for asset in assets)
    total_gain = total_value - total_cost
    total_gain_percent = (total_gain / total_cost * 100) if total_cost > 0 else 0
    
    return {
        "totalValue": round(total_value, 2),
        "totalCost": round(total_cost, 2),
        "totalGain": round(total_gain, 2),
        "totalGainPercent": round(total_gain_percent, 2)
    }


def generate_timeframe_data_points(timeframe: str) -> tuple:
    """
    Generate appropriate number of data points and labels for timeframe
    
    Args:
        timeframe: One of 1D, 1W, 1M, YTD, 1Y, 5Y, 10Y, ALL
        
    Returns:
        Tuple of (num_points, label_format, days_back)
    """
    timeframe_config = {
        "1D": (24, "hour", 1),      # 24 hourly points
        "1W": (7, "day", 7),         # 7 daily points
        "1M": (30, "day", 30),       # 30 daily points
        "YTD": (None, "month", None), # Variable based on current date
        "1Y": (12, "month", 365),    # 12 monthly points
        "5Y": (60, "month", 1825),   # 60 monthly points
        "10Y": (120, "month", 3650), # 120 monthly points
        "ALL": (120, "month", 3650)  # 120 monthly points (default to 10Y)
    }
    
    return timeframe_config.get(timeframe, timeframe_config["1Y"])


def calculate_ytd_days():
    """Calculate days from start of year to today"""
    today = datetime.now().date()
    start_of_year = date(today.year, 1, 1)
    return (today - start_of_year).days + 1


def generate_chart_data(
    current_value: float,
    trend_percentage: float,
    timeframe: str,
    purchase_date: date = None
) -> List[Dict[str, Any]]:
    """
    Generate mock historical chart data based on current value and trend
    
    Args:
        current_value: Current market value
        trend_percentage: Trend percentage (positive or negative)
        timeframe: One of 1D, 1W, 1M, YTD, 1Y, 5Y, 10Y, ALL
        purchase_date: Optional purchase date to limit historical data
        
    Returns:
        List of chart data points with label and value
    """
    num_points, label_format, days_back = generate_timeframe_data_points(timeframe)
    
    # Handle YTD specially
    if timeframe == "YTD":
        days_back = calculate_ytd_days()
        num_points = min(days_back, 12)  # Monthly points up to current month
    
    # If purchase date is provided, limit historical data
    if purchase_date:
        days_since_purchase = (datetime.now().date() - purchase_date).days
        if days_back and days_since_purchase < days_back:
            days_back = days_since_purchase
            # Adjust number of points proportionally
            if timeframe == "1D":
                num_points = min(24, days_since_purchase * 24)
            elif timeframe in ["1W", "1M"]:
                num_points = min(num_points, days_since_purchase)
            else:
                num_points = max(2, int(num_points * days_since_purchase / (days_back or 365)))
    
    # Calculate start value based on trend
    # If trend is +2.4%, the value has grown 2.4% over the timeframe
    # So start_value = current_value / (1 + trend_percentage/100)
    trend_multiplier = 1 + (trend_percentage / 100)
    start_value = current_value / trend_multiplier if trend_multiplier != 0 else current_value
    
    # Generate data points with realistic variance
    chart_data = []
    for i in range(num_points):
        progress = i / (num_points - 1) if num_points > 1 else 1
        
        # Linear interpolation with some random variance
        base_value = start_value + (current_value - start_value) * progress
        
        # Add realistic market variance (±2% random fluctuation)
        variance = math.sin(i * 0.5) * 0.02 * base_value  # Sinusoidal variance
        value = base_value + variance
        
        # Ensure value doesn't go negative
        value = max(value, 0)
        
        # Generate label based on format
        label = generate_label(i, num_points, label_format, timeframe)
        
        chart_data.append({
            "label": label,
            "value": round(value, 2)
        })
    
    return chart_data


def generate_label(index: int, total_points: int, label_format: str, timeframe: str) -> str:
    """
    Generate appropriate label for chart data point
    
    Args:
        index: Current point index
        total_points: Total number of points
        label_format: Format type (hour, day, month)
        timeframe: Timeframe string
        
    Returns:
        Formatted label string
    """
    now = datetime.now()
    
    if label_format == "hour":
        # For 1D, show hours
        hours_ago = total_points - index - 1
        time = now - timedelta(hours=hours_ago)
        return time.strftime("%I%p").lstrip("0")  # e.g., "9AM", "3PM"
    
    elif label_format == "day":
        # For 1W and 1M, show days
        days_ago = total_points - index - 1
        date_obj = now - timedelta(days=days_ago)
        if timeframe == "1W":
            return date_obj.strftime("%a")  # e.g., "Mon", "Tue"
        else:
            return date_obj.strftime("%b %d")  # e.g., "Jan 15"
    
    elif label_format == "month":
        # For longer timeframes, show months/years
        if timeframe == "YTD":
            months_ago = total_points - index - 1
            date_obj = now - timedelta(days=months_ago * 30)
            return date_obj.strftime("%b")  # e.g., "Jan", "Feb"
        elif timeframe == "1Y":
            months_ago = total_points - index - 1
            date_obj = now - timedelta(days=months_ago * 30)
            return date_obj.strftime("%b")  # e.g., "Jan", "Feb"
        else:
            # For 5Y, 10Y, ALL - show years
            years_ago = (total_points - index - 1) / 12
            year = now.year - int(years_ago)
            return str(year)
    
    return str(index)


def calculate_timeframe_change(
    chart_data: List[Dict[str, Any]]
) -> tuple:
    """
    Calculate change over the timeframe from chart data
    
    Args:
        chart_data: List of chart data points
        
    Returns:
        Tuple of (change_amount, change_percent)
    """
    if not chart_data or len(chart_data) < 2:
        return 0, 0
    
    start_value = chart_data[0]["value"]
    end_value = chart_data[-1]["value"]
    
    change = end_value - start_value
    change_percent = (change / start_value * 100) if start_value > 0 else 0
    
    return round(change, 2), round(change_percent, 2)


def calculate_asset_metrics(
    current_value: float,
    purchase_price: float,
    retail_price: float = None
) -> Dict[str, float]:
    """
    Calculate individual asset performance metrics
    
    Args:
        current_value: Current market value
        purchase_price: Original purchase price
        retail_price: Optional retail price for comparison
        
    Returns:
        Dictionary with performance metrics
    """
    total_gain = current_value - purchase_price
    total_roi = (total_gain / purchase_price * 100) if purchase_price > 0 else 0
    
    metrics = {
        "currentValue": round(current_value, 2),
        "purchasePrice": round(purchase_price, 2),
        "totalGain": round(total_gain, 2),
        "totalROI": round(total_roi, 2)
    }
    
    if retail_price:
        market_vs_retail = current_value - retail_price
        market_vs_retail_percent = (market_vs_retail / retail_price * 100) if retail_price > 0 else 0
        metrics["marketVsRetail"] = round(market_vs_retail, 2)
        metrics["marketVsRetailPercent"] = round(market_vs_retail_percent, 2)
    
    return metrics
