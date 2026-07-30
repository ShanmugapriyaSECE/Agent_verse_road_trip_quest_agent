from typing import Dict, Any, List
import concurrent.futures

class ScoutAgent:
    """
    Scout Agent: Responsible for location discovery, attractions, food spots,
    and local insider insights for road trip quest destinations.
    """

    def __init__(self, name: str = "Scout Agent"):
        self.name = name

    def search_places_and_attractions(self, location: str, mood_theme: str) -> List[Dict[str, Any]]:
        """Search points of interest and attractions matching location and mood/theme."""
        return [
            {
                "name": f"{location} Central Park & Botanical Garden",
                "category": "Nature & Wildlife",
                "mood": mood_theme,
                "estimated_time": "2 hours",
                "scouted_by": self.name
            },
            {
                "name": f"Historic {location} Heritage Museum",
                "category": "Culture & History",
                "mood": mood_theme,
                "estimated_time": "3 hours",
                "scouted_by": self.name
            },
            {
                "name": f"{location} Scenic Peak Viewpoint",
                "category": "Sightseeing",
                "mood": mood_theme,
                "estimated_time": "1.5 hours",
                "scouted_by": self.name
            }
        ]

    def search_food_spots(self, location: str, cuisine_preference: str = "Local & International") -> List[Dict[str, Any]]:
        """Search food spots according to location and cuisine preferences."""
        return [
            {
                "name": f"{location} Delight Bistro",
                "cuisine": cuisine_preference,
                "avg_cost": 25.0,
                "rating": 4.7,
                "scouted_by": self.name
            },
            {
                "name": f"The Local Flavors Hub",
                "cuisine": cuisine_preference,
                "avg_cost": 15.0,
                "rating": 4.5,
                "scouted_by": self.name
            }
        ]

    def search_local_insights(self, location: str) -> Dict[str, Any]:
        """Search local transport options and retrieve travel blog recommendations."""
        return {
            "local_transport": f"Metro, local cabs, and rental bikes are widely available in {location}.",
            "language_tips": f"Basic English and local language phrases are helpful for taxi drivers and local shops in {location}.",
            "blog_highlights": f"Travelers recommend visiting early morning to avoid crowds in popular spots of {location}.",
            "scouted_by": self.name
        }

    def scout_destination(self, location: str, mood_theme: str) -> Dict[str, Any]:
        """Run full destination scouting in parallel."""
        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_places = executor.submit(self.search_places_and_attractions, location, mood_theme)
            future_food = executor.submit(self.search_food_spots, location)
            future_insights = executor.submit(self.search_local_insights, location)

            return {
                "places": future_places.result(),
                "food": future_food.result(),
                "insights": future_insights.result()
            }

# --- Fetch.ai uAgent Protocol Wrapper ---
try:
    from uagents import Agent, Context

    scout_uagent = Agent(
        name="scout_agent",
        seed="scout_agent_seed_phrase_road_trip",
        port=8001,
        endpoint=["http://127.0.0.1:8001/submit"]
    )

    @scout_uagent.on_event("startup")
    async def startup(ctx: Context):
        ctx.logger.info(f"Scout Agent uAgent active on network! Address: {scout_uagent.address}")

except Exception as e:
    scout_uagent = None

if __name__ == "__main__":
    scout = ScoutAgent()
    sample_scout = scout.scout_destination("Munnar", "adventure")
    print("Scout Agent Result:")
    import json
    print(json.dumps(sample_scout, indent=2))
