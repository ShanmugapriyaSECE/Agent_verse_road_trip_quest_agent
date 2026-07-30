import { useState } from "react";
import { motion } from "framer-motion";

function Hero({ onGenerate, isLoading }) {
  const [form, setForm] = useState({
    origin: "",
    destination: "",
    start_date: "",
    end_date: "",
    transport_mode: "car",
    stay_type: "hotel",
    budget: 500,
    mood: "adventure",
    group_size: 2,
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit() {
    if (onGenerate) onGenerate({ ...form, budget: parseFloat(form.budget), group_size: parseInt(form.group_size) });
  }

  return (
    <div className="bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(155,108,255,0.12))] rounded-3xl p-10 mt-8 shadow-2xl border border-[rgba(255,255,255,0.18)] backdrop-blur-md">

      <h2 className="text-4xl font-bold text-[#26002f]">
        Plan Your Next Adventure
      </h2>

      <p className="text-[#4c2b5d] mt-3">
        AI Agents create routes, discover hidden gems,
        generate quests and help you replan your trip in real time.
      </p>

      {/* Row 1: From / To / Start / End */}
      <div className="grid md:grid-cols-4 gap-4 mt-8">
        <input
          type="text"
          name="origin"
          value={form.origin}
          onChange={handleChange}
          placeholder="From (e.g. Chennai)"
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        />
        <input
          type="text"
          name="destination"
          value={form.destination}
          onChange={handleChange}
          placeholder="To (e.g. Munnar)"
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        />
        <input
          type="date"
          name="start_date"
          value={form.start_date}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        />
        <input
          type="date"
          name="end_date"
          value={form.end_date}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        />
      </div>

      {/* Row 2: Mood / Transport / Stay / Budget / Group / Submit */}
      <div className="grid md:grid-cols-6 gap-4 mt-4">
        <input
          type="text"
          name="mood"
          value={form.mood}
          onChange={handleChange}
          placeholder="Mood (adventure)"
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        />
        <select
          name="transport_mode"
          value={form.transport_mode}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        >
          <option value="car">Car</option>
          <option value="train">Train</option>
          <option value="bus">Bus</option>
          <option value="flight">Flight</option>
        </select>
        <select
          name="stay_type"
          value={form.stay_type}
          onChange={handleChange}
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        >
          <option value="hotel">Hotel</option>
          <option value="resort">Resort</option>
          <option value="hostel">Hostel</option>
          <option value="homestay">Homestay</option>
        </select>
        <input
          type="number"
          name="budget"
          value={form.budget}
          onChange={handleChange}
          placeholder="Budget (INR)"
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        />
        <input
          type="number"
          name="group_size"
          value={form.group_size}
          onChange={handleChange}
          placeholder="Group Size"
          min={1}
          disabled={isLoading}
          className="bg-[var(--text-on-dark)]/90 rounded-2xl p-4 text-[var(--basecamp-900)] border border-[rgba(155,108,255,0.2)] shadow-inner"
        />
        <motion.button
          onClick={handleSubmit}
          disabled={isLoading}
          whileTap={{ scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
          className="bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white rounded-2xl font-semibold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 shadow-lg"
        >
          {isLoading ? "🔄 Planning..." : "🚀 Generate Journey"}
        </motion.button>
      </div>

    </div>
  );
}

export default Hero;