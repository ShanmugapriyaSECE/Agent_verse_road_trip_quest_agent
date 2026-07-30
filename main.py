import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from agents.planner_agent import PlannerAgent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("road_trip_quest_api")

app = FastAPI(title="Road Trip Quest API", version="1.0.0")

# Allow the Vite dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

planner = PlannerAgent()


class TripRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    origin: str
    transport_mode: str
    stay_type: str
    budget: float
    mood: str
    group_size: int


@app.post("/plan-trip")
def plan_trip(request: TripRequest):
    params = request.model_dump()
    logger.info(f"Received plan request for destination: {params.get('destination')}")
    result = planner.plan(params)
    if "error" in result:
        logger.warning(f"Planner returned error: {result.get('error')}")
    else:
        logger.info(f"Successfully generated travel plan for {params.get('destination')}")
    return result


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
