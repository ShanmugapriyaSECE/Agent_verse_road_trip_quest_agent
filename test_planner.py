import sys
from services.openrouter_client import build_itinerary

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

result = build_itinerary(
    start="Chennai",
    destination="Munnar",
    interests=["waterfalls", "street food"],
    days=3
)
print(result)