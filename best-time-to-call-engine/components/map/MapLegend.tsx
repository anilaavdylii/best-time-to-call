type Props = { showAll: boolean };

export default function MapLegend({ showAll }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-5 border-t border-slate-100 pt-4">
      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-emerald-600" />
        <span className="text-xs text-slate-600">
          {showAll ? "Available to call" : "Available, with leads"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm bg-slate-200" />
        <span className="text-xs text-slate-600">
          {showAll ? "Outside calling hours" : "Not callable, or no leads"}
        </span>
      </div>
    </div>
  );
}
