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
    { id: "start", position: { x: 0, y: 100 }, data: { label: "🚩 Start" } },
    ...stops.map((stop, i) => ({
      id: String(stop.id),
      position: { x: 220 + i * 230, y: i % 2 === 0 ? 30 : 150 },
      data: { label: `${stop.icon || "📍"} ${stop.name}` },
    })),
    {
      id: "end",
      position: { x: 220 + stops.length * 230, y: 100 },
      data: { label: "🏁 End" },
    },
  ];

  const allEdges = [];
  const ids = ["start", ...stops.map((s) => String(s.id)), "end"];
  for (let i = 0; i < ids.length - 1; i++) {
    allEdges.push({ id: `e${ids[i]}-${ids[i + 1]}`, source: ids[i], target: ids[i + 1], animated: true });
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

      <div className="route-map-container">
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </section>
  );
}

export default RouteMap;