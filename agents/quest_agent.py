import json
from typing import Any, Dict, List, Optional

from .llm_client import call_llm_json
from .scout_agent import ScoutAgent

SYSTEM_PROMPT = """ROLE: Quest Agent.

GOAL: Transform a travel itinerary into a set of themed quests and local challenges that make the trip more engaging.

CONSTRAINTS:
- Use itinerary activities and local discoveries to create quest prompts.
- Keep the quests realistic and tied to the actual destination.
- Return only valid JSON with a list of quests.

TOOLS:
- ScoutAgent.search_places_and_attractions(location, mood_theme)
- ScoutAgent.search_food_spots(location, cuisine_preference)

OUTPUT:
- Return JSON with key: quests.
"""


class QuestAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.scout_agent = ScoutAgent()
        self.memory: Dict[str, Any] = {"recent_quests": []}

    def create_quests(self, plan_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        destination = plan_data.get("summary", {}).get("destination", "")
        mood = plan_data.get("summary", {}).get("theme", "adventure")
        attractions = self.scout_agent.search_places_and_attractions(destination, mood)

        if callable(call_llm_json):
            prompt = (
                "Convert the following travel plan into a set of 4 to 6 adventure quests. "
                "Return only valid JSON with key: quests."
            )
            user_message = (
                f"Plan summary: {json.dumps(plan_data.get('summary', {}), indent=2, ensure_ascii=False)}\n"
                f"Attractions: {json.dumps(attractions, indent=2, ensure_ascii=False)}"
            )
            result = call_llm_json(self.system_prompt, prompt + "\n" + user_message)
            if isinstance(result, dict) and isinstance(result.get("quests"), list):
                self.memory["recent_quests"] = result["quests"]
                return result["quests"]

        quests = []
        for idx, attraction in enumerate(attractions[:4], start=1):
            quests.append({
                "id": idx,
                "title": f"Explore {attraction['name']}",
                "description": f"Visit {attraction['name']} and complete a local discovery challenge.",
                "type": attraction.get("category", "attraction"),
            })
        self.memory["recent_quests"] = quests
        return quests
