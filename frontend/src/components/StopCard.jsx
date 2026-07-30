import { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  FaMapMarkerAlt,
  FaStar,
  FaRobot,
  FaClock,
  FaFlagCheckered,
} from "react-icons/fa";

function StopCard({ stop }) {
  const [questStarted, setQuestStarted] = useState(false);

  const handleStartQuest = () => {
    setQuestStarted(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#ffb347", "#ffcc5c", "#ff6b35", "#5db39d"],
    });

    window.setTimeout(() => setQuestStarted(false), 1500);
  };

  if (!stop) {
    return (
      <div className="mt-10 bg-[var(--basecamp-800)] rounded-3xl p-10 text-center text-[var(--muted-text)] shadow-xl">
        <div className="text-6xl mb-4">🗺️</div>
        <h2 className="text-2xl font-bold text-[var(--text-on-dark)]">
          Select a Destination
        </h2>
        <p className="mt-3">
          Click on any destination from the journey map to view its details,
          quests, rewards, and AI recommendations.
        </p>
      </div>
    );
  }

  return (
    <motion.div whileHover={{ scale: 1.05, rotate: -2 }} transition={{ type: 'spring', stiffness: 260 }} className="mt-10 bg-[var(--basecamp-800)] rounded-3xl overflow-hidden shadow-2xl border border-black/10">

      {/* Images */}
      <div className="grid lg:grid-cols-2 gap-4 p-5">
        <img
          src={stop.images?.[0] || `https://source.unsplash.com/random/900x600/?roadtrip&sig=1`}
          alt={stop.name}
          className="w-full h-72 object-cover rounded-2xl border border-[rgba(255,255,255,0.08)]"
        />

        <img
          src={stop.images?.[1] || `https://source.unsplash.com/random/900x600/?scenic&sig=2`}
          alt={stop.name}
          className="w-full h-72 object-cover rounded-2xl border border-[rgba(255,255,255,0.08)]"
        />
      </div>

      {/* Details */}
      <div className="p-8">

        <div className="flex items-center justify-between flex-wrap gap-3">

          <h2 className="text-4xl font-bold text-[var(--text-on-dark)]">
            {stop.icon} {stop.name}
          </h2>

          <span className="bg-[var(--ember-500)] text-black px-4 py-2 rounded-full">
            ⭐ {stop.xp} XP
          </span>

        </div>

        <p className="text-[var(--muted-text)] mt-5 leading-7">
          {stop.description}
        </p>

        {/* Info Cards */}

        <div className="grid md:grid-cols-2 gap-5 mt-8">

          <div className="bg-[var(--basecamp-700)] rounded-3xl p-4 flex items-center gap-3 border border-[rgba(255,255,255,0.08)] shadow-inner">
            <FaMapMarkerAlt className="text-[var(--sea-500)] text-xl" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Location</p>
              <p>{stop.location}</p>
            </div>
          </div>

          <div className="bg-[var(--basecamp-700)] rounded-3xl p-4 flex items-center gap-3 border border-[rgba(255,255,255,0.08)] shadow-inner">
            <FaRobot className="text-[var(--sea-500)] text-xl" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Data Source</p>
              <p>{stop.agent}</p>
            </div>
          </div>

          <div className="bg-[var(--basecamp-700)] rounded-3xl p-4 flex items-center gap-3 border border-[rgba(255,255,255,0.08)] shadow-inner">
            <FaClock className="text-[var(--sea-500)] text-xl" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Estimated Time</p>
              <p>{stop.estimatedTime || "1-2 hours"}</p>
            </div>
          </div>

          <div className="bg-[var(--basecamp-700)] rounded-3xl p-4 flex items-center gap-3 border border-[rgba(255,255,255,0.08)] shadow-inner">
            <FaStar className="text-[var(--ember-500)] text-xl" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Difficulty</p>
              <p>Easy</p>
            </div>
          </div>

        </div>

        {/* Quest */}

        <div className="bg-[var(--basecamp-900)] rounded-2xl p-6 mt-8">

          <h3 className="text-2xl font-semibold flex items-center gap-3">
            <FaFlagCheckered className="text-[var(--ember-500)]" />
            Quest
          </h3>

          <p className="mt-4 text-[var(--muted-text)]">
            {stop.quest}
          </p>

        </div>

        {/* Reward */}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-[var(--muted-text)]">
              Complete this quest to earn
            </p>

            <p className="text-3xl font-bold text-[var(--ember-500)]">
              ⭐ {stop.xp} XP
            </p>
          </div>

          <motion.button
            onClick={handleStartQuest}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="bg-gradient-to-r from-[#ff9f5e] to-[#f46d3b] hover:brightness-105 transition px-8 py-4 rounded-xl font-semibold text-lg text-black"
          >
            Start Quest 🚀
          </motion.button>
          {questStarted && (
            <p className="mt-3 text-[var(--sea-500)] font-semibold">Quest started! Keep exploring for bonus rewards.</p>
          )}

        </div>

      </div>

    </motion.div>
  );
}

export default StopCard;