function ProgressPanel({ stops }) {
  const hasStops = stops && stops.length > 0;

  // XP per stop is (index + 1) * 50 — same formula used in mapTripDataToStops
  const totalXP  = hasStops ? stops.reduce((sum, s) => sum + (s.xp || 0), 0) : 1000;
  const earnedXP = hasStops ? Math.round(totalXP * 0.75) : 750; // placeholder progress
  const pct      = totalXP > 0 ? Math.round((earnedXP / totalXP) * 100) : 0;
  const level    = hasStops ? Math.max(1, stops.length) : 4;

  return (
    <div className="bg-[var(--basecamp-800)] rounded-2xl p-4 shadow-md border border-black/10">

      <h2 className="text-lg font-bold text-[var(--ember-500)]">
        ⭐ Adventure Progress
      </h2>

      <p className="mt-4 text-[var(--muted-text)]">Level {level} Explorer</p>

      <div className="bg-[var(--basecamp-900)] h-4 rounded-full mt-4 overflow-hidden">
        <div
          className="bg-[var(--sea-500)] h-4 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        ></div>
      </div>

      <p className="mt-3 text-[var(--muted-text)]">
        {earnedXP} / {totalXP} XP
      </p>

    </div>
  );
}

export default ProgressPanel;