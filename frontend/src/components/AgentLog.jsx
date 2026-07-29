import { FaCheckCircle, FaSpinner } from "react-icons/fa";

function AgentLog({ isLoading }) {
 const agents = [
    { name: "Trip Planning",        alwaysDone: false },
    { name: "Places & Food Search", alwaysDone: false },
    { name: "Live Weather Check",   alwaysDone: false },
    { name: "Quest Formatting",     alwaysDone: false },
  ];

  return (
    <div className="bg-[var(--basecamp-800)] rounded-2xl p-4 shadow-md border border-black/10">

      <h2 className="text-lg font-bold mb-3 text-[var(--ember-500)]">
        ⚙️ Planning Pipeline
      </h2>

      {agents.map((agent) => {
        const done = !isLoading;
        return (
          <div
            key={agent.name}
            className="flex justify-between items-center mb-3 text-[var(--muted-text)]"
          >
            <span>{agent.name}</span>

            {done ? (
              <FaCheckCircle className="text-[var(--sea-500)]" />
            ) : (
              <FaSpinner className="animate-spin text-[var(--ember-500)]" />
            )}
          </div>
        );
      })}

    </div>
  );
}

export default AgentLog;