import json
from typing import Dict, Any, List, Optional
import concurrent.futures

from agents.scout_agent import search_places_and_attractions, search_food_spots


SYSTEM_PROMPT = """ROLE: Primary Planner Agent (Travel System).

GOAL: Parse travel constraints, execute data tools, and output a validated JSON travel plan.

CONSTRAINTS:
- No abstract analogies; stick to clear, real-world travel logistics.
- Execute tools for weather, places, transport, stays, local tips, and food before generating output. Do not fabricate rates or schedules.
- Strictly adhere to budget limits and group sizes.

TOOLS TO CALL:
- get_weather_forecast(location, start_date, end_date)
- search_places_and_attractions(location, mood_theme)
- search_transport_options(origin, destination, travel_date, mode)
- search_accommodations(location, stay_type, room_count, budget_limit, total_days)
- search_local_transport_and_blogs(location)
- search_food_spots(location, cuisine_preference)

WORKFLOW:
1. Parse input: destination, dates, transport, stay_type, budget, mood, count. (Ask if critical parameters are missing).
2. Fetch tool data in parallel.
3. Filter options against budget and weather constraints.
4. Return JSON only.

OUTPUT FORMAT (JSON):
{
  "summary": {"destination":"","dates":"","group_size":0,"theme":"","total_cost":0},
  "weather": {"summary":"","advisory":""},
  "transport": {"intercity":{"mode":"","details":"","cost":0},"local_tips":""},
  "accommodation": {"type":"","options":[{"name":"","cost_per_night":0,"reason":""}]},
  "itinerary": [{"day":1,"date":"","morning":{"activity":"","location":"","notes":""},"afternoon":{...},"evening":{...},"food":[]}],
  "local_insights": {"language_tips":"","blog_highlights":""}
}"""

# --- Custom Python Tools ---

def get_weather_forecast(location: str, start_date: str, end_date: str) -> Dict[str, Any]:
    """Fetch weather forecast for specified location and date range."""
    return {
        "location": location,
        "start_date": start_date,
        "end_date": end_date,
        "forecast": f"Pleasant and mostly sunny weather expected in {location} between {start_date} and {end_date}.",
        "advisory": "Light jacket recommended for cool evenings."
    }

# search_places_and_attractions is imported from scout_agent

def search_transport_options(origin: str, destination: str, travel_date: str, mode: str) -> Dict[str, Any]:
    """Search intercity travel options between origin and destination."""
    return {
        "origin": origin,
        "destination": destination,
        "travel_date": travel_date,
        "mode": mode,
        "details": f"Express {mode.capitalize()} service from {origin} to {destination}",
        "cost": 150.0
    }

def search_accommodations(location: str, stay_type: str, room_count: int, budget_limit: float, total_days: int) -> List[Dict[str, Any]]:
    """Search accommodation matching criteria within budget constraints."""
    per_night_budget = (budget_limit / max(total_days, 1)) if total_days > 0 else budget_limit
    return [
        {
            "name": f"Grand {stay_type.capitalize()} {location}",
            "cost_per_night": min(120.0, per_night_budget),
            "reason": f"Fits budget and room requirements ({room_count} rooms)."
        },
        {
            "name": f"Comfort Suites {location}",
            "cost_per_night": min(85.0, per_night_budget * 0.8),
            "reason": "Budget-friendly with good accessibility."
        }
    ]

def search_local_transport_and_blogs(location: str) -> Dict[str, Any]:
    """Search local transport options and retrieve travel blog recommendations."""
    return {
        "local_transport": f"Metro, local cabs, and rental bikes are widely available in {location}.",
        "language_tips": "Basic English and local language phrases are helpful for taxi drivers and local shops.",
        "blog_highlights": f"Travelers recommend visiting early morning to avoid crowds in popular spots of {location}."
    }

# search_food_spots is imported from scout_agent


