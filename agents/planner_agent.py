import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import concurrent.futures

from .scout_agent import ScoutAgent
try:
    from .llm_client import call_llm_json
except ImportError:
    call_llm_json = None
try:
    from agents.real_tools import get_weather_forecast, search_transport_options, search_accommodations
except ImportError:
    from .real_tools import get_weather_forecast, search_transport_options, search_accommodations


def _format_tool_data(params: Dict[str, Any], tool_data: Dict[str, Any]) -> str:
    return json.dumps({"request": params, "tool_data": tool_data}, indent=2, ensure_ascii=False)


SYSTEM_PROMPT = """ROLE: Primary Planner Agent (Travel System).

GOAL: Parse travel constraints, execute data tools, and output a validated JSON travel plan.

CONSTRAINTS:
- No abstract analogies; stick to clear, real-world travel logistics.
- Execute tools for weather, places, transport, stays, local tips, and food before generating output. Do not fabricate rates or schedules.
- Strictly adhere to budget limits and group sizes.

TOOLS TO CALL:
- get_weather_forecast(location, start_date, end_date)
- scout_agent.search_places_and_attractions(location, mood_theme)
- search_transport_options(origin, destination, travel_date, mode)
- search_accommodations(location, stay_type, room_count, budget_limit, total_days)
- scout_agent.search_local_insights(location)
- scout_agent.search_food_spots(location, cuisine_preference)

OUTPUT:
- Return only valid JSON.
- Use the schema: summary, weather, transport, accommodation, itinerary, local_insights.
"""

# def get_weather_forecast(location: str, start_date: str, end_date: str) -> Dict[str, Any]:
#     """Fetch weather forecast for specified location and date range."""
#     return {
#         "location": location,
#         "start_date": start_date,
#         "end_date": end_date,
#         "forecast": f"Pleasant and mostly sunny weather expected in {location} between {start_date} and {end_date}.",
#         "advisory": "Light jacket recommended for cool evenings."
#     }

# def search_transport_options(origin: str, destination: str, travel_date: str, mode: str) -> Dict[str, Any]:
#     """Search intercity travel options between origin and destination."""
#     return {
#         "origin": origin,
#         "destination": destination,
#         "travel_date": travel_date,
#         "mode": mode,
#         "details": f"Express {mode.capitalize()} service from {origin} to {destination}",
#         "cost": 150.0
#     }

# def search_accommodations(location: str, stay_type: str, room_count: int, budget_limit: float, total_days: int) -> List[Dict[str, Any]]:
#     """Search accommodation matching criteria within budget constraints."""
#     per_night_budget = (budget_limit / max(total_days, 1)) if total_days > 0 else budget_limit
#     return [
#         {
#             "name": f"Grand {stay_type.capitalize()} {location}",
#             "cost_per_night": min(120.0, per_night_budget),
#             "reason": f"Fits budget and room requirements ({room_count} rooms)."
#         },
#         {
#             "name": f"Comfort Suites {location}",
#             "cost_per_night": min(85.0, per_night_budget * 0.8),
#             "reason": "Budget-friendly with good accessibility."
#         }
#     ]


