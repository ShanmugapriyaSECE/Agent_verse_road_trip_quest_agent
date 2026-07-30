function WeatherCard({ weather, destination }) {
  const summary = weather?.summary || "Clear skies and a great adventure ahead.";
  const advisory = weather?.advisory || "Pack shades and stay hydrated.";
  const location = destination || "Your destination";
  const temperature = weather?.temperature || weather?.temp || null;
  const condition = weather?.condition || weather?.weather || null;

  return (
    <div className="w-full rounded-3xl p-5 shadow-2xl border border-black/10 bg-gradient-to-r from-[#ffb175] via-[#d55e31] to-[#4d9078] text-[var(--text-on-dark)]">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--basecamp-900)]/80">Weather status</p>
          <h2 className="text-3xl font-bold mt-2">{location}</h2>
          <p className="mt-2 text-[var(--text-on-dark)]/90">{summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-[var(--basecamp-900)]">
          <div className="rounded-[24px] bg-[rgba(255,255,255,0.9)] p-4 shadow-inner">
            <p className="text-xs uppercase tracking-[0.24em] font-semibold">Condition</p>
            <p className="mt-2 text-lg font-bold">{condition || "Sunny"}</p>
          </div>
          <div className="rounded-[24px] bg-[rgba(255,255,255,0.92)] p-4 shadow-inner">
            <p className="text-xs uppercase tracking-[0.24em] font-semibold">Advisory</p>
            <p className="mt-2 text-lg font-bold">{advisory}</p>
          </div>
        </div>
      </div>

      {temperature && (
        <div className="mt-5 rounded-3xl bg-[rgba(0,0,0,0.1)] p-4 text-[var(--basecamp-900)]">
          <p className="text-sm uppercase tracking-[0.24em]">Temperature</p>
          <p className="text-2xl font-bold mt-1">{temperature}°C</p>
        </div>
      )}
    </div>
  );
}

export default WeatherCard;