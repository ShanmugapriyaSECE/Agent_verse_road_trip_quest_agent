import { useEffect, useMemo, useState } from "react";
import RouteMap from "./RouteMap";
import { formatINR } from "../format";

function QuestsPage({ tripData, stops = [] }) {
  const itinerary = useMemo(
    () => (Array.isArray(tripData?.itinerary) ? tripData.itinerary : []),
    [tripData?.itinerary]
  );

  const questRows = useMemo(() => {
    return itinerary.flatMap((day, dayIndex) => {
      const slots = [
        { key: "morning", label: "Morning" },
        { key: "afternoon", label: "Afternoon" },
        { key: "evening", label: "Evening" },
      ];

      return slots
        .map((slot, slotIndex) => {
          const slotData = day[slot.key] || {};
          if (!slotData?.activity) return null;

          const stop = stops[dayIndex * slots.length + slotIndex] || {};

          return {
            id: `${day.day}-${slot.key}`,
            day: day.day,
            date: day.date,
            slotLabel: slot.label,
            activity: slotData.activity,
            location: slotData.location || tripData?.summary?.destination,
            notes: slotData.notes,
            image:
              stop.images?.[0] ||
              `https://source.unsplash.com/900x600/?${encodeURIComponent(
                slotData.location || slotData.activity || tripData?.summary?.destination || "travel"
              )}`,
            icon: stop.icon || "📍",
            xp: stop.xp || 100,
            quest: stop.quest || `Complete ${slotData.activity}`,
            reward: stop.reward || `Earn ${stop.xp || 100} XP for finishing this challenge`,
            agent: stop.agent || "Itinerary AI",
          };
        })
        .filter(Boolean);
    });
  }, [itinerary, stops, tripData?.summary?.destination]);

  const [availableQuests, setAvailableQuests] = useState(questRows);
  const [selectedQuests, setSelectedQuests] = useState([]);

  useEffect(() => {
    setAvailableQuests(questRows);
    setSelectedQuests([]);
  }, [questRows]);

  const handleAddToQuest = (id) => {
    const quest = availableQuests.find((item) => item.id === id);
    if (!quest || selectedQuests.some((item) => item.id === id)) return;
    setSelectedQuests((prev) => [...prev, quest]);
  };

  const handleDeleteCard = (id) => {
    setAvailableQuests((prev) => prev.filter((item) => item.id !== id));
    setSelectedQuests((prev) => prev.filter((item) => item.id !== id));
  };

  const hasQuests = availableQuests.length > 0;
  const destination = tripData?.summary?.destination || "your destination";
  const costText = tripData?.summary?.total_cost ? formatINR(tripData.summary.total_cost) : "Calculated in INR";

  return (
    <div className="mx-auto max-w-7xl px-6 pb-10 space-y-8">
      <section className="rounded-[36px] bg-[rgba(255,255,255,0.08)] border border-white/10 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-5xl font-extrabold text-[var(--sea-500)]">🎯 Quest Planner</h2>
            <p className="mt-3 text-[var(--muted-text)] max-w-2xl">
              View every itinerary node, story stop, and quest challenge across your generated journey.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl bg-[rgba(255,255,255,0.06)] p-6 shadow-2xl border border-white/10">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sea-500)]">Destination</p>
            <p className="text-[var(--text-on-dark)] font-semibold text-lg">{destination}</p>
            <p className="text-sm text-[var(--muted-text)]">Trip cost estimate: {costText}</p>
          </div>
        </div>
      </section>

      {hasQuests ? (
        <div className="grid gap-6">
          <section className="rounded-3xl bg-[rgba(255,255,255,0.05)] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-[var(--text-on-dark)]">Itinerary nodes</h3>
            <p className="mt-2 text-[var(--muted-text)]">
              Every stop in your itinerary is represented as a node. This page surfaces them all clearly so you can track the flow of your trip.
            </p>
            <div className="mt-6 overflow-hidden">
              <div className="flow-route relative">
                {availableQuests.map((quest, index) => (
                  <div
                    key={quest.id}
                    className="flow-route-item relative rounded-[32px] border border-white/10 bg-[rgba(8,15,29,0.95)] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.45)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-[#9333ea] to-[#ec4899] text-2xl shadow-lg text-white">
                        {quest.icon}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted-text)]">Day {quest.day} · {quest.slotLabel}</p>
                        <p className="mt-2 font-semibold text-[var(--text-on-dark)] leading-tight">{quest.activity}</p>
                      </div>
                    </div>

                    <p className="mt-4 text-[var(--muted-text)] text-sm leading-6 min-h-[3rem]">{quest.notes || `Follow this stop as a key quest node in your journey.`}</p>

                    <div className="mt-4 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm text-[var(--muted-text)]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-[var(--text-on-dark)]">{quest.quest}</p>
                        <span className="rounded-full bg-[rgba(59,130,246,0.16)] px-3 py-1 text-[0.67rem] font-semibold uppercase tracking-[0.22em] text-[#bfdbfe]">
                          Quest
                        </span>
                      </div>
                      <p className="mt-3 text-[var(--sea-500)] text-sm">{quest.reward}</p>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleAddToQuest(quest.id)}
                        disabled={selectedQuests.some((item) => item.id === quest.id)}
                        className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#a855f7] to-[#fb7185] px-4 py-2 text-sm font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {selectedQuests.some((item) => item.id === quest.id) ? "Added" : "Add to Quest"}
                      </button>
                      <button
                        onClick={() => handleDeleteCard(quest.id)}
                        className="inline-flex items-center justify-center rounded-full border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm font-semibold text-[var(--muted-text)] transition hover:border-[#8b5cf6] hover:text-white"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="flow-node-badge absolute left-1/2 top-6 -translate-x-1/2">
                      <div className="flow-node-dot" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-[rgba(255,255,255,0.05)] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-[var(--text-on-dark)]">Selected quest nodes</h3>
            <p className="mt-2 text-[var(--muted-text)]">
              Only quests you add appear here. Deleted cards are removed from the available node strip.
            </p>
            {selectedQuests.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {selectedQuests.map((quest) => (
                  <article key={quest.id} className="rounded-3xl border border-white/10 bg-[rgba(8,15,29,0.95)] p-5 shadow-[0_24px_80px_rgba(15,23,42,0.45)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-[var(--muted-text)]">Day {quest.day}</p>
                        <h4 className="mt-2 text-xl font-semibold text-[var(--text-on-dark)]">{quest.activity}</h4>
                      </div>
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#fde68a]/15 px-3 py-2 text-sm font-semibold text-[#f59e0b]">
                        ⭐ {quest.xp} XP
                      </span>
                    </div>
                    <p className="mt-4 text-[var(--muted-text)] leading-7">{quest.notes || `Complete this quest to unlock the next stop.`}</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm">
                        <p className="text-[var(--muted-text)]">Location</p>
                        <p className="mt-2 text-[var(--text-on-dark)]">{quest.location}</p>
                      </div>
                      <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm">
                        <p className="text-[var(--muted-text)]">Difficulty</p>
                        <p className="mt-2 text-[var(--text-on-dark)]">Easy</p>
                      </div>
                    </div>
                    <div className="mt-5 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-4 text-sm">
                      <p className="text-[var(--muted-text)]">Quest</p>
                      <p className="mt-2 text-[var(--text-on-dark)]">{quest.quest}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-6 text-[var(--muted-text)]">
                Add stops from the itinerary strip above to start building your quest list.
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-[rgba(255,255,255,0.05)] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-[var(--text-on-dark)]">Route overview</h3>
            <p className="mt-2 text-[var(--muted-text)]">
              Interactive route map for your generated itinerary. Tap a node to open the details in the journey view.
            </p>
            <div className="mt-6 rounded-[32px] border border-white/10 bg-[rgba(15,23,42,0.95)] p-4 shadow-[0_28px_80px_rgba(15,23,42,0.45)]">
              <RouteMap stops={stops} />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            {selectedQuests.map((quest) => (
              <article
                key={quest.id}
                className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.06)] shadow-2xl overflow-hidden"
              >
                <img src={quest.image} alt={quest.activity} className="h-56 w-full object-cover" />
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full bg-[rgba(155,108,255,0.12)] px-3 py-1 text-sm font-semibold text-[var(--sea-500)]">
                      Day {quest.day} · {quest.slotLabel}
                    </span>
                    <span className="text-sm text-[var(--muted-text)]">{quest.date}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="text-3xl">{quest.icon}</div>
                    <div>
                      <h4 className="text-xl font-bold text-[var(--text-on-dark)]">{quest.activity}</h4>
                      <p className="text-[var(--muted-text)] mt-1">{quest.location}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-[var(--muted-text)] leading-7">{quest.notes || `Follow this quest to unlock the next travel stop.`}</p>
                  <div className="mt-5 rounded-3xl bg-[rgba(255,255,255,0.06)] p-4 border border-white/10">
                    <p className="text-sm text-[var(--muted-text)]">Quest</p>
                    <p className="mt-1 font-semibold text-[var(--text-on-dark)]">{quest.quest}</p>
                    <p className="mt-2 text-sm text-[var(--sea-500)]">{quest.reward}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm text-[var(--muted-text)]">
                    <span>{quest.agent}</span>
                    <span>{quest.xp} XP</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      ) : (
        <div className="rounded-3xl bg-[rgba(255,255,255,0.05)] border border-white/10 p-8 shadow-2xl text-[var(--muted-text)]">
          <p className="text-lg font-semibold text-[var(--text-on-dark)]">No quests available yet</p>
          <p className="mt-2">Generate a journey first from the Plan Trip page so the itinerary nodes and quests can appear here.</p>
        </div>
      )}
    </div>
  );
}

export default QuestsPage;
