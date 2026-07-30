import json
from typing import Any, Dict, List

SYSTEM_PROMPT = """ROLE: Booking Agent.

GOAL: Simulate booking confirmation details for a selected accommodation option from a generated trip plan.

CONSTRAINTS:
- Only use the provided accommodation option and destination.
- Do not contact any real booking API.
- Return a small booking summary with name, cost_per_night, booking_link, and confirmation details.

OUTPUT:
- Valid JSON with keys: booking, confirmation.
"""


class BookingAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT

    def book(self, accommodation_option: Dict[str, Any], destination: str) -> Dict[str, Any]:
        booking = {
            "booking": {
                "destination": destination,
                "name": accommodation_option.get("name"),
                "cost_per_night": accommodation_option.get("cost_per_night"),
                "booking_link": accommodation_option.get("booking_link"),
            },
            "confirmation": {
                "status": "simulated",
                "message": f"Booking simulated for {accommodation_option.get('name')} in {destination}. This is a demo confirmation, not a real reservation.",
            },
        }
        return booking


if __name__ == "__main__":
    agent = BookingAgent()
    print(json.dumps(agent.book({"name": "Demo Resort", "cost_per_night": 3500.0, "booking_link": "https://example.com"}, "Munnar"), indent=2))
