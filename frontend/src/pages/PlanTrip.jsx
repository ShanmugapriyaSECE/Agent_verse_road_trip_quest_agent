import { motion } from "framer-motion";
import Hero from "../components/Hero";

function PlanTrip({ onGenerate, isLoading }) {
  return (
    <div className="min-h-[70vh] flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-3xl"
      >
        <h1 className="text-4xl font-extrabold mb-4">Plan Trip</h1>
        <p className="text-[var(--muted-text)] mb-6">Fill in your trip details and generate a road-trip journey tailored to your mood.</p>

        <Hero onGenerate={onGenerate} isLoading={isLoading} />
      </motion.div>
    </div>
  );
}

export default PlanTrip;