import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaRobot,
  FaClock,
  FaFlagCheckered,
  FaStar,
} from "react-icons/fa";

/**
 * DestinationCards — Side detail panels that appear when a destination node
 * is selected. Left card shows place images + location info, right card shows
 * quest details + rewards.
 */
function DestinationCards({ stop }) {
  if (!stop) return null;

  return (
    <AnimatePresence mode="wait">
      <div
        key={stop.id}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8"
      >
        {/* ────── Left Card — Place Images & Info ────── */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.05 }}
          className="dest-card"
        >
          {/* Image pair */}
          <div className="grid grid-cols-2 gap-0">
            <img
              src={stop.images?.[0]}
              alt={stop.name}
              className="dest-card-image"
            />
            <img
              src={stop.images?.[1]}
              alt={stop.name}
              className="dest-card-image"
            />
          </div>

          <div className="dest-card-body">
            {/* Title */}
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">{stop.icon}</span>
              {stop.name}
            </h3>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-3 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FaMapMarkerAlt className="text-cyan-400" />
                {stop.location}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FaRobot className="text-cyan-400" />
                {stop.agent}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FaClock className="text-cyan-400" />
                {stop.estimatedTime || "1-2 hours"}
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-400 mt-4 leading-7 text-sm">
              {stop.description}
            </p>
          </div>
        </motion.div>

        {/* ────── Right Card — Quest & Rewards ────── */}
        <motion.div
          initial={{ x: 80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.12 }}
          className="dest-card"
        >
          {/* Gradient quest header */}
          <div
            className="px-6 py-8"
            style={{
              background:
                "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(139,92,246,0.1) 100%)",
            }}
          >
            <div className="quest-badge">
              <FaFlagCheckered />
              QUEST
            </div>

            <h3 className="text-2xl font-bold text-white mt-4">
              {stop.quest}
            </h3>

            <p className="text-gray-400 mt-3 text-sm leading-6">
              Complete this quest at {stop.name} to earn experience points and
              unlock a special badge.
            </p>
          </div>

          <div className="dest-card-body">
            {/* Reward info */}
            <div className="reward-bar">
              <FaStar className="text-amber-400 text-xl flex-shrink-0" />
              <div>
                <div className="reward-xp">{stop.xp} XP</div>
                <p className="text-gray-400 text-xs mt-0.5">
                  {stop.reward || "Complete this quest to earn XP"}
                </p>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center justify-between mt-5 px-1">
              <span className="text-gray-400 text-sm">Difficulty</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background:
                        s <= Math.ceil(stop.xp / 35)
                          ? "#0ea5e9"
                          : "rgba(100,116,139,0.3)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center justify-between mt-3 px-1">
              <span className="text-gray-400 text-sm">Estimated Time</span>
              <span className="text-white text-sm font-medium">
                {stop.estimatedTime || "1-2 hours"}
              </span>
            </div>

            {/* CTA */}
            <button className="start-quest-btn">
              🚀 Start Quest
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default DestinationCards;
