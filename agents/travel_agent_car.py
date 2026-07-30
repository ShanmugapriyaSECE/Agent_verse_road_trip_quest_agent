import json
from typing import Any, Dict

from .llm_client import call_llm_json
from .real_tools import search_transport_options

SYSTEM_PROMPT = """ROLE: Travel Agent - Car.

GOAL: Provide car travel recommendations, including route, cost estimate, and travel advice.

CONSTRAINTS:
- Use transport tool output for distance, time, and cost.
- Do not invent a car route or cost.
- Return only valid JSON.

TOOLS:
- search_transport_options(origin, destination, travel_date, mode)

OUTPUT:
- Return JSON with key: car_travel.
"""


class CarTravelAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.memory: Dict[str, Any] = {}

    def recommend(self, origin: str, destination: str, travel_date: str) -> Dict[str, Any]:
        transport_data = search_transport_options(origin, destination, travel_date, "car")
        self.memory[f"car_trip_{origin}_{destination}"] = transport_data

        if callable(call_llm_json):
            prompt = (
                "Summarize the car travel plan and highlight any route or cost notes. "
                "Return only valid JSON with key: car_travel."
            )
            result = call_llm_json(self.system_prompt, json.dumps(transport_data, indent=2, ensure_ascii=False))
            if isinstance(result, dict) and isinstance(result.get("car_travel"), dict):
                self.memory["last_car_travel"] = result["car_travel"]
                return result["car_travel"]

        return {"car_travel": transport_data}
