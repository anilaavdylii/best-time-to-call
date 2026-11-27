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

function formatConnects(leads: number, expectedConnects: number) {
  if (leads <= 0 || expectedConnects <= 0) return "0 est. connects";
  const rounded = Math.round(expectedConnects);
  return rounded === 0 ? "<1 est. connects" : `~${rounded} est. connects`;
}

export function ZoneGroupCard({ group, isTopPriority, onSelectState }: Props) {
  const showPriorityBadge = isTopPriority && group.leads > 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">{group.zone}</p>
            {showPriorityBadge && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                #1 Priority
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {group.localTime} local time · {group.leads.toLocaleString()} leads
            {group.rate !== null && group.leads > 0
              ? ` · ${formatConnects(group.leads, group.expectedConnects)}`
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
        {group.states.map(({ code, leads, rate }) => {
          const stateName = CODE_TO_NAME[code] ?? code;
          const hasCustomRate =
            rate !== null &&
            group.rate !== null &&
            Math.abs(rate - group.rate) >= 0.001;

          const content = (
            <span className="inline-flex items-center gap-1.5">
              <span className="font-semibold text-slate-800">{code}</span>
              <span className="tabular-nums text-slate-500">
                {leads} {leads === 1 ? "lead" : "leads"}
              </span>
              {hasCustomRate && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-emerald-700">
                  {(rate * 100).toFixed(1)}%
                </span>
              )}
            </span>
          );

          return onSelectState ? (
            <button
              key={code}
              type="button"
              title={`${stateName} · ${leads} leads${
                rate !== null
                  ? ` · ${(rate * 100).toFixed(1)}% est. answer`
                  : ""
              }`}
              onClick={() => onSelectState(code)}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs transition-colors hover:border-emerald-300 hover:bg-emerald-50"
            >
              {content}
            </button>
          ) : (
            <div
              key={code}
              title={stateName}
              className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
            >
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
