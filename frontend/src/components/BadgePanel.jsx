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
          <div
            key={badge}
            className="bg-[var(--basecamp-900)] rounded-xl p-4 text-center hover:scale-105 transition-transform"
          >
            {badge}
          </div>
        ))}

      </div>

    </div>
  );
}

export default BadgePanel;