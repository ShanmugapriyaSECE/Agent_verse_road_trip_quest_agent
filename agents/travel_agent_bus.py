import json
from typing import Any, Dict

from .llm_client import call_llm_json
from .real_tools import search_transport_options

SYSTEM_PROMPT = """ROLE: Travel Agent - Bus.

GOAL: Provide bus travel recommendations using real transport estimates.

CONSTRAINTS:
- Use transport tool output for route details, distance, and cost.
- Do not fabricate bus-specific data.
- Return only valid JSON.

TOOLS:
- search_transport_options(origin, destination, travel_date, mode)

OUTPUT:
- Return JSON with key: bus_travel.
"""


class BusTravelAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.memory: Dict[str, Any] = {}

    def recommend(self, origin: str, destination: str, travel_date: str) -> Dict[str, Any]:
        transport_data = search_transport_options(origin, destination, travel_date, "bus")
        self.memory[f"bus_trip_{origin}_{destination}"] = transport_data

        if callable(call_llm_json):
            prompt = (
                "Summarize the bus travel plan and include any cost or route notes. "
                "Return only valid JSON with key: bus_travel."
            )
            result = call_llm_json(self.system_prompt, json.dumps(transport_data, indent=2, ensure_ascii=False))
            if isinstance(result, dict) and isinstance(result.get("bus_travel"), dict):
                self.memory["last_bus_travel"] = result["bus_travel"]
                return result["bus_travel"]

        return {"bus_travel": transport_data}
