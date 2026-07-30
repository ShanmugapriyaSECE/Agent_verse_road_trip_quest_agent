"""
llm_client.py

Shared helper for calling the LLM (OpenRouter free tier) from any agent
component. Centralizes the API call so Scout, Planner, and Replanner
all use the same model and error-handling pattern.
"""

import os
import json
import requests
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Same free model already confirmed working in this project.
# Verify at openrouter.ai/models (Price: Free) before a demo, since free
# model availability rotates.
MODEL = "inclusionai/ling-3.0-flash:free"


def call_llm(system_prompt: str, user_message: str, timeout: int = 30) -> Optional[str]:
    """
    Calls the LLM with a system prompt + user message, returns the raw text
    response, or None if the call fails for any reason (missing key, bad
    request, timeout, malformed response). Callers should always handle the
    None case with a safe fallback — never let an LLM failure crash a demo.
    """
    if not OPENROUTER_API_KEY:
        return None

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"},
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
            },
            timeout=timeout,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except (requests.RequestException, KeyError, IndexError, ValueError):
        return None


def call_llm_json(system_prompt: str, user_message: str, timeout: int = 30) -> Optional[dict]:
    """
    Same as call_llm, but expects and parses a JSON response. Strips markdown
    code fences if the model wraps its JSON in ```json ... ``` despite
    instructions not to. Returns None on any failure (network, or invalid JSON)
    so callers can fall back safely.
    """
    raw = call_llm(system_prompt, user_message, timeout=timeout)
    if raw is None:
        return None

    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except (ValueError, TypeError):
        return None


if __name__ == "__main__":
    test = call_llm(
        "You are a helpful assistant.",
        "Say hello in exactly 5 words."
    )
    print("Plain text test:", test)

    test_json = call_llm_json(
        "Respond ONLY with valid JSON, no other text. Format: {\"greeting\": \"...\"}",
        "Give me a friendly greeting."
    )
    print("JSON test:", test_json)