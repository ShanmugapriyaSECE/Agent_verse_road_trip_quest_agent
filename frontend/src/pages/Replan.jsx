import { formatINR } from "../format";

function Replan({ tripData, isLoading, onReplan }) {
  const hasPlan = Boolean(tripData && tripData.summary);

  return (
    <div className="space-y-8">
      <section className="rounded-[36px] bg-[rgba(255,255,255,0.08)] border border-white/10 p-8 shadow-2xl backdrop-blur-sm">
        <h2 className="text-5xl font-extrabold text-[var(--sea-500)]">Replan Route</h2>
        <p className="mt-3 text-[var(--muted-text)] max-w-2xl">
          Refresh your trip suggestions, update your route, or regenerate your stay options using the same inputs.
        </p>
      </section>

      {!hasPlan ? (
        <div className="rounded-3xl bg-[rgba(255,255,255,0.05)] border border-white/10 p-8 text-[var(--muted-text)] shadow-2xl">
          <p className="text-lg font-semibold text-[var(--text-on-dark)]">No trip to replan yet</p>
          <p className="mt-2">First create a journey on the Plan Trip page. Then return here to refresh your route with the latest suggestions.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-[rgba(255,255,255,0.06)] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-[var(--sea-500)]">Current trip</h3>
            <p className="mt-3 text-[var(--muted-text)]">Destination: <span className="font-semibold text-[var(--text-on-dark)]">{tripData.summary.destination}</span></p>
            <p className="mt-2 text-[var(--muted-text)]">Dates: <span className="font-semibold text-[var(--text-on-dark)]">{tripData.summary.dates}</span></p>
            <p className="mt-2 text-[var(--muted-text)]">Theme: <span className="font-semibold text-[var(--text-on-dark)]">{tripData.summary.theme}</span></p>
            <p className="mt-2 text-[var(--muted-text)]">Total budget: <span className="font-semibold text-[var(--text-on-dark)]">{typeof tripData.summary.total_cost === "number" ? formatINR(tripData.summary.total_cost) : "Calculated in INR"}</span></p>
          </div>

          <div className="rounded-3xl bg-[rgba(255,255,255,0.06)] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-2xl font-semibold text-[var(--sea-500)]">Replan options</h3>
            <p className="mt-3 text-[var(--muted-text)]">Press the button below to regenerate your journey with the same inputs. This is useful if you want fresh recommendations or if you want to see the route again.</p>
            <button
              onClick={onReplan}
              disabled={isLoading}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
            >
              {isLoading ? "Refreshing…" : "Refresh Route"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Replan;
