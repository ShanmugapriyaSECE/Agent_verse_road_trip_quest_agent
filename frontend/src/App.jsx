import { useState } from "react";
import axios from "axios";

import Navbar from "./components/Navbar";
import PlanTrip from "./pages/PlanTrip";
import Home from "./pages/Home";
import BadgePanel from "./components/BadgePanel";

const API_URL = "http://localhost:8000/plan-trip";

function mapTripDataToStops(tripData) {
  if (!tripData?.itinerary || !Array.isArray(tripData.itinerary)) return [];

  const STOP_ICONS = ["📍", "🌄", "🍽️", "🏛️", "🌊", "🌿", "🏕️", "🎯"];

  const getTravelImage = (query, seed) =>
    `https://source.unsplash.com/random/900x600/?${encodeURIComponent(query)}&sig=${seed}`;

  const stops = [];

  tripData.itinerary.forEach((day, dayIdx) => {
    const slots = ["morning", "afternoon", "evening"];

    slots.forEach((slot, slotIdx) => {
      const slotData = day[slot];
      if (!slotData?.activity) return;

      const index = dayIdx * slots.length + slotIdx;
      const placeName = slotData.location || slotData.activity || `Stop ${index + 1}`;
      const destination = tripData.summary?.destination || placeName;

      stops.push({
        id: index + 1,
        name: placeName,
        icon: STOP_ICONS[index % STOP_ICONS.length],
        location: destination,
        xp: (index + 1) * 50,
        quest: `Visit ${placeName}`,
        reward: `Unlock the Explorer badge and earn ${(index + 1) * 50} XP`,
        description: slotData.notes || slotData.activity,
        images: [
          getTravelImage(`${placeName}, ${destination}, scenic`, index + 1),
          getTravelImage(`${placeName}, ${destination}, landmark`, index + 2),
        ],
        agent: "Live Places API",
        estimatedTime: slotData.estimatedTime || "1-2 hours",
      });
    });
  });

  return stops;
}

function App() {
  const [page, setPage] = useState("plan");
  const [isLoading, setIsLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [stops, setStops] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);

  async function handleGenerate(params) {
    setLastRequest(params);
    setIsLoading(true);
    setErrorMsg(null);
    setTripData(null);
    setStops([]);

    try {
      const response = await axios.post(API_URL, params);
      const data = response.data;

      if (data?.error) {
        setErrorMsg(
          data.message ||
            (data.missing_parameters?.length
              ? `Please fill in all required fields: ${data.missing_parameters.join(", ")}.`
              : "An error occurred. Please check your inputs and try again.")
        );
        return;
      }

      setTripData(data);
      setStops(mapTripDataToStops(data));
      setPage("journey");
    } catch (err) {
      console.error("API error:", err);
      if (err.response?.data?.error) {
        const d = err.response.data;
        setErrorMsg(
          d.message || `Please fill in all required fields: ${(d.missing_parameters || []).join(", ")}.`
        );
      } else {
        setErrorMsg("Could not reach the planning server. Make sure the backend is running on port 8000.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReplan() {
    if (!lastRequest) return;
    await handleGenerate(lastRequest);
  }

  return (
    <div className="min-h-screen bg-[var(--basecamp-900)] text-[var(--text-on-dark)]">
      <Navbar currentPage={page} onNavigate={setPage} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {page === "plan" && <PlanTrip onGenerate={handleGenerate} isLoading={isLoading} />}

        {page === "journey" && (
          <Home tripData={tripData} stops={stops} isLoading={isLoading} errorMsg={errorMsg} onReplan={handleReplan} />
        )}

        {page === "quests" && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">🎯 Quests</h2>
            <p className="text-[var(--muted-text)]">
              Quests view — coming together. Select a journey to see quests for each stop.
            </p>
          </section>
        )}

        {page === "badges" && (
          <section className="space-y-6">
            <h2 className="text-3xl font-bold">🏅 Badges</h2>
            <BadgePanel />
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
