import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaRobot,
  FaClock,
  FaFlagCheckered,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import { stops as mockStops } from "../data/mockData";

/**
 * Generates an SVG path string and array of point coordinates for N stops
 * along a winding S-curve road that recedes into the background.
 */
function generateWindingPath(stopsCount) {
  const width = 800;
  const height = 650;

  const points = [];
  const startY = 560;
  const endY = 80;
  const totalYSpan = startY - endY;

  for (let i = 0; i < stopsCount; i++) {
    const t = i / Math.max(1, stopsCount - 1);
    const y = startY - t * totalYSpan;

    // S-curve oscillation for X coordinate
    const xOffset = Math.sin(t * Math.PI * 2.2) * 250;
    const x = width / 2 + xOffset;

    points.push({ x, y, index: i });
  }

  if (points.length < 2) return { pathD: "", points, width, height };

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midY = (p1.y + p2.y) / 2;
    d += ` C ${p1.x} ${midY}, ${p2.x} ${midY}, ${p2.x} ${p2.y}`;
  }

  return { pathD: d, points, width, height };
}

// Color palette for teardrop pin markers
const PIN_COLORS = [
  { bg: "#3b82f6", border: "#60a5fa", shadow: "rgba(59, 130, 246, 0.6)" }, // Blue
  { bg: "#f59e0b", border: "#fbbf24", shadow: "rgba(245, 158, 11, 0.6)" }, // Yellow/Gold
  { bg: "#ef4444", border: "#f87171", shadow: "rgba(239, 68, 68, 0.6)" },  // Red
  { bg: "#10b981", border: "#34d399", shadow: "rgba(16, 185, 129, 0.6)" }, // Emerald
  { bg: "#8b5cf6", border: "#a78bfa", shadow: "rgba(139, 92, 246, 0.6)" }, // Purple
  { bg: "#06b6d4", border: "#22d3ee", shadow: "rgba(6, 182, 212, 0.6)" },  // Cyan
];

