import { formatINR } from "../format";

function BudgetCard({ transport, accommodation, summary }) {
  const transportCost = transport?.intercity?.cost ?? null;
  const stayOption = accommodation?.options?.[0];
  const stayCost = stayOption?.cost_per_night ?? null;
  const totalCost = summary?.total_cost ?? null;

  const fmt = (val) => (val !== null && val !== undefined ? formatINR(val) : "—");

  return (
    <div className="bg-[var(--basecamp-800)] rounded-2xl p-6 shadow-lg border border-black/10">

      <h2 className="text-xl font-bold text-[var(--ember-500)]">
        💰 Budget Summary
      </h2>

      <div className="space-y-3 mt-5">

        <div className="flex justify-between">
          <span className="text-[var(--muted-text)]">Transport</span>
          <span>{fmt(transportCost)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--muted-text)]">Stay / night</span>
          <span>{fmt(stayCost)}</span>
        </div>

        {stayOption?.name && (
          <p className="text-xs text-[var(--muted-text)] -mt-1">{stayOption.name}</p>
        )}

        <hr className="border-black/10" />

        <div className="flex justify-between font-bold text-[var(--ember-500)]">
          <span>Total Est.</span>
          <span>{fmt(totalCost)}</span>
        </div>

      </div>

    </div>
  );
}

export default BudgetCard;