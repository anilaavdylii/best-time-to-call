type Props = {
  filledCount: number; // states drawn green
  showAll: boolean; // are states without leads included?
  unavailableCount: number;
  hasLeads: boolean;
  callableLeads: number; // leads in callable states
  totalLeads: number;
};

// The three number tiles above the map.
export default function MapSummary({
  filledCount,
  showAll,
  unavailableCount,
  hasLeads,
  callableLeads,
  totalLeads,
}: Props) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3 scroll-mt-6">
      <div className="rounded-xl bg-emerald-50 px-4 py-3">
        <p className="text-2xl font-bold text-emerald-700 tabular-nums">
          {filledCount}
        </p>
        <p className="text-xs font-medium text-emerald-800">
          {showAll ? "Available states" : "Available states with leads"}
        </p>
      </div>

      <div className="rounded-xl bg-slate-50 px-4 py-3">
        <p className="text-2xl font-bold text-slate-700 tabular-nums">
          {unavailableCount}
        </p>
        <p className="text-xs font-medium text-slate-500">Unavailable states</p>
      </div>

      <div className="rounded-xl bg-indigo-50 px-4 py-3">
        <p className="text-2xl font-bold text-indigo-700 tabular-nums">
          {hasLeads ? callableLeads : "-"}
        </p>
        <p className="text-xs font-medium text-indigo-800">
          {hasLeads
            ? `Leads you can call (of ${totalLeads})`
            : "Import numbers to see leads"}
        </p>
      </div>
    </div>
  );
}
