import json
from typing import Any, Dict, Optional

from .llm_client import call_llm_json
from .real_tools import search_transport_options

SYSTEM_PROMPT = """ROLE: Route Agent.

GOAL: Plan the optimal route between origin and destination using real transport data and return a transparent route recommendation.

CONSTRAINTS:
- Use actual transport tooling to estimate distance, duration, and cost.
- Do not fabricate route details beyond the tool output.
- Return only valid JSON.

TOOLS:
- search_transport_options(origin, destination, travel_date, mode)

OUTPUT:
- Return JSON with key: route.
"""


class RouteAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.memory: Dict[str, Any] = {}

    def plan_route(self, origin: str, destination: str, travel_date: str, mode: str) -> Dict[str, Any]:
        route_data = search_transport_options(origin, destination, travel_date, mode)
        self.memory[f"last_route_{origin}_{destination}"] = route_data

        if callable(call_llm_json):
            prompt = (
                "Summarize the route data into a concise route recommendation. "
                "Return only valid JSON with key: route."
            )
            user_message = json.dumps(route_data, indent=2, ensure_ascii=False)
            result = call_llm_json(self.system_prompt, prompt + "\n" + user_message)
            if isinstance(result, dict) and isinstance(result.get("route"), dict):
                self.memory["last_route_summary"] = result["route"]
                return result["route"]

        return {"route": route_data}
