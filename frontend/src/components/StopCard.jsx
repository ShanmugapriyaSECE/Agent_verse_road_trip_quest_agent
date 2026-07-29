import { motion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaStar,
  FaRobot,
  FaClock,
  FaFlagCheckered,
} from "react-icons/fa";

function StopCard({ stop }) {
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
          src={stop.images[0]}
          alt={stop.name}
          className="w-full h-72 object-cover rounded-2xl"
        />

        <img
          src={stop.images[1]}
          alt={stop.name}
          className="w-full h-72 object-cover rounded-2xl"
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

        <p className="text-gray-400 mt-5 leading-7">
          {stop.description}
        </p>

        {/* Info Cards */}

        <div className="grid md:grid-cols-2 gap-5 mt-8">

          <div className="bg-[var(--basecamp-900)] rounded-xl p-4 flex items-center gap-3">
            <FaMapMarkerAlt className="text-[var(--sea-500)] text-xl" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Location</p>
              <p>{stop.location}</p>
            </div>
          </div>

          <div className="bg-[var(--basecamp-900)] rounded-xl p-4 flex items-center gap-3">
            <FaRobot className="text-[var(--sea-500)] text-xl" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Data Source</p>
              <p>{stop.agent}</p>
            </div>
          </div>

          <div className="bg-[var(--basecamp-900)] rounded-xl p-4 flex items-center gap-3">
            <FaClock className="text-[var(--sea-500)] text-xl" />
            <div>
              <p className="text-sm text-[var(--muted-text)]">Estimated Time</p>
              <p>{stop.estimatedTime || "1-2 hours"}</p>
            </div>
          </div>

          <div className="bg-[var(--basecamp-900)] rounded-xl p-4 flex items-center gap-3">
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

          <button className="bg-cyan-500 hover:bg-cyan-600 transition px-8 py-4 rounded-xl font-semibold text-lg">
            Start Quest 🚀
          </button>

        </div>

      </div>

    </motion.div>
  );
}

export default StopCard;