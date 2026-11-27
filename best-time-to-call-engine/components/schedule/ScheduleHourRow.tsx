import { hourLabel } from "@/lib/schedule";
import { ZoneGroupCard } from "./ZoneGroupCard";
import {
  CODE_TO_NAME,
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

function formatConnects(leads: number, expectedConnects: number) {
  if (leads <= 0 || expectedConnects <= 0) return "0 est. connects";
  const rounded = Math.round(expectedConnects);
  return rounded === 0 ? "<1 est. connects" : `~${rounded} est. connects`;
}

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

  const totalStatesWithLeads = item.groups.reduce(
    (sum, g) => sum + g.states.length,
    0,
  );

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
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-slate-50"
      >
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
              {topGroup
                ? `${totalStatesWithLeads} ${totalStatesWithLeads === 1 ? "state" : "states"}`
                : item.availableStateCount > 0
                  ? `${item.availableStateCount} open`
                  : "Closed"}
            </span>
          )}
        </div>

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
                {topGroup.localTime} local · {topGroup.leads.toLocaleString()}
                {topGroup.leads === 1 ? "lead" : "leads"}
                {topGroup.rate !== null
                  ? ` · ${formatConnects(topGroup.leads, topGroup.expectedConnects)}`
                  : ""}
              </p>
            </>
          ) : item.availableStateCount > 0 ? (
            <>
              <p className="text-sm font-medium text-slate-600">
                0 leads in {item.availableStateCount} open states
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                Expand to view open states by time zone
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">
              Outside calling hours (8 AM–9 PM local)
            </p>
          )}
        </div>

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
          ) : item.openZones.length > 0 ? (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500">
                {item.availableStateCount} states are within calling hours (0
                leads imported in them yet):
              </p>

              {item.openZones.map((zoneGroup) => (
                <div
                  key={zoneGroup.zone}
                  className="rounded-lg border border-slate-200 bg-white p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {zoneGroup.zone}
                      </p>
                      <p className="text-xs text-slate-500">
                        {zoneGroup.localTime} local · {zoneGroup.states.length}
                        open states
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPriorityColor(
                          zoneGroup.rate,
                        )}`}
                      >
                        {getPriority(zoneGroup.rate)}
                      </span>
                      {zoneGroup.rate !== null && (
                        <span className="text-sm font-semibold tabular-nums text-emerald-700">
                          {(zoneGroup.rate * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {zoneGroup.states.map(({ code }) => {
                      const name = CODE_TO_NAME[code] ?? code;
                      return onSelectState ? (
                        <button
                          key={code}
                          type="button"
                          title={name}
                          onClick={() => onSelectState(teamHour, code)}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-900"
                        >
                          {code}
                        </button>
                      ) : (
                        <span
                          key={code}
                          title={name}
                          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700"
                        >
                          {code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => onSelectHour(teamHour)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <span>View {hourLabel(teamHour)} on map</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              All US states are outside calling hours (8:00 AM–9:00 PM local)
              during this slot.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
