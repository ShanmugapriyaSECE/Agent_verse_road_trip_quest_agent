function WeatherCard({ weather, destination }) {
  // Fallback to static display when no real data is available
  const summary = weather?.summary || "—";
  const advisory = weather?.advisory || "—";
  const location = destination || "—";

  return (
    <div className="w-full bg-[linear-gradient(90deg,var(--basecamp-800),rgba(0,0,0,0.05))] rounded-2xl p-4 shadow-md border border-black/10">

      <h2 className="text-xl font-bold">
        🌤 Weather
      </h2>

      <div className="mt-5 space-y-2">

        <p className="font-semibold text-[var(--ember-500)]">📍 {location}</p>

        <p className="text-[var(--muted-text)] text-sm leading-6">{summary}</p>

        {advisory && advisory !== "—" && (
          <p className="text-yellow-300 text-sm mt-2">⚠️ {advisory}</p>
        )}

      </div>

    </div>
  );
}

export default WeatherCard;