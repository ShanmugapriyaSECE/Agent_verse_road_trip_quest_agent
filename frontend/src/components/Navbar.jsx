import { FaHome, FaMedal, FaUserCircle, FaHotel, FaSyncAlt } from "react-icons/fa";

function Navbar({ currentPage, onNavigate }) {
  const isLanding = currentPage === "landing";

  return (
    <nav
      className={`w-full z-50 px-8 sm:px-12 py-6 flex items-center justify-between gap-8 font-['Montserrat',sans-serif] transition-all duration-300 ${
        isLanding
          ? "absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent border-none"
          : "relative bg-[var(--basecamp-900)]/90 backdrop-blur-md border-b border-white/10"
      }`}
    >
      {/* Brand Logo - Far Left */}
      <div
        className="flex items-center gap-3 cursor-pointer shrink-0"
        onClick={() => onNavigate && onNavigate("landing")}
      >
        <h1 className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase drop-shadow-md">
          Road Trip <span className="text-[#ff75c8]">Quest</span>
        </h1>
      </div>

      {/* Navigation Links - Centered / Evenly Spaced */}
      <div className="flex items-center gap-4 sm:gap-8 font-semibold text-xs sm:text-sm tracking-wide">
        <button
          onClick={() => onNavigate && onNavigate("landing")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentPage === "landing"
              ? "bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-md font-bold"
              : "text-white/80 hover:text-white"
          }`}
        >
          Home
        </button>

        <button
          onClick={() => onNavigate && onNavigate("plan")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentPage === "plan"
              ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-md font-bold"
              : "text-white/80 hover:text-white"
          }`}
        >
          Plan Trip
        </button>

        <button
          onClick={() => onNavigate && onNavigate("journey")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentPage === "journey"
              ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-md font-bold"
              : "text-white/80 hover:text-white"
          }`}
        >
          Your Journey
        </button>

        <button
          onClick={() => onNavigate && onNavigate("quests")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentPage === "quests"
              ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-md font-bold"
              : "text-white/80 hover:text-white"
          }`}
        >
          Quests
        </button>

        <button
          onClick={() => onNavigate && onNavigate("badges")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentPage === "badges"
              ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-md font-bold"
              : "text-white/80 hover:text-white"
          }`}
        >
          Badges
        </button>

        <button
          onClick={() => onNavigate && onNavigate("bookings")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentPage === "bookings"
              ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-md font-bold"
              : "text-white/80 hover:text-white"
          }`}
        >
          Bookings
        </button>

        <button
          onClick={() => onNavigate && onNavigate("replan")}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentPage === "replan"
              ? "bg-gradient-to-r from-[#9b6cff] to-[#ff5ca8] text-white shadow-md font-bold"
              : "text-white/80 hover:text-white"
          }`}
        >
          Replan
        </button>
      </div>

      {/* Profile Icon - Far Right */}
      <button className="text-xl sm:text-2xl text-white/90 hover:text-white transition shrink-0">
        <FaUserCircle />
      </button>
    </nav>
  );
}

export default Navbar;