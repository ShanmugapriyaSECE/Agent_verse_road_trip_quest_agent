import { motion } from "framer-motion";
import Hero from "../components/Hero";

function PlanTrip({ onGenerate, isLoading }) {
  return (
    <div className="min-h-[70vh] flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-4xl"
      >
        <div className="rounded-[36px] bg-[linear-gradient(135deg,rgba(255,139,66,0.12),rgba(38,96,81,0.12))] border border-[rgba(255,140,66,0.15)] p-8 mb-8 shadow-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-5xl font-extrabold text-[var(--text-on-dark)]">Plan Trip</h1>
              <p className="mt-3 text-[var(--muted-text)] max-w-2xl">
                Build a vibrant route, explore real destinations, and lock in your journey with reactive trip tools.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl bg-[var(--basecamp-700)] p-5 shadow-inner border border-[rgba(255,255,255,0.08)]">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--sea-500)]">Fast booking-ready design</p>
              <p className="text-[var(--text-on-dark)]">Multi-step flow, rich visuals, and INR budgeting.</p>
            </div>
          </div>
        </div>

        <Hero onGenerate={onGenerate} isLoading={isLoading} />
      </motion.div>
    </div>
  );
}

export default PlanTrip;