from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from agents.orchestrator import OrchestratorAgent
import uvicorn

app = FastAPI(title="Road Trip Quest Agent API")

orchestrator = OrchestratorAgent()

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Road Trip Quest Agent API is running"}

@app.post("/plan-trip")
async def plan_trip(request: Request):
    data = await request.json()
    payload = {
        "destination": data.get("destination"),
        "start_date": data.get("start_date") or data.get("startDate") or "2026-08-10",
        "end_date": data.get("end_date") or data.get("endDate") or "2026-08-12",
        "origin": data.get("origin") or "Chennai",
        "transport_mode": data.get("transport_mode") or data.get("transportMode") or data.get("transport") or "car",
        "stay_type": data.get("stay_type") or data.get("stayType") or data.get("accommodation") or "hotel",
        "budget": float(data.get("budget", 500)),
        "mood": data.get("mood") or data.get("theme") or "adventure",
        "group_size": int(data.get("group_size") or data.get("groupSize") or data.get("travelers") or 2),
    }
    response = orchestrator.orchestrate(payload)
    return response.get("result") if isinstance(response, dict) else response

@app.post("/replan")
async def replan(request: Request):
    data = await request.json()
    payload = {
        "current_plan": data.get("current_plan"),
        "params": data.get("params") or {},
        "reason": data.get("reason"),
    }
    response = orchestrator.orchestrate(payload)
    return response.get("result") if isinstance(response, dict) else response

@app.post("/book-stay")
async def book_stay(request: Request):
    data = await request.json()
    payload = {
        "booking": True,
        "accommodation": data.get("accommodation"),
        "destination": data.get("destination") or data.get("plan", {}).get("summary", {}).get("destination", ""),
    }
    response = orchestrator.orchestrate(payload)
    return response.get("result") if isinstance(response, dict) else response

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
