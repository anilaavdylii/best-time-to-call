import { hourLabel } from "@/lib/schedule";
import { ZoneGroupCard } from "./ZoneGroupCard";
import {
  getPriority,
  getPriorityColor,
  type HourScheduleItem,
} from "@/lib/scheduleHelpers";

type Props = {
  item: HourScheduleItem;
  isSelected: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelectHour: (hour: number) => void;
  onSelectState?: (hour: number, stateCode: string) => void;
};

export function ScheduleHourRow({
  item,
  isSelected,
  isOpen,
  onToggle,
  onSelectHour,
  onSelectState,
}: Props) {
  const { teamHour, topGroup } = item;
  const topStatesPreview = topGroup
    ? topGroup.states
        .slice(0, 3)
        .map((s) => s.code)
        .join(", ")
    : "";

  return (
    <div
      className={`transition-colors ${
        isSelected
          ? "bg-emerald-50/40 ring-1 ring-inset ring-emerald-200/70"
          : isOpen
            ? "bg-slate-50/50"
            : "bg-white"
      }`}
    >
      {/* Collapsed Header Row */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-slate-50"
      >
        {/* Fixed-width Time Column so every row lines up vertically */}
        <div className="w-20 shrink-0">
          <div className="text-sm font-semibold tabular-nums text-slate-900">
            {hourLabel(teamHour)}
          </div>
          {isSelected ? (
            <span className="mt-0.5 inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
              On map
            </span>
          ) : (
            <span className="text-[11px] text-slate-400">
              {item.availableStateCount} states
            </span>
          )}
        </div>

        {/* Middle Summary Column */}
        <div className="min-w-0 flex-1">
          {topGroup ? (
            <>
              <div className="flex items-center gap-1.5 truncate text-sm">
                <span className="font-semibold text-slate-900">
                  {topGroup.zone}
                </span>
                <span className="text-slate-300">·</span>
                <span className="truncate text-xs text-slate-600">
                  {topStatesPreview}
                  {topGroup.states.length > 3
                    ? ` +${topGroup.states.length - 3}`
                    : ""}
                </span>
              </div>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {topGroup.localTime} local · {item.totalLeads.toLocaleString()}{" "}
                leads
                {topGroup.rate !== null
                  ? ` · ~${Math.max(1, Math.round(topGroup.expectedConnects))} est. connects`
                  : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              No callable leads this hour
            </p>
          )}
        </div>

        {/* Right Metrics & Chevron */}
        <div className="flex shrink-0 items-center gap-3">
          {topGroup && (
            <>
              <span
                className={`hidden rounded-full border px-2.5 py-0.5 text-[11px] font-medium sm:inline-block ${getPriorityColor(
                  topGroup.rate,
                )}`}
              >
                {getPriority(topGroup.rate)}
              </span>

              {topGroup.rate !== null && (
                <span className="w-12 text-right text-sm font-semibold tabular-nums text-emerald-700">
                  {(topGroup.rate * 100).toFixed(1)}%
                </span>
              )}
            </>
          )}

          <svg
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:text-slate-600 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Expanded Drawer */}
      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/80 px-5 pb-4 pt-3">
          {item.groups.length > 0 ? (
            <div className="space-y-2.5">
              {item.groups.map((group, idx) => (
                <ZoneGroupCard
                  key={group.zone}
                  group={group}
                  isTopPriority={idx === 0}
                  onSelectState={
                    onSelectState
                      ? (code) => onSelectState(teamHour, code)
                      : undefined
                  }
                />
              ))}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onSelectHour(teamHour)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-700 shadow-2xs transition-colors hover:border-emerald-300 hover:bg-emerald-50"
                >
                  <span>View {hourLabel(teamHour)} on map</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No states with leads are available to call during this hour.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
