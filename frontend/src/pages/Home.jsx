import { useState, useEffect } from "react";

import WeatherCard from "../components/WeatherCard";
import BudgetCard from "../components/BudgetCard";
import StopCard from "../components/StopCard";
import RouteMap from "../components/RouteMap";
import AgentLog from "../components/AgentLog";
import ProgressPanel from "../components/ProgressPanel";
import BadgePanel from "../components/BadgePanel";

function Home({ tripData, stops = [], isLoading, errorMsg }) {
  const [selectedStop, setSelectedStop] = useState(stops?.[0] || null);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    if (stops && stops.length && !selectedStop) setSelectedStop(stops[0]);
  }, [stops]);

  return (
    <div className="space-y-8">

      {/* Top: Weather strip */}
      <div>
        <WeatherCard weather={tripData?.weather} destination={tripData?.summary?.destination} />
      </div>

      {/* Middle: Itinerary / Stops */}
      <section>
        <h2 className="text-2xl font-bold">🗺️ Itinerary</h2>
        <p className="text-[var(--muted-text)] mt-2">Day-by-day stops and quests — main focus of your journey.</p>

        <div className="mt-6 space-y-6">
          {stops && stops.length > 0 ? (
            stops.map((s) => (
              <div key={s.id} onClick={() => setSelectedStop(s)}>
                <StopCard stop={s} />
              </div>
            ))
          ) : (
            <div className="bg-[var(--basecamp-800)] rounded-2xl p-8 text-[var(--muted-text)]">No journey yet — plan one from the Plan Trip page.</div>
          )}
        </div>
      </section>

      {/* Map below the itinerary */}
      <section className="route-map-section">
        <h3 className="text-xl font-semibold">🧭 Route Map</h3>
        <div className="route-map-container mt-4">
          <RouteMap stops={stops} selected={selectedStop} />
        </div>
      </section>

      {/* Budget below the map */}
      <section>
        <h3 className="text-xl font-semibold mt-6">💰 Budget</h3>
        <div className="mt-4">
          <BudgetCard transport={tripData?.transport} accommodation={tripData?.accommodation} summary={tripData?.summary} />
        </div>
      </section>

      {/* Collapsible secondary area (AgentLog + Progress) as small floating panel */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowPanel((s) => !s)}
          className="bg-[var(--ember-500)] text-black px-4 py-2 rounded-full font-semibold shadow-lg"
        >
          {showPanel ? "Hide Status" : "Show Pipeline"}
        </button>

        {showPanel && (
          <div className="mt-3 w-80 bg-[var(--basecamp-800)] rounded-2xl p-4 shadow-xl border border-black/10">
            <AgentLog isLoading={isLoading} />
            <div className="mt-4">
              <ProgressPanel stops={stops} />
            </div>
            <div className="mt-4">
              <BadgePanel />
            </div>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mt-6 bg-red-900/60 border border-red-500 text-red-200 rounded-2xl p-5 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold">Planning failed</p>
            <p className="mt-1 text-sm">{errorMsg}</p>
          </div>
        </div>
      )}

    </div>
  );
}

export default Home;