class PlannerAgent:
    """Primary Planner Agent executing travel plan compilation following system constraints and registered tools."""

    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.scout_agent = ScoutAgent()
        self.tools = {
            "get_weather_forecast": get_weather_forecast,
            "search_places_and_attractions": self.scout_agent.search_places_and_attractions,
            "search_transport_options": search_transport_options,
            "search_accommodations": search_accommodations,
            "search_local_transport_and_blogs": self.scout_agent.search_local_insights,
            "search_food_spots": self.scout_agent.search_food_spots,
        }

    def _try_generate_plan_with_llm(self, params: Dict[str, Any], tool_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Use the Planner system prompt and tool output to generate the final plan via LLM."""
        if not callable(call_llm_json):
            return None

        user_message = (
            "Use the provided request details and tool outputs below to generate the travel plan. "
            "Do not fabricate data; only use the tool outputs or clearly label estimates. "
            "Return only valid JSON matching the expected plan schema.\n\n"
            + _format_tool_data(params, tool_data)
        )
        result = call_llm_json(self.system_prompt, user_message)
        if isinstance(result, dict) and "summary" in result and "itinerary" in result:
            return result
        return None

    def validate_inputs(self, params: Dict[str, Any]) -> Optional[List[str]]:
        required = ["destination", "start_date", "end_date", "origin", "transport_mode", "stay_type", "budget", "mood", "group_size"]
        missing = [param for param in required if param not in params or params[param] is None]
        return missing if missing else None

    def _calculate_total_days(self, start_date: str, end_date: str) -> int:
        """Real day count derived from actual dates. Falls back to 1 if dates
        are malformed, so the Planner never crashes mid-demo."""
        try:
            start = datetime.strptime(start_date, "%Y-%m-%d")
            end = datetime.strptime(end_date, "%Y-%m-%d")
            days = (end - start).days + 1
            return max(days, 1)
        except (ValueError, TypeError):
            return 1

    def _validate_llm_plan(self, plan: Any) -> bool:
        if not isinstance(plan, dict):
            return False
        required = [
            "summary",
            "weather",
            "transport",
            "accommodation",
            "itinerary",
            "local_insights",
        ]
        return all(key in plan for key in required)

    def _generate_plan_with_llm(self, params: Dict[str, Any], tool_data: Dict[str, Any], total_cost: float) -> Optional[Dict[str, Any]]:
        if not callable(call_llm_json):
            return None

        user_message = (
            "User request:\n"
            f"destination: {params['destination']}, origin: {params['origin']}, "
            f"start_date: {params['start_date']}, end_date: {params['end_date']}, "
            f"transport_mode: {params['transport_mode']}, stay_type: {params['stay_type']}, "
            f"budget: {params['budget']}, mood: {params['mood']}, group_size: {params['group_size']}\n"
            "Tool outputs:\n"
            f"{json.dumps(tool_data, indent=2, ensure_ascii=False)}\n"
            "Please build a complete travel plan in strict JSON with keys: summary, weather, transport, accommodation, itinerary, local_insights. "
            "Do not fabricate data beyond the tool outputs; use safe defaults only when needed. "
            "The itinerary should contain one object per trip day with morning, afternoon, evening, and food slots. "
            "Include total_cost in the summary."
        )

        result = call_llm_json(self.system_prompt, user_message)
        if self._validate_llm_plan(result):
            return result
        return None

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
        total_days = self._calculate_total_days(start_date, end_date)

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_weather = executor.submit(get_weather_forecast, destination, start_date, end_date)
            future_places = executor.submit(self.scout_agent.search_places_and_attractions, destination, mood)
            future_transport = executor.submit(search_transport_options, origin, destination, start_date, mode)
            future_stays = executor.submit(search_accommodations, destination, stay_type, room_count, budget, total_days)
            future_local = executor.submit(self.scout_agent.search_local_insights, destination)
            future_food = executor.submit(self.scout_agent.search_food_spots, destination, "Local & International")

            results = {
                "weather": future_weather.result(),
                "places": future_places.result(),
                "transport": future_transport.result(),
                "stays": future_stays.result(),
                "local": future_local.result(),
                "food": future_food.result(),
            }
        return results

    def _build_itinerary(self, params: Dict[str, Any], tool_data: Dict[str, Any], total_days: int) -> List[Dict[str, Any]]:
        """Builds one entry per real day in the trip, rotating through all
        real places/food Scout found instead of only ever using the first 3."""
        places = tool_data["places"] or [{"name": "Local exploration"}]
        food = tool_data["food"] or []
 
        start_dt = datetime.strptime(params["start_date"], "%Y-%m-%d")
        itinerary = []
 
        for day_num in range(1, total_days + 1):
            day_date = (start_dt + timedelta(days=day_num - 1)).strftime("%Y-%m-%d")
 
            morning_place = places[(day_num - 1) * 3 % len(places)]
            afternoon_place = places[((day_num - 1) * 3 + 1) % len(places)] if len(places) > 1 else morning_place
            evening_place = places[((day_num - 1) * 3 + 2) % len(places)] if len(places) > 2 else morning_place
 
            if food:
                day_food = [
                    food[i % len(food)]["name"]
                    for i in range((day_num - 1) * 2, (day_num - 1) * 2 + 2)
                ]
            else:
                day_food = []
 
            itinerary.append({
                "day": day_num,
                "date": day_date,
                "morning": {
                    "activity": f"Visit {morning_place['name']}",
                    "location": morning_place["name"],
                    "notes": "Morning tour & sightseeing"
                },
                "afternoon": {
                    "activity": f"Explore {afternoon_place['name']}",
                    "location": afternoon_place["name"],
                    "notes": "Cultural exploration"
                },
                "evening": {
                    "activity": f"Sunset view at {evening_place['name']}",
                    "location": evening_place["name"],
                    "notes": "Relaxing evening visual"
                },
                "food": day_food
            })
 
        return itinerary

    def plan(self, params: Dict[str, Any]) -> Dict[str, Any]:
        missing_params = self.validate_inputs(params)
        if missing_params:
            return {
                "error": "Missing required parameters",
                "missing_parameters": missing_params,
                "message": f"Critical parameters missing: {', '.join(missing_params)}. Please provide these to proceed."
            }

        tool_data = self.fetch_data_parallel(params)
        total_days = self._calculate_total_days(params["start_date"], params["end_date"])

        llm_response = self._try_generate_plan_with_llm(params, tool_data)
        if llm_response:
            return llm_response

        # Fallback deterministic plan if the LLM is unavailable or fails.
        transport_cost = tool_data["transport"]["cost"]
        stay_cost_per_night = tool_data["stays"][0]["cost_per_night"] if tool_data["stays"] else 0
        total_cost = transport_cost + (stay_cost_per_night * total_days)

        itinerary = self._build_itinerary(params, tool_data, total_days)

        response = {
            "summary": {
                "destination": params["destination"],
                "dates": f"{params['start_date']} to {params['end_date']}",
                "group_size": params["group_size"],
                "theme": params["mood"],
                "total_cost": total_cost,
            },
            "weather": {
                "summary": tool_data["weather"]["forecast"],
                "advisory": tool_data["weather"]["advisory"],
            },
            "transport": {
                "intercity": {
                    "mode": tool_data["transport"]["mode"],
                    "details": tool_data["transport"]["details"],
                    "cost": tool_data["transport"]["cost"],
                },
                "local_tips": tool_data["local"]["local_transport"],
            },
            "accommodation": {
                "type": params["stay_type"],
                "options": tool_data["stays"],
            },
            "itinerary": itinerary,
            "local_insights": {
                "language_tips": tool_data["local"]["language_tips"],
                "blog_highlights": tool_data["local"]["blog_highlights"],
            },
        #     "itinerary": [
        #         {
        #             "day": 1,
        #             "date": params["start_date"],
        #             "morning": {
        #                 "activity": f"Visit {tool_data['places'][0]['name']}",
        #                 "location": tool_data["places"][0]["name"],
        #                 "notes": "Morning tour & sightseeing"
        #             },
        #             "afternoon": {
        #                 "activity": f"Explore {tool_data['places'][1]['name']}",
        #                 "location": tool_data["places"][1]["name"],
        #                 "notes": "Cultural exploration"
        #             },
        #             "evening": {
        #                 "activity": f"Sunset view at {tool_data['places'][2]['name']}",
        #                 "location": tool_data["places"][2]["name"],
        #                 "notes": "Relaxing evening visual"
        #             },
        #             "food": [spot["name"] for spot in tool_data["food"]]
        #         }
        #     ],
        #     "local_insights": {
        #         "language_tips": tool_data["local"]["language_tips"],
        #         "blog_highlights": tool_data["local"]["blog_highlights"]
        #     }
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
        "budget": 1500.0,
        "mood": "adventure",
        "group_size": 2
    }
    output = planner.plan(sample_request)
    print(json.dumps(output, indent=2))