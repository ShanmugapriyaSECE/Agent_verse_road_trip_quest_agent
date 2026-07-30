import json
from typing import Any, Dict, Optional

from .llm_client import call_llm_json
from .real_tools import get_weather_forecast

SYSTEM_PROMPT = """ROLE: Weather Agent.

GOAL: Provide realistic weather context for a travel plan using external forecast tools and historical weather signals.

CONSTRAINTS:
- Use real weather data where available.
- Label current conditions versus future forecast limitations clearly.
- Return only valid JSON.

TOOLS:
- get_weather_forecast(location, start_date, end_date)

OUTPUT:
- Return JSON with key: weather.
"""


class WeatherAgent:
    def __init__(self):
        self.system_prompt = SYSTEM_PROMPT
        self.memory: Dict[str, Any] = {}

    def get_weather(self, location: str, start_date: str, end_date: str) -> Dict[str, Any]:
        weather_data = get_weather_forecast(location, start_date, end_date)
        self.memory[f"weather_{location}_{start_date}_{end_date}"] = weather_data

        if callable(call_llm_json):
            prompt = (
                "Summarize the weather data for the traveler and include any packing or route advisories. "
                "Return only valid JSON with key: weather."
            )
            user_message = json.dumps(weather_data, indent=2, ensure_ascii=False)
            result = call_llm_json(self.system_prompt, prompt + "\n" + user_message)
            if isinstance(result, dict) and isinstance(result.get("weather"), dict):
                self.memory["last_weather_summary"] = result["weather"]
                return result["weather"]

        return weather_data
