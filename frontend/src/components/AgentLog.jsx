import { FaCheckCircle, FaSpinner } from "react-icons/fa";

function AgentLog({ isLoading }) {
 const agents = [
    { name: "Trip Planning",        alwaysDone: false },
    { name: "Places & Food Search", alwaysDone: false },
    { name: "Live Weather Check",   alwaysDone: false },
    { name: "Quest Formatting",     alwaysDone: false },
  ];

  return (
    <div className="bg-[linear-gradient(135deg,rgba(77,144,120,0.12),rgba(255,140,66,0.1))] rounded-3xl p-5 shadow-2xl border border-[rgba(255,255,255,0.06)]">

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