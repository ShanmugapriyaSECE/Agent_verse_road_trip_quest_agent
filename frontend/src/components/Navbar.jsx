import { FaRoute, FaMedal, FaUserCircle } from "react-icons/fa";

function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="w-full bg-[var(--basecamp-800)] border-b border-black/20 px-6 py-4 flex items-center justify-between gap-6">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🚗</span>
        <h1 className="text-2xl font-bold text-[var(--ember-500)]">Road Trip Quest</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate && onNavigate("plan")}
          className={`px-3 py-2 rounded-md font-semibold ${currentPage === "plan" ? "bg-[var(--ember-500)] text-black" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          Plan Trip
        </button>

        <button
          onClick={() => onNavigate && onNavigate("journey")}
          className={`px-3 py-2 rounded-md font-semibold ${currentPage === "journey" ? "bg-[var(--ember-500)] text-black" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          Your Journey
        </button>

        <button
          onClick={() => onNavigate && onNavigate("quests")}
          className={`px-3 py-2 rounded-md font-semibold ${currentPage === "quests" ? "bg-[var(--ember-500)] text-black" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          🎯 Quests
        </button>

        <button
          onClick={() => onNavigate && onNavigate("badges")}
          className={`px-3 py-2 rounded-md font-semibold ${currentPage === "badges" ? "bg-[var(--ember-500)] text-black" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          <FaMedal className="inline mr-2" /> Badges
        </button>
      </div>

      {/* Profile */}
      <button className="text-2xl text-[var(--sea-500)] hover:opacity-90">
        <FaUserCircle />
      </button>

    </nav>
  );
}

export default Navbar;