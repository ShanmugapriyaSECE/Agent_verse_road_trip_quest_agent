import json
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

from agents.orchestrator import OrchestratorAgent

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

orchestrator = OrchestratorAgent()


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
    result = orchestrator.orchestrate(params)
    if result.get("status") == "error" or result.get("result", {}).get("error"):
        logger.warning(f"Orchestrator returned error: {result}")
    else:
        logger.info(f"Successfully generated travel plan for {params.get('destination')}")
    return result


@app.post("/replan")
async def replan(request: Request):
    data = await request.json()
    payload = {
        "current_plan": data.get("current_plan"),
        "params": data.get("params") or {},
        "reason": data.get("reason"),
    }
    logger.info("Received replan request")
    return orchestrator.orchestrate(payload)


@app.post("/book-stay")
async def book_stay(request: Request):
    data = await request.json()
    payload = {
        "booking": True,
        "accommodation": data.get("accommodation"),
        "destination": data.get("destination") or data.get("plan", {}).get("summary", {}).get("destination", ""),
    }
    logger.info("Received booking request")
    return orchestrator.orchestrate(payload)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