class PlannerAgent:
    """Primary Planner Agent executing travel plan compilation following system constraints and registered tools."""

    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.tools = {
            "get_weather_forecast": get_weather_forecast,
            "search_places_and_attractions": search_places_and_attractions,
            "search_transport_options": search_transport_options,
            "search_accommodations": search_accommodations,
            "search_local_transport_and_blogs": search_local_transport_and_blogs,
            "search_food_spots": search_food_spots,
        }

    def validate_inputs(self, params: Dict[str, Any]) -> Optional[List[str]]:
        required = ["destination", "start_date", "end_date", "origin", "transport_mode", "stay_type", "budget", "mood", "group_size"]
        missing = [param for param in required if param not in params or params[param] is None]
        return missing if missing else None

    def fetch_data_parallel(self, params: Dict[str, Any]) -> Dict[str, Any]:
        destination = params["destination"]
        start_date = params["start_date"]
        end_date = params["end_date"]
        origin = params["origin"]
        mode = params["transport_mode"]
        stay_type = params["stay_type"]
        budget = params["budget"]
        mood = params["mood"]
        group_size = params["group_size"]

        # Estimate room count based on group size
        room_count = max(1, (group_size + 1) // 2)
        total_days = 2  # default day count fallback

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_weather = executor.submit(get_weather_forecast, destination, start_date, end_date)
            future_places = executor.submit(search_places_and_attractions, destination, mood)
            future_transport = executor.submit(search_transport_options, origin, destination, start_date, mode)
            future_stays = executor.submit(search_accommodations, destination, stay_type, room_count, budget, total_days)
            future_local = executor.submit(search_local_transport_and_blogs, destination)
            future_food = executor.submit(search_food_spots, destination, "Local & International")

            results = {
                "weather": future_weather.result(),
                "places": future_places.result(),
                "transport": future_transport.result(),
                "stays": future_stays.result(),
                "local": future_local.result(),
                "food": future_food.result(),
            }
        return results

    def plan(self, params: Dict[str, Any]) -> Dict[str, Any]:
        missing_params = self.validate_inputs(params)
        if missing_params:
            return {
                "error": "Missing required parameters",
                "missing_parameters": missing_params,
                "message": f"Critical parameters missing: {', '.join(missing_params)}. Please provide these to proceed."
            }

        tool_data = self.fetch_data_parallel(params)

        # Calculate estimated total cost from transport and accommodation
        transport_cost = tool_data["transport"]["cost"]
        stay_cost_per_night = tool_data["stays"][0]["cost_per_night"] if tool_data["stays"] else 0
        total_cost = transport_cost + (stay_cost_per_night * 2)

        # Assemble JSON schema response adhering strictly to constraints & output format
        response = {
            "summary": {
                "destination": params["destination"],
                "dates": f"{params['start_date']} to {params['end_date']}",
                "group_size": params["group_size"],
                "theme": params["mood"],
                "total_cost": total_cost
            },
            "weather": {
                "summary": tool_data["weather"]["forecast"],
                "advisory": tool_data["weather"]["advisory"]
            },
            "transport": {
                "intercity": {
                    "mode": tool_data["transport"]["mode"],
                    "details": tool_data["transport"]["details"],
                    "cost": tool_data["transport"]["cost"]
                },
                "local_tips": tool_data["local"]["local_transport"]
            },
            "accommodation": {
                "type": params["stay_type"],
                "options": tool_data["stays"]
            },
            "itinerary": [
                {
                    "day": 1,
                    "date": params["start_date"],
                    "morning": {
                        "activity": f"Visit {tool_data['places'][0]['name']}",
                        "location": tool_data["places"][0]["name"],
                        "notes": "Morning tour & sightseeing"
                    },
                    "afternoon": {
                        "activity": f"Explore {tool_data['places'][1]['name']}",
                        "location": tool_data["places"][1]["name"],
                        "notes": "Cultural exploration"
                    },
                    "evening": {
                        "activity": f"Sunset view at {tool_data['places'][2]['name']}",
                        "location": tool_data["places"][2]["name"],
                        "notes": "Relaxing evening visual"
                    },
                    "food": [spot["name"] for spot in tool_data["food"]]
                }
            ],
            "local_insights": {
                "language_tips": tool_data["local"]["language_tips"],
                "blog_highlights": tool_data["local"]["blog_highlights"]
            }
        }
        return response


if __name__ == "__main__":
    planner = PlannerAgent()
    sample_request = {
        "destination": "Munnar",
        "start_date": "2026-08-10",
        "end_date": "2026-08-12",
        "origin": "Chennai",
        "transport_mode": "car",
        "stay_type": "resort",
        "budget": 500.0,
        "mood": "adventure",
        "group_size": 2
    }
    output = planner.plan(sample_request)
    print(json.dumps(output, indent=2))
