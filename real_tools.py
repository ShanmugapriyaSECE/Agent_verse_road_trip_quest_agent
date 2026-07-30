"""
real_tools.py

Drop-in replacements for three remaining mock functions in planner_agent.py:
    - get_weather_forecast(location, start_date, end_date)
    - search_transport_options(origin, destination, travel_date, mode)
    - search_accommodations(location, stay_type, room_count, budget_limit, total_days)

Same function names, same argument order, same return shape as the originals,
so planner_agent.py only needs one changed import line.

Backed by:
    - OpenWeatherMap (real weather)
    - OSRM (real driving distance/duration, free, no key) + a transparent
      cost-per-km formula for an honest cost ESTIMATE (no real fare API
      exists for free in India, so this is calculated, not fabricated)
    - Geoapify Places API (real hotel/resort names near destination;
      no live pricing on the free tier, same honest limitation as Scout's
      food avg_cost)

Falls back to the original-style mock data if a key is missing or a
request fails, so the Planner never crashes mid-demo.
"""

import os
import requests
from typing import Dict, Any, List, Tuple, Optional
from dotenv import load_dotenv

load_dotenv()
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")

_geocode_cache: Dict[str, Tuple[float, float]] = {}

# Rough fuel-cost-per-km estimate for a car in India (INR). Transparent,
# adjustable, and clearly a calculated estimate rather than a fabricated flat fee.
COST_PER_KM_BY_MODE = {
    "car": 12.0,
    "bus": 3.0,
    "train": 2.5,
    "bike": 4.0,
}


def _geocode_location(location: str) -> Optional[Tuple[float, float]]:
    if location in _geocode_cache:
        return _geocode_cache[location]
    if not GEOAPIFY_API_KEY:
        return None
    try:
        response = requests.get(
            "https://api.geoapify.com/v1/geocode/search",
            params={"text": location, "limit": 1, "apiKey": GEOAPIFY_API_KEY},
            timeout=15,
        )
        response.raise_for_status()
        features = response.json().get("features", [])
        if not features:
            return None
        lon, lat = features[0]["geometry"]["coordinates"]
        _geocode_cache[location] = (lat, lon)
        return (lat, lon)
    except (requests.RequestException, KeyError, IndexError):
        return None


# ---------------------------------------------------------------------------
# WEATHER
# ---------------------------------------------------------------------------

