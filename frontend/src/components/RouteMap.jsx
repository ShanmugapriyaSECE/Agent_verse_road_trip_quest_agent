import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

// Static fallback nodes/edges when no real stops are provided
const fallbackNodes = [
  { id: "1", position: { x: 0,   y: 100 }, data: { label: "🚩 Start" } },
  { id: "2", position: { x: 220, y: 30  }, data: { label: "🍃 Tea Museum" } },
  { id: "3", position: { x: 450, y: 120 }, data: { label: "🌊 Waterfalls" } },
  { id: "4", position: { x: 680, y: 40  }, data: { label: "🌿 Spice Garden" } },
  { id: "5", position: { x: 900, y: 130 }, data: { label: "☕ Cafe" } },
  { id: "6", position: { x: 1120, y: 50 }, data: { label: "🏔️ Echo Point" } },
  { id: "7", position: { x: 1340, y: 100 }, data: { label: "🏁 Destination" } },
];

const fallbackEdges = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e2-3", source: "2", target: "3", animated: true },
  { id: "e3-4", source: "3", target: "4", animated: true },
  { id: "e4-5", source: "4", target: "5", animated: true },
  { id: "e5-6", source: "5", target: "6", animated: true },
  { id: "e6-7", source: "6", target: "7", animated: true },
];

function buildNodesAndEdges(stops) {
  if (!stops || stops.length === 0) return { nodes: fallbackNodes, edges: fallbackEdges };

  // Add a start node, one node per stop, and a finish node
  const allNodes = [
    {
      id: "start",
      position: { x: 0, y: 100 },
      data: { label: "🚩 Start" },
      style: {
        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
        color: "white",
        border: "2px solid rgba(147, 51, 234, 0.45)",
        borderRadius: "24px",
        padding: "18px 14px",
        boxShadow: "0 18px 50px rgba(79, 70, 229, 0.22)",
      },
    },
    ...stops.map((stop, i) => ({
      id: String(stop.id),
      position: { x: 220 + i * 240, y: i % 2 === 0 ? 30 : 170 },
      data: { label: `${stop.icon || "📍"} ${stop.name}` },
      style: {
        background: "rgba(15, 23, 42, 0.95)",
        color: "#f8fafc",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: "24px",
        padding: "18px 16px",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.35)",
      },
    })),
    {
      id: "end",
      position: { x: 220 + stops.length * 240, y: 100 },
      data: { label: "🏁 End" },
      style: {
        background: "linear-gradient(135deg, #f97316, #facc15)",
        color: "#111827",
        border: "2px solid rgba(251, 146, 60, 0.45)",
        borderRadius: "24px",
        padding: "18px 14px",
        boxShadow: "0 18px 50px rgba(244, 114, 23, 0.22)",
      },
    },
  ];

  const allEdges = [];
  const ids = ["start", ...stops.map((s) => String(s.id)), "end"];
  for (let i = 0; i < ids.length - 1; i++) {
    allEdges.push({
      id: `e${ids[i]}-${ids[i + 1]}`,
      source: ids[i],
      target: ids[i + 1],
      animated: true,
      style: {
        stroke: "#8b5cf6",
        strokeWidth: 3,
        strokeDasharray: "8 10",
      },
    });
  }

  return { nodes: allNodes, edges: allEdges };
}

function RouteMap({ stops }) {
  const { nodes, edges } = buildNodesAndEdges(stops);

  return (
    <section className="route-map-section">
      <h2 className="section-title">📍 Route Map</h2>
      <p className="section-subtitle">
        Interactive node graph of your journey
      </p>

      <div className="route-map-container overflow-hidden rounded-[32px] border border-white/10 bg-[rgba(8,15,29,0.96)] shadow-[0_28px_80px_rgba(15,23,42,0.45)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          style={{ width: "100%", height: "520px", background: "linear-gradient(180deg, rgba(8,15,29,0.96), rgba(15,23,42,0.96))" }}
        >
          <Background gap={16} color="#1f2937" />
          <MiniMap nodeColor="#8b5cf6" />
          <Controls />
        </ReactFlow>
      </div>
    </section>
  );
}

export default RouteMap;