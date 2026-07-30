import json
from typing import Any, Dict, Optional

from .planner_agent import PlannerAgent
try:
    from .llm_client import call_llm_json
except ImportError:
    call_llm_json = None

SYSTEM_PROMPT = """ROLE: Replanner Agent.

GOAL: Review an existing road trip plan and suggest a revised itinerary or budget-friendly updates
based on new information or a replan request. Use the existing plan structure and tool outputs
as the source of truth.

CONSTRAINTS:
- Do not invent trip details beyond the existing plan and parameter data.
- Preserve the original schedule format: summary, weather, transport, accommodation,
itinerary, local_insights.
- If the user asks for an improvement or weather-sensitive change, update the itinerary
and summary only when it is necessary and clearly label any estimates.

OUTPUT:
- Return only valid JSON.
- Keep the same schema as the Planner output, with the itinerary updated when applicable.
"""


class ReplannerAgent:
    def __init__(self):
        self.planner = PlannerAgent()
        self.system_prompt = SYSTEM_PROMPT

    def replan(self, current_plan: Dict[str, Any], params: Dict[str, Any], reason: Optional[str] = None) -> Dict[str, Any]:
        if callable(call_llm_json):
            user_message = (
                "A traveler has an existing road trip plan and wants to revise it. "
                "Use the current plan, the original request parameters, and the reason for replanning. "
                "Return a new plan in the same JSON schema, with a revised itinerary if needed.\n\n"
                f"Reason: {reason or 'General improvement request.'}\n\n"
                f"Original params: {json.dumps(params, indent=2, ensure_ascii=False)}\n\n"
                f"Current plan: {json.dumps(current_plan, indent=2, ensure_ascii=False)}"
            )
            result = call_llm_json(self.system_prompt, user_message)
            if isinstance(result, dict) and "itinerary" in result:
                return result

        return self._fallback_replan(current_plan, params)

    def _fallback_replan(self, current_plan: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        revised_plan = self.planner.plan(params)
        if revised_plan.get("error"):
            return current_plan
        return revised_plan


if __name__ == "__main__":
    replanner = ReplannerAgent()
    sample_plan = {
        "summary": {"destination": "Munnar", "dates": "2026-08-10 to 2026-08-12", "group_size": 2, "theme": "adventure", "total_cost": 1500.0},
        "weather": {"summary": "Pleasant weather.", "advisory": "Pack a light jacket."},
        "transport": {"intercity": {"mode": "car", "details": "Drive.", "cost": 600.0}, "local_tips": "Use local cabs."},
        "accommodation": {"type": "resort", "options": []},
        "itinerary": [],
        "local_insights": {"language_tips": "English is widely spoken.", "blog_highlights": "Go early."},
    }
    print(json.dumps(replanner.replan(sample_plan, {"destination": "Munnar"}, "Weather changed"), indent=2))
