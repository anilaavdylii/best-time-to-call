type Props = {
  filledCount: number;
  showAll: boolean;
  unavailableCount: number;
  hasLeads: boolean;
  callableLeads: number;
  totalLeads: number;
};

export default function MapSummary({
  filledCount,
  showAll,
  unavailableCount,
  hasLeads,
  callableLeads,
  totalLeads,
}: Props) {
  const metrics = [
    {
      value: filledCount,
      label: showAll ? "Available states" : "Ready states",
      color: "text-emerald-700",
    },
    {
      value: unavailableCount,
      label: "Unavailable",
      color: "text-slate-600",
    },
    {
      value: hasLeads ? `${callableLeads} of ${totalLeads}` : "-",
      label: hasLeads ? "Available to call" : "No leads",
      color: "text-indigo-700",
    },
  ];

  return (
    <dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/80">
      {metrics.map((metric) => (
        <div key={metric.label} className="min-w-0 px-3 py-2">
          <dd
            className={`truncate text-base font-bold tabular-nums sm:text-lg ${metric.color}`}
          >
            {metric.value}
          </dd>
          <dt className="truncate text-[11px] font-medium text-slate-500">
            {metric.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
