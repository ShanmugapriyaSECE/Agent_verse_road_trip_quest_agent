import json
from typing import Any, Dict, List, Optional

from .llm_client import call_llm_json
from .scout_agent import ScoutAgent
from .real_tools import search_accommodations

SYSTEM_PROMPT = """ROLE: Itinerary Agent.

GOAL: Build a day-by-day itinerary for a travel plan using external destination knowledge and the user's constraints.

CONSTRAINTS:
- Base the itinerary on the plan summary, weather, transport, and accommodation details.
- Do not invent locations or timing beyond the provided plan data.
- Return only valid JSON with a list of days and activity slots.

TOOLS:
- ScoutAgent.search_places_and_attractions(location, mood_theme)
- ScoutAgent.search_food_spots(location, cuisine_preference)
- search_accommodations(location, stay_type, room_count, budget_limit, total_days)

OUTPUT:
- Return a JSON object with key: itinerary.
"""


class ItineraryAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.scout_agent = ScoutAgent()
        self.memory: Dict[str, Any] = {}

    def remember(self, key: str, value: Any) -> None:
        self.memory[key] = value

    def generate_itinerary(self, plan_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        location = plan_data.get("summary", {}).get("destination", "")
        mood = plan_data.get("summary", {}).get("theme", "adventure")
        total_days = len(plan_data.get("itinerary", [])) or 1

        tool_places = self.scout_agent.search_places_and_attractions(location, mood)
        tool_food = self.scout_agent.search_food_spots(location, "Local & International")

        self.remember("last_location", location)
        self.remember("last_mood", mood)

        if callable(call_llm_json):
            prompt = (
                "Create a day-by-day itinerary for the traveler using the provided plan data and discovery tools. "
                "Return only valid JSON with keys: itinerary."
            )
            user_message = (
                f"Plan data: {json.dumps(plan_data, indent=2, ensure_ascii=False)}\n"
                f"Places: {json.dumps(tool_places, indent=2, ensure_ascii=False)}\n"
                f"Food spots: {json.dumps(tool_food, indent=2, ensure_ascii=False)}"
            )
            result = call_llm_json(self.system_prompt, prompt + "\n" + user_message)
            if isinstance(result, dict) and isinstance(result.get("itinerary"), list):
                self.remember("last_itinerary", result["itinerary"])
                return result["itinerary"]

        # Fallback deterministic itinerary builder
        itinerary = []
        for day in range(1, total_days + 1):
            place = tool_places[(day - 1) % len(tool_places)] if tool_places else {"name": "Local exploration"}
            food_spot = tool_food[(day - 1) % len(tool_food)] if tool_food else {"name": "Local dining"}
            itinerary.append({
                "day": day,
                "date": plan_data.get("summary", {}).get("dates", "day") if day == 1 else f"day-{day}",
                "morning": {
                    "activity": f"Visit {place['name']}",
                    "location": place["name"],
                },
                "afternoon": {
                    "activity": f"Lunch at {food_spot['name']}",
                    "location": food_spot["name"],
                },
                "evening": {
                    "activity": "Relax and enjoy local sights",
                    "location": location,
                },
            })
        self.remember("last_itinerary", itinerary)
        return itinerary
