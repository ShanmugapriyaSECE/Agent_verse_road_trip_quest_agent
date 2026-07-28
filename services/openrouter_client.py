import os
import requests
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("OPENROUTER_API_KEY")

def build_itinerary(start: str, destination: str, interests: list, days: int) -> str:
    if not API_KEY:
        raise ValueError("OPENROUTER_API_KEY is missing. Please set it in your .env file.")

    response = requests.post(
    url="https://openrouter.ai/api/v1/chat/completions",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "inclusionai/ling-3.0-flash:free",
        "messages": [{
            "role": "user",
            "content": (
                f"Plan a {days}-day road trip quest from {start} to {destination}, "
                f"focused on {', '.join(interests)}. "
                f"Frame each stop as a fun 'quest' with a short goal."
            )
        }]
    },
    timeout=60
)
    if not response.ok:
        try:
            err_data = response.json()
            if "error" in err_data:
                msg = err_data["error"].get("message", "Unknown error")
                code = err_data["error"].get("code", response.status_code)
                raise RuntimeError(
                    f"OpenRouter API error ({code}): {msg}\n"
                    "Please verify that OPENROUTER_API_KEY in your .env file is a valid key from https://openrouter.ai/keys"
                )
        except (ValueError, KeyError):
            pass
        response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"]