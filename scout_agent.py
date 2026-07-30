"""
scout_agent.py

Scout Agent — real-world POI/food discovery layer.

Drop-in replacement for the mock functions in planner_agent.py:
    - search_places_and_attractions(location, mood_theme)
    - search_food_spots(location, cuisine_preference)

Same function names, same argument order, same return shape as the
originals — so planner_agent.py needs zero changes beyond the import line:

    from scout_agent import search_places_and_attractions, search_food_spots

Backed by:
    - Geoapify Geocoding API (location name -> lat/lon)
    - Geoapify Places API (real POIs/restaurants near that point)

Falls back to the original-style mock data if the API key is missing or
a request fails, so the Planner never crashes mid-demo.
"""

import os
import requests
from typing import Dict, Any, List, Tuple, Optional
from dotenv import load_dotenv

load_dotenv()
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

_geocode_cache: Dict[str, Tuple[float, float]] = {}

# Map rough "mood/theme" words to Geoapify category strings.
# Geoapify has no dedicated "waterfall" category, so attraction/sights/water
# categories are combined to catch them anyway (see test_places.py findings).
MOOD_CATEGORY_MAP = {
    "adventure": "tourism.attraction,natural.water,leisure.park.nature_reserve",
    "waterfalls": "tourism.attraction,natural.water,leisure.park.nature_reserve",
    "nature": "natural.water,leisure.park.nature_reserve,tourism.sights",
    "culture": "tourism.sights,heritage",
    "history": "tourism.sights,heritage",
    "relax": "tourism.sights,leisure.park",
    "food": "catering.restaurant",
}
DEFAULT_CATEGORIES = "tourism.attraction,tourism.sights,natural.water,leisure.park.nature_reserve"


def _geocode_location(location: str) -> Optional[Tuple[float, float]]:
    """Convert a place name (e.g. 'Munnar') into (lat, lon) using Geoapify Geocoding API."""
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


def _query_geoapify_places(lat: float, lon: float, categories: str, radius_m: int = 20000, limit: int = 10) -> List[Dict[str, Any]]:
    response = requests.get(
        "https://api.geoapify.com/v2/places",
        params={
            "categories": categories,
            "filter": f"circle:{lon},{lat},{radius_m}",
            "limit": limit,
            "apiKey": GEOAPIFY_API_KEY,
        },
        timeout=20,
    )
    response.raise_for_status()
    return response.json().get("features", [])


def _search_unsplash_photo(query: str) -> Optional[str]:
    if not UNSPLASH_ACCESS_KEY:
        return None
    try:
        response = requests.get(
            "https://api.unsplash.com/search/photos",
            headers={
                "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}",
                "Accept-Version": "v1",
            },
            params={
                "query": query,
                "per_page": 1,
                "orientation": "landscape",
            },
            timeout=15,
        )
        response.raise_for_status()
        results = response.json().get("results", [])
        if not results:
            return None
        return results[0].get("urls", {}).get("regular")
    except (requests.RequestException, KeyError, IndexError):
        return None


def _mock_places(location: str, mood_theme: str) -> List[Dict[str, Any]]:
    """Fallback so the Planner never breaks if the API/key is unavailable."""
    return [
        {"name": f"{location} Central Park", "category": "Nature", "mood": mood_theme, "estimated_time": "2 hours"},
        {"name": f"Historic {location} Museum", "category": "Culture", "mood": mood_theme, "estimated_time": "3 hours"},
        {"name": f"{location} Scenic Viewpoint", "category": "Sightseeing", "mood": mood_theme, "estimated_time": "1.5 hours"},
    ]


def _mock_food(location: str, cuisine_preference: str) -> List[Dict[str, Any]]:
    return [
        {"name": f"{location} Delight Bistro", "cuisine": cuisine_preference, "avg_cost": None},
        {"name": "The Local Flavors Hub", "cuisine": cuisine_preference, "avg_cost": None},
    ]


def search_places_and_attractions(location: str, mood_theme: str) -> List[Dict[str, Any]]:
    """
    Real replacement for planner_agent.py's mock function of the same name.
    Returns real POIs near `location`, filtered/ranked loosely by `mood_theme`.
    """
    if not GEOAPIFY_API_KEY:
        return _mock_places(location, mood_theme)

    coords = _geocode_location(location)
    if coords is None:
        return _mock_places(location, mood_theme)

    lat, lon = coords
    categories = MOOD_CATEGORY_MAP.get(mood_theme.lower(), DEFAULT_CATEGORIES)

    try:
        features = _query_geoapify_places(lat, lon, categories, radius_m=20000, limit=10)
    except requests.RequestException:
        return _mock_places(location, mood_theme)

    results = []
    for feature in features:
        props = feature.get("properties", {})
        name = props.get("name")
        if not name:
            continue  # skip unnamed POIs, not useful for a quest stop
        categories_list = props.get("categories", [])
        category = categories_list[0] if categories_list else "attraction"
        place = {
            "name": name,
            "category": category,
            "mood": mood_theme,
            "estimated_time": "1-2 hours",  # Geoapify has no duration data; reasonable default
        }
        image_url = _search_unsplash_photo(f"{name} {location}")
        if image_url:
            place["images"] = [image_url]
        results.append(place)

    # Planner indexes places[0], [1], [2] directly — guarantee at least 3 entries
    if len(results) < 3:
        results.extend(_mock_places(location, mood_theme)[: 3 - len(results)])

    return results


def search_food_spots(location: str, cuisine_preference: str) -> List[Dict[str, Any]]:
    """
    Real replacement for planner_agent.py's mock function of the same name.
    Returns real restaurants/eateries near `location`.
    Note: Geoapify's free tier has no price data, so avg_cost stays None
    rather than fabricating a number (see project rule: don't invent rates).
    """
    if not GEOAPIFY_API_KEY:
        return _mock_food(location, cuisine_preference)

    coords = _geocode_location(location)
    if coords is None:
        return _mock_food(location, cuisine_preference)

    lat, lon = coords

    try:
        features = _query_geoapify_places(lat, lon, "catering.restaurant", radius_m=15000, limit=5)
    except requests.RequestException:
        return _mock_food(location, cuisine_preference)

    results = []
    for feature in features:
        props = feature.get("properties", {})
        name = props.get("name")
        if not name:
            continue
        results.append({
            "name": name,
            "cuisine": cuisine_preference,
            "avg_cost": None,  # not available from free POI data
        })

    if not results:
        return _mock_food(location, cuisine_preference)

    return results


if __name__ == "__main__":
    print("=== search_places_and_attractions('Munnar', 'adventure') ===")
    for place in search_places_and_attractions("Munnar", "adventure"):
        print(place)

    print("\n=== search_food_spots('Munnar', 'Kerala') ===")
    for spot in search_food_spots("Munnar", "Kerala"):
        print(spot)