import json
from typing import Dict, Any, Optional

from .planner_agent import PlannerAgent
from .replanner_agent import ReplannerAgent
from .booking_agent import BookingAgent

try:
    from .llm_client import call_llm_json
except ImportError:
    try:
        from llm_client import call_llm_json
    except ImportError:
        call_llm_json = None

SYSTEM_PROMPT = """ROLE: Orchestrator Agent.

GOAL: Route travel requests to the correct agent, manage the workflow, and
return validated JSON responses with the selected action.

CONSTRAINTS:
- Use PlannerAgent for new trip planning requests.
- Use ReplannerAgent when an existing plan or a replan reason is provided.
- Use BookingAgent for accommodation confirmation requests.
- Do not fabricate any plan details beyond the provided request and tool outputs.
- Return only valid JSON.
"""


class OrchestratorAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.planner = PlannerAgent()
        self.replanner = ReplannerAgent()
        self.booking = BookingAgent()

    def orchestrate(self, request: Dict[str, Any]) -> Dict[str, Any]:
        action = "plan"
        result: Optional[Dict[str, Any]] = None

        if request.get("booking") or (request.get("accommodation") and request.get("destination")):
            action = "book"
            accommodation = request.get("accommodation", {})
            destination = request.get("destination") or request.get("plan", {}).get("summary", {}).get("destination", "")
            result = self.booking.book(accommodation, destination)
        elif request.get("current_plan") or request.get("reason"):
            action = "replan"
            result = self.replanner.replan(request.get("current_plan", {}), request.get("params", {}), request.get("reason"))
        else:
            action = "plan"
            result = self.planner.plan(request)

        if callable(call_llm_json):
            prompt = (
                "Orchestrator routing decision. "
                f"Action={action}. Request: {json.dumps(request, indent=2, ensure_ascii=False)}"
            )
            try:
                call_llm_json(self.system_prompt, prompt)
            except Exception:
                pass

        return {
            "status": "ok" if result and not result.get("error") else "error",
            "action": action,
            "result": result,
        }


if __name__ == "__main__":
    orchestrator = OrchestratorAgent()
    sample_request = {
        "destination": "Munnar",
        "start_date": "2026-08-10",
        "end_date": "2026-08-12",
        "origin": "Chennai",
        "transport_mode": "car",
        "stay_type": "resort",
        "budget": 500,
        "mood": "adventure",
        "group_size": 2,
    }
    print(json.dumps(orchestrator.orchestrate(sample_request), indent=2))
