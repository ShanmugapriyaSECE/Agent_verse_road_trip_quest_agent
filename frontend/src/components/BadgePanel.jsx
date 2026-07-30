import { motion } from "framer-motion";

function BadgePanel() {

  const badges = [
    "🥇 Explorer",
    "☕ Foodie",
    "📷 Photographer",
    "🌿 Nature Lover"
  ];

  return (
    <div className="bg-[var(--basecamp-800)] rounded-2xl p-6 shadow-md border border-black/10">

      <h2 className="text-xl font-bold mb-5 text-[var(--ember-500)]">
        🏅 Badges
      </h2>

      <div className="grid grid-cols-2 gap-4">

        {badges.map((badge) => (
          <motion.div
            key={badge}
            whileHover={{ rotate: [0, -5, 5, -3, 0], scale: 1.02 }}
            transition={{ duration: 0.35 }}
            className="bg-[var(--basecamp-900)] rounded-xl p-4 text-center shadow-sm border border-black/10"
          >
            {badge}
          </motion.div>
        ))}

      </div>

    </div>
  );
}

export default BadgePanel;