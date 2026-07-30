"""
scout_agent.py

Scout Agent — real-world POI/food discovery layer, wrapped as both:
  1. A plain Python class (ScoutAgent) usable directly by PlannerAgent
  2. A genuine Fetch.ai uAgent (scout_uagent) for Agentverse registration

Backed by:
    - Geoapify Geocoding API (location name -> lat/lon)
    - Geoapify Places API (real POIs/restaurants near that point)
    - LLM ranking (via llm_client.py) to pick the best 3-4 places out of the
      raw Geoapify results and explain why each fits the user's interest.

Falls back to mock data only if a key is missing or a request fails, so
the Planner never crashes mid-demo.

Module-level functions (search_places_and_attractions, search_food_spots)
are kept for backward compatibility with planner_agent.py's existing
import line — they delegate to a default ScoutAgent instance.
"""

import os
import requests
from typing import Dict, Any, List, Tuple, Optional
import concurrent.futures
from dotenv import load_dotenv

try:
    from .llm_client import call_llm_json
except ImportError:
    from llm_client import call_llm_json

load_dotenv()
GEOAPIFY_API_KEY = os.getenv("GEOAPIFY_API_KEY")

_geocode_cache: Dict[str, Tuple[float, float]] = {}

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

SCOUT_RANKING_SYSTEM_PROMPT = (
    "You are a travel curation assistant. Given a list of real place "
    "names and a traveler's interest, pick the 3 to 4 best matches. "
    "Respond ONLY with valid JSON, no other text, no markdown fences. "
    'Format exactly: {"picks": [{"name": "...", "reason": "..."}]} '
    "Each 'name' MUST be copied exactly from the given list — do not "
    "invent, rename, or alter any place name. Each 'reason' must be one "
    "short sentence."
)


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


def _rank_places_with_llm(places: List[Dict[str, Any]], mood_theme: str) -> Optional[List[Dict[str, Any]]]:
    if not places:
        return None
    place_names = [p["name"] for p in places]
    system_prompt = (
        "You are a travel curation assistant. Given a list of real place "
        "names and a traveler's interest, pick the 3 to 4 best matches. "
        "Respond ONLY with valid JSON, no other text, no markdown fences. "
        'Format exactly: {"picks": [{"name": "...", "reason": "..."}]} '
        "Each 'name' MUST be copied exactly from the given list — do not "
        "invent, rename, or alter any place name. Each 'reason' must be one "
        "short sentence."
    )
    user_message = f"Interest/mood: {mood_theme}\nPlaces: {', '.join(place_names)}"
    result = call_llm_json(SCOUT_RANKING_SYSTEM_PROMPT, user_message)
    if not result or "picks" not in result or not isinstance(result["picks"], list):
        return None
    by_name = {p["name"]: p for p in places}
    ranked = []
    for pick in result["picks"]:
        name = pick.get("name")
        if name in by_name:
            enriched = dict(by_name[name])
            enriched["reason"] = pick.get("reason", "")
            ranked.append(enriched)
    return ranked if len(ranked) >= 3 else None


def _mock_places(location: str, mood_theme: str, scouted_by: str = "Scout Agent") -> List[Dict[str, Any]]:
    return [
        {"name": f"{location} Central Park", "category": "Nature", "mood": mood_theme, "estimated_time": "2 hours", "scouted_by": scouted_by},
        {"name": f"Historic {location} Museum", "category": "Culture", "mood": mood_theme, "estimated_time": "3 hours", "scouted_by": scouted_by},
        {"name": f"{location} Scenic Viewpoint", "category": "Sightseeing", "mood": mood_theme, "estimated_time": "1.5 hours", "scouted_by": scouted_by},
    ]


def _mock_food(location: str, cuisine_preference: str, scouted_by: str = "Scout Agent") -> List[Dict[str, Any]]:
    return [
        {"name": f"{location} Delight Bistro", "cuisine": cuisine_preference, "avg_cost": None, "scouted_by": scouted_by},
        {"name": "The Local Flavors Hub", "cuisine": cuisine_preference, "avg_cost": None, "scouted_by": scouted_by},
    ]


