import json
from typing import Any, Dict, List

from .llm_client import call_llm_json
from .real_tools import search_accommodations

SYSTEM_PROMPT = """ROLE: Homestay Agent.

GOAL: Find homestay-style lodging options for a destination and present them as realistic, guest-focused recommendations.

CONSTRAINTS:
- Use accommodation search tools.
- Focus on homestay or guest-house style stays.
- Return only valid JSON.

TOOLS:
- search_accommodations(location, stay_type, room_count, budget_limit, total_days)

OUTPUT:
- Return JSON with key: homestay_options.
"""


class HomestayAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.memory: Dict[str, Any] = {}

    def find_homestays(self, location: str, budget: float, total_days: int, room_count: int = 1) -> List[Dict[str, Any]]:
        accommodations = search_accommodations(location, "homestay", room_count, budget, total_days)
        self.memory[f"homestay_{location}"] = accommodations

        if callable(call_llm_json):
            prompt = (
                "Filter the accommodation results for homestay-style options and return them in JSON. "
                "Return only valid JSON with key: homestay_options."
            )
            result = call_llm_json(self.system_prompt, json.dumps(accommodations, indent=2, ensure_ascii=False))
            if isinstance(result, dict) and isinstance(result.get("homestay_options"), list):
                self.memory["last_homestay_options"] = result["homestay_options"]
                return result["homestay_options"]

        return accommodations