def get_weather_forecast(location: str, start_date: str, end_date: str) -> Dict[str, Any]:
    """Real replacement using OpenWeatherMap current weather (free tier has no
    long-range date-specific forecast, so this returns current conditions as
    the best available real signal, clearly labeled as such)."""
    fallback = {
        "location": location,
        "start_date": start_date,
        "end_date": end_date,
        "forecast": f"Pleasant and mostly sunny weather expected in {location} between {start_date} and {end_date}.",
        "advisory": "Light jacket recommended for cool evenings.",
    }

    if not OPENWEATHER_API_KEY:
        return fallback

    try:
        response = requests.get(
            "https://api.openweathermap.org/data/2.5/weather",
            params={"q": location, "appid": OPENWEATHER_API_KEY, "units": "metric"},
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()

        temp = data["main"]["temp"]
        feels_like = data["main"]["feels_like"]
        condition = data["weather"][0]["description"]
        humidity = data["main"]["humidity"]

        advisory = "Light jacket recommended for cool evenings."
        if "rain" in condition.lower():
            advisory = "Rain expected — pack a rain jacket and check road conditions in ghat sections."
        elif temp >= 30:
            advisory = "Warm conditions — stay hydrated and plan outdoor stops for morning/evening."
        elif temp <= 15:
            advisory = "Cool conditions — pack warm layers, especially for early morning viewpoints."

        return {
            "location": location,
            "start_date": start_date,
            "end_date": end_date,
            "forecast": f"Current conditions in {location}: {condition}, {temp}°C (feels like {feels_like}°C), {humidity}% humidity. Note: this reflects current weather, not a date-specific forecast for {start_date}-{end_date}, since precise multi-day forecasts require a paid tier.",
            "advisory": advisory,
        }
    except (requests.RequestException, KeyError, IndexError):
        return fallback


# ---------------------------------------------------------------------------
# TRANSPORT
# ---------------------------------------------------------------------------

def search_transport_options(origin: str, destination: str, travel_date: str, mode: str) -> Dict[str, Any]:
    """Real replacement using OSRM for actual driving distance/duration,
    plus a transparent cost-per-km estimate (no free real-fare API exists)."""
    fallback = {
        "origin": origin,
        "destination": destination,
        "travel_date": travel_date,
        "mode": mode,
        "details": f"Express {mode.capitalize()} service from {origin} to {destination}",
        "cost": 150.0,
    }

    origin_coords = _geocode_location(origin)
    dest_coords = _geocode_location(destination)
    if origin_coords is None or dest_coords is None:
        return fallback

    try:
        o_lat, o_lon = origin_coords
        d_lat, d_lon = dest_coords
        response = requests.get(
            f"https://router.project-osrm.org/route/v1/driving/{o_lon},{o_lat};{d_lon},{d_lat}",
            params={"overview": "false"},
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()
        if data.get("code") != "Ok" or not data.get("routes"):
            return fallback

        route = data["routes"][0]
        distance_km = round(route["distance"] / 1000, 1)
        duration_hr = round(route["duration"] / 3600, 1)

        cost_per_km = COST_PER_KM_BY_MODE.get(mode.lower(), COST_PER_KM_BY_MODE["car"])
        estimated_cost = round(distance_km * cost_per_km, 2)

        return {
            "origin": origin,
            "destination": destination,
            "travel_date": travel_date,
            "mode": mode,
            "details": f"{mode.capitalize()} from {origin} to {destination}: ~{distance_km} km, ~{duration_hr} hr drive time (real route data via OSRM). Cost is an estimate (₹{cost_per_km}/km), not a live fare quote.",
            "cost": estimated_cost,
        }
    except (requests.RequestException, KeyError, IndexError):
        return fallback


# ---------------------------------------------------------------------------
# ACCOMMODATION
# ---------------------------------------------------------------------------

def search_accommodations(location: str, stay_type: str, room_count: int, budget_limit: float, total_days: int) -> List[Dict[str, Any]]:
    """Real replacement using Geoapify Places API for real hotel/resort names.
    No live pricing on the free tier — cost_per_night stays an honest estimate
    derived from the user's own budget, not a fabricated hotel rate."""
    per_night_budget = (budget_limit / max(total_days, 1)) if total_days > 0 else budget_limit

    fallback = [
        {
            "name": f"Grand {stay_type.capitalize()} {location}",
            "cost_per_night": min(120.0, per_night_budget),
            "reason": f"Fits budget and room requirements ({room_count} rooms).",
        },
        {
            "name": f"Comfort Suites {location}",
            "cost_per_night": min(85.0, per_night_budget * 0.8),
            "reason": "Budget-friendly with good accessibility.",
        },
    ]

    if not GEOAPIFY_API_KEY:
        return fallback

    coords = _geocode_location(location)
    if coords is None:
        return fallback

    try:
        lat, lon = coords
        response = requests.get(
            "https://api.geoapify.com/v2/places",
            params={
                "categories": "accommodation",  # umbrella category — covers hotel, guest_house, hostel, motel, etc. ("accommodation.resort" is not a valid Geoapify category)
                "filter": f"circle:{lon},{lat},15000",
                "limit": 5,
                "apiKey": GEOAPIFY_API_KEY,
            },
            timeout=20,
        )
        response.raise_for_status()
        features = response.json().get("features", [])

        results = []
        for feature in features:
            props = feature.get("properties", {})
            name = props.get("name")
            if not name:
                continue
            results.append({
                "name": name,
                # Real name, but no live price data on free tier — this is
                # a budget-derived estimate, not the hotel's real rate.
                "cost_per_night": round(min(120.0, per_night_budget), 2),
                "reason": f"Real listing near {location}, matched to your budget (exact live pricing not available on free API tier).",
            })

        return results if results else fallback

    except (requests.RequestException, KeyError, IndexError):
        return fallback


if __name__ == "__main__":
    print("=== get_weather_forecast('Munnar', '2026-08-10', '2026-08-12') ===")
    print(get_weather_forecast("Munnar", "2026-08-10", "2026-08-12"))

    print("\n=== search_transport_options('Chennai', 'Munnar', '2026-08-10', 'car') ===")
    print(search_transport_options("Chennai", "Munnar", "2026-08-10", "car"))

    print("\n=== search_accommodations('Munnar', 'resort', 1, 500.0, 3) ===")
    for hotel in search_accommodations("Munnar", "resort", 1, 500.0, 3):
        print(hotel)