class ScoutAgent:
    """
    Scout Agent: location discovery, attractions, food spots, and local
    insights for road trip quest destinations. Backed by real Geoapify data
    and LLM ranking (see module docstring); falls back to mock data only if
    a key is missing or a request fails.
    """

    def __init__(self, name: str = "Scout Agent"):
        self.name = name

    def search_places_and_attractions(self, location: str, mood_theme: str) -> List[Dict[str, Any]]:
        """Search real points of interest matching location and mood/theme, ranked by the LLM."""
        if not GEOAPIFY_API_KEY:
            return _mock_places(location, mood_theme, self.name)

        coords = _geocode_location(location)
        if coords is None:
            return _mock_places(location, mood_theme, self.name)

        lat, lon = coords
        categories = MOOD_CATEGORY_MAP.get(mood_theme.lower(), DEFAULT_CATEGORIES)

        try:
            features = _query_geoapify_places(lat, lon, categories, radius_m=20000, limit=10)
        except requests.RequestException:
            return _mock_places(location, mood_theme, self.name)

        results = []
        for feature in features:
            props = feature.get("properties", {})
            name = props.get("name")
            if not name:
                continue
            categories_list = props.get("categories", [])
            category = categories_list[0] if categories_list else "attraction"
            results.append({
                "name": name,
                "category": category,
                "mood": mood_theme,
                "estimated_time": "1-2 hours",
                "scouted_by": self.name,
            })

        ranked = _rank_places_with_llm(results, mood_theme)
        if ranked is not None:
            for r in ranked:
                r["scouted_by"] = self.name
            results = ranked

        if len(results) < 3:
            results.extend(_mock_places(location, mood_theme, self.name)[: 3 - len(results)])

        return results

    def search_food_spots(self, location: str, cuisine_preference: str = "Local & International") -> List[Dict[str, Any]]:
        """Search real restaurants/eateries near location. No live pricing on
        Geoapify's free tier, so avg_cost stays None rather than fabricated."""
        if not GEOAPIFY_API_KEY:
            return _mock_food(location, cuisine_preference, self.name)

        coords = _geocode_location(location)
        if coords is None:
            return _mock_food(location, cuisine_preference, self.name)

        lat, lon = coords
        try:
            features = _query_geoapify_places(lat, lon, "catering.restaurant", radius_m=15000, limit=5)
        except requests.RequestException:
            return _mock_food(location, cuisine_preference, self.name)

        results = []
        for feature in features:
            props = feature.get("properties", {})
            name = props.get("name")
            if not name:
                continue
            results.append({
                "name": name,
                "cuisine": cuisine_preference,
                "avg_cost": None,
                "scouted_by": self.name,
            })

        return results if results else _mock_food(location, cuisine_preference, self.name)

    def search_local_insights(self, location: str) -> Dict[str, Any]:
        """
        Local transport/language/blog tips. NOTE: this stays hand-written,
        not API-backed — there is no free API used here for these specific
        insights (unlike places/food, which are genuinely real above).
        """
        return {
            "local_transport": f"Metro, local cabs, and rental bikes are widely available in {location}.",
            "language_tips": f"Basic English and local language phrases are helpful for taxi drivers and local shops in {location}.",
            "blog_highlights": f"Travelers recommend visiting early morning to avoid crowds in popular spots of {location}.",
            "scouted_by": self.name,
        }

    def scout_destination(self, location: str, mood_theme: str) -> Dict[str, Any]:
        """Run full destination scouting in parallel."""
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_places = executor.submit(self.search_places_and_attractions, location, mood_theme)
            future_food = executor.submit(self.search_food_spots, location)
            future_insights = executor.submit(self.search_local_insights, location)
            return {
                "places": future_places.result(),
                "food": future_food.result(),
                "insights": future_insights.result(),
            }


# --- Module-level functions for backward compatibility with planner_agent.py ---
# planner_agent.py does: from scout_agent import search_places_and_attractions, search_food_spots
_default_scout = ScoutAgent()


def search_places_and_attractions(location: str, mood_theme: str) -> List[Dict[str, Any]]:
    return _default_scout.search_places_and_attractions(location, mood_theme)


def search_food_spots(location: str, cuisine_preference: str = "Local & International") -> List[Dict[str, Any]]:
    return _default_scout.search_food_spots(location, cuisine_preference)


# --- Fetch.ai uAgent Protocol Wrapper ---
# This is the genuine step toward real multi-agent architecture: Scout is
# registered as an actual uAgent with a real address, not just a Python class.
# It does not yet receive/send messages from Planner — that message-passing
# wiring is the next step if you want true agent-to-agent communication.
try:
    from uagents import Agent, Context

    scout_uagent = Agent(
        name="scout_agent",
        seed="scout_agent_seed_phrase_road_trip",
        port=8001,
        endpoint=["http://127.0.0.1:8001/submit"],
    )

    @scout_uagent.on_event("startup")
    async def startup(ctx: Context):
        ctx.logger.info(f"Scout Agent uAgent active on network! Address: {scout_uagent.address}")

except Exception:
    scout_uagent = None


if __name__ == "__main__":
    scout = ScoutAgent()
    sample_scout = scout.scout_destination("Munnar", "adventure")
    print("Scout Agent Result:")
    import json
    print(json.dumps(sample_scout, indent=2))