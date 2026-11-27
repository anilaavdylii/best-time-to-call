import { PRIORITY_COLORS, type StatePriority } from "./StateMap";

type Props = {
  showAll: boolean;
};

export default function MapLegend({ showAll }: Props) {
  const items: { priority: StatePriority; label: string }[] = [
    {
      priority: "unavailable",
      label: showAll ? "Outside calling hours" : "Not callable or no leads",
    },
    {
      priority: "no-data",
      label: "No estimate available",
    },
    {
      priority: "low",
      label: "Lower chance",
    },
    {
      priority: "medium",
      label: "Good chance",
    },
    {
      priority: "high",
      label: "Best chance",
    },
  ];

  return (
    <div
      aria-label="Map legend"
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-slate-100 pt-4"
    >
      {items.map((item) => (
        <div key={item.priority} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-sm"
            style={{
              backgroundColor: PRIORITY_COLORS[item.priority],
            }}
          />
          <span className="text-xs text-slate-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