function JourneyRoute3D({ stops, onSelect }) {
  const [selectedStop, setSelectedStop] = useState(null);

  // Fall back to mock data if no real stops are provided
  const displayStops = stops && stops.length > 0 ? stops : mockStops;

  const { pathD, points, width, height } = generateWindingPath(displayStops.length);

  function handleNodeClick(stop, e) {
    if (e) e.stopPropagation();
    const next = selectedStop?.id === stop.id ? null : stop;
    setSelectedStop(next);
    if (onSelect) onSelect(next);
  }

  return (
    <section className="mt-6 relative">
      {/* Section header */}
      <div className="mb-4 text-center">
        <h2 className="section-title">🗺️ Winding Adventure Route</h2>
        <p className="section-subtitle">
          Click any destination pin directly on the road to view its pictures, quest & rewards right beside it!
        </p>
      </div>

      {/* ── 3D Winding Road Canvas Container ── */}
      <div className="winding-3d-scene">
        <div className="winding-3d-canvas">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="winding-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Road casing shadow */}
              <filter id="road-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#000" floodOpacity="0.7" />
              </filter>
              {/* Road asphalt gradient */}
              <linearGradient id="asphalt-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            {/* Road border / casing (outer white outline like Image 1/2) */}
            <path
              d={pathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="56"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
              filter="url(#road-shadow)"
            />

            {/* Asphalt surface (dark gray road body) */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#asphalt-gradient)"
              strokeWidth="48"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Road inner edge lines */}
            <path
              d={pathD}
              fill="none"
              stroke="#475569"
              strokeWidth="44"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
            />

            {/* Dashed center line (white dashes like Image 2) */}
            <path
              d={pathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeDasharray="14 14"
              strokeLinecap="round"
              className="animated-road-dash"
              opacity="0.85"
            />

            {/* SVG Interactive Pin Elements (Guarantees 100% clickability across SVG transform) */}
            {displayStops.map((stop, i) => {
              const pt = points[i];
              if (!pt) return null;

              const isSelected = selectedStop?.id === stop.id;
              const pinColor = PIN_COLORS[i % PIN_COLORS.length];

              return (
                <g
                  key={`svg-pin-${stop.id}`}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  className="svg-pin-group"
                  onClick={(e) => handleNodeClick(stop, e)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Invisible hit-area circle for super easy clicking */}
                  <circle r="36" fill="transparent" />

                  {/* Teardrop Pin Shape */}
                  <path
                    d="M 0 -45 C -12 -45 -22 -35 -22 -22 C -22 -8 0 12 0 12 C 0 12 22 -8 22 -22 C 22 -35 12 -45 0 -45 Z"
                    fill={isSelected ? "#fbbf24" : pinColor.bg}
                    stroke={isSelected ? "#ffffff" : pinColor.border}
                    strokeWidth="3"
                    className="svg-pin-path"
                  />

                  {/* Inner White Circle */}
                  <circle cx="0" cy="-24" r="9" fill="#ffffff" />
                </g>
              );
            })}
          </svg>

          {/* HTML Overlay for Labels, Badges, and Popover Side Cards right beside the node */}
          <div className="pins-overlay">
            {displayStops.map((stop, i) => {
              const pt = points[i];
              if (!pt) return null;

              const leftPct = (pt.x / width) * 100;
              const topPct = (pt.y / height) * 100;

              const isSelected = selectedStop?.id === stop.id;
              const isStart = i === 0;
              const isEnd = i === displayStops.length - 1;

              // Position popover card on left or right depending on node X coordinate
              const isLeftHalf = pt.x < width / 2;

              return (
                <div
                  key={`overlay-${stop.id}`}
                  className={`node-overlay-anchor ${isSelected ? "is-selected" : ""}`}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                  }}
                >
                  {/* Pin label bubble */}
                  <button
                    type="button"
                    className="pin-label-tag"
                    onClick={(e) => handleNodeClick(stop, e)}
                  >
                    <span className="pin-icon">{stop.icon}</span>
                    <span className="pin-name">{stop.name}</span>
                  </button>

                  {/* Start / Destination Badge */}
                  {isStart && <span className="pin-badge start">START</span>}
                  {isEnd && <span className="pin-badge end">DESTINATION</span>}

                  {/* ────── Floating Node Card Beside the Pin ────── */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`node-inline-card ${isLeftHalf ? "pop-right" : "pop-left"}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Close button */}
                        <button
                          type="button"
                          className="node-card-close"
                          onClick={(e) => handleNodeClick(stop, e)}
                          title="Close"
                        >
                          <FaTimes />
                        </button>

                        {/* Destination Photo Header */}
                        <div className="relative">
                          <img
                            src={stop.images?.[0]}
                            alt={stop.name}
                            className="w-full h-36 object-cover rounded-t-xl"
                          />
                          <div className="absolute bottom-2 left-3 bg-[var(--basecamp-900)]/80 backdrop-blur px-3 py-1 rounded-full text-xs text-[var(--muted-text)] font-semibold flex items-center gap-1">
                            <FaMapMarkerAlt /> {stop.location}
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                              <span>{stop.icon}</span> {stop.name}
                            </h4>
                            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                              <FaStar className="text-amber-400" /> {stop.xp} XP
                            </span>
                          </div>

                          <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">
                            {stop.description}
                          </p>

                          {/* Quest box */}
                          <div className="bg-[var(--basecamp-800)]/90 border border-[var(--ember-500)]/20 rounded-xl p-3">
                            <div className="quest-badge text-[10px] mb-1">
                              <FaFlagCheckered /> QUEST
                            </div>
                            <p className="text-white font-semibold text-xs">
                              {stop.quest}
                            </p>
                            {stop.reward && (
                              <p className="text-amber-300/90 text-[11px] mt-1">
                                🎁 {stop.reward}
                              </p>
                            )}
                          </div>

                          {/* Meta stats */}
                          <div className="flex justify-between text-[11px] text-gray-400 pt-1">
                            <span className="flex items-center gap-1">
                              <FaRobot className="text-cyan-400" /> {stop.agent}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaClock className="text-cyan-400" /> {stop.estimatedTime || "1-2 hours"}
                            </span>
                          </div>

                          {/* CTA */}
                          <button
                            type="button"
                            className="start-quest-btn text-xs py-2.5 mt-2"
                          >
                            🚀 Start Quest
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default JourneyRoute3D;
