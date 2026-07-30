import json
from typing import Any, Dict, Optional

from .llm_client import call_llm_json
from .planner_agent import PlannerAgent
from .route_agent import RouteAgent
from .weather_agent import WeatherAgent
from .scout_agent import ScoutAgent
from .booking_agent import BookingAgent
from .travel_agent_car import CarTravelAgent
from .travel_agent_bus import BusTravelAgent
from .homestay_agent import HomestayAgent
from .replanner_agent import ReplannerAgent
from .itinerary_agent import ItineraryAgent
from .quest_agent import QuestAgent

SYSTEM_PROMPT = """ROLE: Agent Selecting Agent.

GOAL: Choose the best sub-agent(s) for a travel request based on the request details and available tools.

CONSTRAINTS:
- If the request asks for planning, select PlannerAgent plus supporting agents.
- If the request asks for a replan, select ReplannerAgent.
- If the request asks for booking, select BookingAgent or HomestayAgent as needed.
- If the mode is car or bus, prefer the corresponding travel agent.
- Return only valid JSON.

OUTPUT:
- Return JSON with keys: selected_agents, reason.
"""


class AgentSelector:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.memory: Dict[str, Any] = {}

    def select(self, request: Dict[str, Any]) -> Dict[str, Any]:
        selected = ["PlannerAgent"]
        reason = "Default travel planning request."

        if request.get("booking"):
            selected = ["BookingAgent"]
            if request.get("stay_type") == "homestay":
                selected = ["HomestayAgent", "BookingAgent"]
            reason = "Booking request detected."
        elif request.get("current_plan") or request.get("reason"):
            selected = ["ReplannerAgent"]
            reason = "Replanning request detected."
        elif request.get("transport_mode") == "car":
            selected = ["PlannerAgent", "CarTravelAgent"]
            reason = "Car travel requested."
        elif request.get("transport_mode") == "bus":
            selected = ["PlannerAgent", "BusTravelAgent"]
            reason = "Bus travel requested."

        self.memory["last_selection"] = {"selected_agents": selected, "reason": reason}

        if callable(call_llm_json):
            user_message = (
                f"Request: {json.dumps(request, indent=2, ensure_ascii=False)}\n"
                f"Selected: {selected}\nReason: {reason}"
            )
            result = call_llm_json(self.system_prompt, user_message)
            if isinstance(result, dict) and "selected_agents" in result:
                self.memory["last_selection"] = result
                return result

        return {"selected_agents": selected, "reason": reason}
