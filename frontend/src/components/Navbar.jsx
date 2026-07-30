import { FaRoute, FaMedal, FaUserCircle, FaHotel, FaSyncAlt } from "react-icons/fa";

function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="w-full bg-[linear-gradient(90deg,rgba(155,108,255,0.24),rgba(255,92,168,0.14))] border-b border-white/10 px-6 py-4 flex flex-wrap items-center justify-between gap-6 backdrop-blur-sm">

      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🚗</span>
        <h1 className="text-2xl font-bold text-[var(--ember-500)]">Road Trip Quest</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => onNavigate && onNavigate("plan")}
          className={`px-3 py-2 rounded-full font-semibold ${currentPage === "plan" ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-xl" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          Plan Trip
        </button>

        <button
          onClick={() => onNavigate && onNavigate("journey")}
          className={`px-3 py-2 rounded-full font-semibold ${currentPage === "journey" ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-xl" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          Your Journey
        </button>

        <button
          onClick={() => onNavigate && onNavigate("quests")}
          className={`px-3 py-2 rounded-full font-semibold ${currentPage === "quests" ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-xl" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          🎯 Quests
        </button>

        <button
          onClick={() => onNavigate && onNavigate("badges")}
          className={`px-3 py-2 rounded-full font-semibold ${currentPage === "badges" ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-xl" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          <FaMedal className="inline mr-2" /> Badges
        </button>

        <button
          onClick={() => onNavigate && onNavigate("bookings")}
          className={`px-3 py-2 rounded-full font-semibold ${currentPage === "bookings" ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-xl" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          <FaHotel className="inline mr-2" /> Bookings
        </button>

        <button
          onClick={() => onNavigate && onNavigate("replan")}
          className={`px-3 py-2 rounded-full font-semibold ${currentPage === "replan" ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-xl" : "text-[var(--muted-text)] hover:text-[var(--text-on-dark)]"}`}
        >
          <FaSyncAlt className="inline mr-2" /> Replan
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