"use client";

import { useState } from "react";
import type { ShiftSettings } from "@/lib/schedule";
import { ScheduleHourRow } from "./ScheduleHourRow";
import { useDialSchedule } from "../../lib/scheduleHelpers";

type Props = {
  hours: number[];
  prefs: ShiftSettings;
  today: Date;
  baselineRates: Record<number, number>;
  leadsByState: Record<string, number>;
  selectedHour?: number;
  onSelectHour: (hour: number) => void;
  onSelectState?: (hour: number, stateCode: string) => void;
};

export function SchedulePanel({
  hours,
  prefs,
  today,
  baselineRates,
  leadsByState,
  selectedHour,
  onSelectHour,
  onSelectState,
}: Props) {
  const [expandedHours, setExpandedHours] = useState<Record<number, boolean>>(
    {},
  );

  const schedule = useDialSchedule(
    hours,
    prefs,
    today,
    baselineRates,
    leadsByState,
  );

  const allExpanded =
    schedule.length > 0 &&
    schedule.every((item) => Boolean(expandedHours[item.teamHour]));

  function toggleAll() {
    if (allExpanded) {
      setExpandedHours({});
    } else {
      const next: Record<number, boolean> = {};
      for (const item of schedule) {
        next[item.teamHour] = true;
      }
      setExpandedHours(next);
    }
  }

  function toggleHour(hour: number) {
    setExpandedHours((prev) => ({
      ...prev,
      [hour]: !prev[hour],
    }));
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            12-hour dialing schedule
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Recommended time zones and states for each hour of your shift.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {schedule.map((item) => (
          <ScheduleHourRow
            key={item.teamHour}
            item={item}
            isSelected={selectedHour === item.teamHour}
            isOpen={Boolean(expandedHours[item.teamHour])}
            onToggle={() => toggleHour(item.teamHour)}
            onSelectHour={onSelectHour}
            onSelectState={onSelectState}
          />
        ))}
      </div>

      <div className="border-t border-slate-100 px-5 py-3">
        <p className="text-xs text-slate-500">
          Ranked by expected connections (leads × predicted local-hour answer
          rate).
        </p>
      </div>
    </section>
  );
}
