import {
  CODE_TO_NAME,
  getPriority,
  getPriorityColor,
  type ZoneGroup,
} from "../../lib/scheduleHelpers";

type Props = {
  group: ZoneGroup;
  isTopPriority: boolean;
  onSelectState?: (stateCode: string) => void;
};

export function ZoneGroupCard({ group, isTopPriority, onSelectState }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{group.zone}</p>
            {isTopPriority && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                #1 Priority
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {group.localTime} local time · {group.leads.toLocaleString()} leads
            {group.rate !== null
              ? ` · ~${Math.max(1, Math.round(group.expectedConnects))} est. connects`
              : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPriorityColor(
              group.rate,
            )}`}
          >
            {getPriority(group.rate)}
          </span>
          <span className="text-sm font-semibold tabular-nums text-emerald-700">
            {group.rate !== null
              ? `${(group.rate * 100).toFixed(1)}%`
              : "No estimate"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {group.states.map(({ code, leads }) => {
          const stateName = CODE_TO_NAME[code] ?? code;
          const label = (
            <>
              <span>{code}</span>
              <span className="text-slate-400">·</span>
              <span className="tabular-nums text-slate-500">{leads}</span>
            </>
          );

          return onSelectState ? (
            <button
              key={code}
              type="button"
              title={`${stateName} (${leads} leads)`}
              onClick={() => onSelectState(code)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
            >
              {label}
            </button>
          ) : (
            <span
              key={code}
              title={stateName}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
