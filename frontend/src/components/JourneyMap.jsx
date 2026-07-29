import QuestNode from "./QuestNode";
import { stops as mockStops } from "../data/mockData";

function JourneyMap({ onSelect, stops }) {
  // Fall back to mock data if real stops haven't been loaded yet
  const displayStops = stops && stops.length > 0 ? stops : mockStops;

  return (
    <div className="mt-12">

      <h2 className="text-3xl font-bold mb-8 text-center">
        🗺️ Your Adventure Route
      </h2>

      <div className="flex justify-center items-center flex-wrap">

        {displayStops.map((stop, index) => (
          <div key={stop.id} className="flex items-center">

            <QuestNode stop={stop} onClick={onSelect} />

            {index !== displayStops.length - 1 && (
              <div className="w-24 h-1 bg-cyan-500 mx-4 rounded-full"></div>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}

export default JourneyMap;