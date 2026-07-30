import { useState } from "react";
import { formatINR } from "../format";

function Bookings({ tripData }) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const rawOptions = tripData?.accommodation?.options || [];
  const options = rawOptions.filter((option) => !/oyo/i.test(option.name || ""));
  const hasHiddenOyo = rawOptions.some((option) => /oyo/i.test(option.name || ""));

  return (
    <div className="space-y-8">
      <section className="rounded-[36px] bg-[rgba(255,255,255,0.08)] border border-white/10 p-8 shadow-2xl backdrop-blur-sm">
        <h2 className="text-5xl font-extrabold text-[var(--sea-500)]">Bookings</h2>
        <p className="mt-3 text-[var(--muted-text)] max-w-2xl">
          Choose a stay option from your generated journey. This page shows lodging options discovered for your destination and lets you confirm a demo reservation.
        </p>
      </section>

      {!tripData ? (
        <div className="rounded-3xl bg-[rgba(255,255,255,0.05)] border border-white/10 p-8 text-[var(--muted-text)] shadow-2xl">
          <p className="text-lg font-semibold text-[var(--text-on-dark)]">Create a trip first</p>
          <p className="mt-2">Start by planning your journey on the Plan Trip page. Then return here to confirm your chosen stay.</p>
        </div>
      ) : (
        <>
          <div className="rounded-3xl bg-[rgba(255,255,255,0.06)] border border-white/10 p-6 shadow-2xl mb-6">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--sea-500)]">Trip note</p>
            <p className="mt-2 text-[var(--muted-text)]">
              Accommodation selections are managed here. Your Journey and Quests pages display the itinerary route and all node details.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {options.length > 0 ? (
              options.map((option, index) => (
                <div key={`${option.name}-${index}`} className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.06)] p-6 shadow-2xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xl font-semibold text-[var(--text-on-dark)]">{option.name}</p>
                      <p className="mt-2 text-[var(--muted-text)]">{option.reason || "Suggested stay for your route."}</p>
                    </div>
                    <p className="text-right text-lg font-semibold text-[var(--ember-500)]">
                      {option.cost_per_night ? `${formatINR(option.cost_per_night)} / night` : "Estimate only"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBooking(option);
                      setConfirmed(false);
                    }}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                  >
                    Select this stay
                  </button>
                </div>
              ))
            ) : (
            <div className="rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.05)] p-8 shadow-2xl">
              <p className="text-lg font-semibold text-[var(--text-on-dark)]">No booking options found</p>
              <p className="mt-2 text-[var(--muted-text)]">
                Your generated itinerary did not return stay suggestions. Please replan or try a different destination.
              </p>
              {hasHiddenOyo && (
                <p className="mt-3 text-sm text-[var(--spark-500)]">
                  OYO-style listings have been filtered out to keep stay recommendations authentic and practical.
                </p>
              )}
            </div>
          )}
        </div>
      </>
      )}

      {selectedBooking && (
        <section className="rounded-3xl bg-[rgba(255,255,255,0.08)] border border-white/10 p-6 shadow-2xl">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-2xl font-semibold text-[var(--sea-500)]">Selected Stay</h3>
              <p className="mt-2 text-[var(--muted-text)]">Confirm this booking simulation before you hit the road.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[var(--muted-text)]">Name</p>
                <p className="font-semibold text-[var(--text-on-dark)]">{selectedBooking.name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted-text)]">Price</p>
                <p className="font-semibold text-[var(--ember-500)]">{selectedBooking.cost_per_night ? formatINR(selectedBooking.cost_per_night) : "Estimate only"}</p>
              </div>
            </div>
            <button
              onClick={() => setConfirmed(true)}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
            >
              Confirm Booking
            </button>
            {confirmed && (
              <div className="rounded-3xl bg-[rgba(77,144,120,0.12)] border border-[rgba(77,144,120,0.18)] p-4 text-[var(--text-on-dark)] shadow-2xl">
                <p className="font-semibold text-[var(--sea-500)]">Booking confirmed!</p>
                <p className="mt-1 text-[var(--muted-text)]">Your stay at {selectedBooking.name} is reserved in this demo experience.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default Bookings;
