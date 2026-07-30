import { useState, useEffect } from "react";

import WeatherCard from "../components/WeatherCard";
import BudgetCard from "../components/BudgetCard";
import StopCard from "../components/StopCard";
import RouteMap from "../components/RouteMap";
import AgentLog from "../components/AgentLog";
import ProgressPanel from "../components/ProgressPanel";
import BadgePanel from "../components/BadgePanel";

function Home({ tripData, stops = [], isLoading, errorMsg, onReplan }) {
  const [selectedStop, setSelectedStop] = useState(stops?.[0] || null);
  const [showPanel, setShowPanel] = useState(false);
  const [booked, setBooked] = useState(false);
  const [displayXP, setDisplayXP] = useState(0);

  useEffect(() => {
    if (stops && stops.length && !selectedStop) setSelectedStop(stops[0]);
  }, [stops]);

  useEffect(() => {
    setBooked(false);
  }, [tripData]);

  useEffect(() => {
    if (!selectedStop) {
      setDisplayXP(0);
      return;
    }

    const targetXP = selectedStop.xp || 0;
    let current = 0;
    const step = Math.max(1, Math.ceil(targetXP / 12));

    const interval = setInterval(() => {
      current = Math.min(targetXP, current + step);
      setDisplayXP(current);
      if (current >= targetXP) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [selectedStop]);

  return (
    <div className="space-y-8">

      {/* Top: Weather strip */}
      <div>
        <WeatherCard weather={tripData?.weather} destination={tripData?.summary?.destination} />
      </div>

      {/* Selected stop summary */}
      {selectedStop && (
        <section className="bg-[var(--basecamp-800)] rounded-3xl p-6 shadow-xl border border-black/10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--sea-500)]">Active Journey Stop</p>
              <h2 className="text-3xl font-bold mt-2 text-[var(--text-on-dark)]">{selectedStop.name}</h2>
              <p className="mt-3 text-[var(--muted-text)] max-w-2xl">{selectedStop.description || `Explore this stop to unlock new experiences and local highlights.`}</p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#ffb18f] via-[#ff915c] to-[#d9612f] p-5 text-[var(--basecamp-900)] shadow-lg">
              <p className="text-sm uppercase tracking-[0.24em]">XP Reveal</p>
              <p className="text-5xl font-extrabold mt-2">{displayXP}</p>
              <p className="mt-1 text-sm text-[var(--basecamp-900)]/80">XP for completing this stop</p>
            </div>
          </div>
        </section>
      )}

      {/* Middle: Itinerary / Stops */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">🗺️ Itinerary</h2>
            <p className="text-[var(--muted-text)] mt-2">Day-by-day stops and quests — main focus of your journey.</p>
          </div>
          <div className="rounded-full bg-[rgba(255,140,66,0.14)] px-4 py-2 text-sm text-[var(--ember-500)] font-semibold">Tap any stop to reveal XP, quests, and full details.</div>
        </div>

        <div className="mt-6 space-y-6">
          {stops && stops.length > 0 ? (
            stops.map((s) => (
              <div key={s.id} onClick={() => setSelectedStop(s)}>
                <StopCard stop={s} />
              </div>
            ))
          ) : (
            <div className="bg-[var(--basecamp-700)] rounded-3xl p-8 text-[var(--muted-text)] border border-[rgba(255,255,255,0.08)] shadow-inner">
              No journey yet — plan one from the Plan Trip page.
            </div>
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

      {/* Booking and replanning panel */}
      <section className="bg-[var(--basecamp-800)] rounded-3xl p-6 shadow-xl border border-black/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-[var(--sea-500)]">📦 Booking & Replanner</h3>
            <p className="mt-2 text-[var(--muted-text)] max-w-2xl">
              Use this panel to confirm a demo booking or refresh your route if your plans change.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (onReplan) onReplan();
              }}
              className="rounded-full bg-[var(--ember-500)] px-6 py-3 font-semibold text-black transition hover:brightness-110"
            >
              🔁 Replan Route
            </button>
            <button
              onClick={() => setBooked(true)}
              className="rounded-full bg-[var(--sea-500)] px-6 py-3 font-semibold text-black transition hover:brightness-110"
            >
              🧾 Confirm Booking
            </button>
          </div>
        </div>

        {booked && (
          <div className="mt-5 rounded-2xl bg-[rgba(77,144,120,0.14)] border border-[rgba(77,144,120,0.22)] p-4 text-[var(--text-on-dark)]">
            <p className="font-semibold text-[var(--sea-500)]">Booking simulation complete.</p>
            <p className="mt-1 text-[var(--muted-text)]">
              Your itinerary is now marked as reserved. For a fully operational booking system, we can add backend endpoints or an external travel API.
            </p>
          </div>
        )}
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