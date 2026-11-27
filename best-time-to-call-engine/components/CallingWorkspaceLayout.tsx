"use client";

import { useEffect, useMemo, useState } from "react";
import MapPanel from "./map/MapPanel";
import WorkspaceSettings from "./WorkspaceSettings";
import ShiftTimeline from "./ShiftTimeline";

import {
  buildData,
  DEFAULT_SHIFT,
  getDefaultTimezone,
  hourLabel,
  shiftHours,
  type ShiftSettings,
} from "@/lib/schedule";
import { loadBaselineRates } from "@/lib/loadBaselineRates";
import { useStoredState } from "@/lib/useStoredState";
import { SchedulePanel } from "./schedule/SchedulePanel";

type Props = {
  leadsByState: Record<string, number>;
};

const CallingWorkspaceLayout = ({ leadsByState }: Props) => {
  const [prefs, setPrefs] = useStoredState<ShiftSettings>(
    "shiftSettings",
    DEFAULT_SHIFT,
  );
  const [activeTab, setActiveTab] = useState<"map" | "schedule">("map");

  const [hour, setHour] = useState(shiftHours(DEFAULT_SHIFT)[0]);
  const [today, setToday] = useState<Date | null>(null);

  // Allo hourly benchmark rates loaded from the CSV.
  const [baselineRates, setBaselineRates] = useState<Record<number, number>>(
    {},
  );

  useEffect(() => {
    const saved = localStorage.getItem("shiftSettings");

    if (!saved) {
      setPrefs({
        ...DEFAULT_SHIFT,
        timezone: getDefaultTimezone(),
      });
    }

    setToday(new Date());
  }, [setPrefs]);

  useEffect(() => {
    let cancelled = false;

    loadBaselineRates()
      .then((rates) => {
        if (!cancelled) {
          setBaselineRates(rates);
        }
      })
      .catch((error) => {
        console.error("Failed to load Allo baseline rates:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Get the 12 hours of the selected shift.
  const hours = useMemo(() => shiftHours(prefs), [prefs]);

  // Keep the selected hour inside the current shift.
  const activeHour = hours.includes(hour) ? hour : hours[0];

  // Calculate state availability and predictions.
  const data = useMemo(
    () => (today ? buildData(prefs, activeHour, today, baselineRates) : null),
    [prefs, activeHour, today, baselineRates],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.85fr]">
      <div className="flex flex-col gap-3">
        <div
          role="tablist"
          aria-label="Calling workspace views"
          className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "map"}
            onClick={() => setActiveTab("map")}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "map"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Map
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "schedule"}
            onClick={() => setActiveTab("schedule")}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "schedule"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            12-hour schedule
          </button>
        </div>
        {activeTab === "map" && (
          <>
            <ShiftTimeline
              hours={hours}
              activeHour={activeHour}
              onSelect={setHour}
            />

            <MapPanel
              data={data}
              hourLabel={hourLabel(activeHour)}
              leadsByState={leadsByState}
            />
          </>
        )}
        {activeTab === "schedule" && today && (
          <SchedulePanel
            hours={hours}
            prefs={prefs}
            today={today}
            baselineRates={baselineRates}
            leadsByState={leadsByState}
            onSelectHour={(selectedHour) => {
              setHour(selectedHour);
              setActiveTab("map");
            }}
          />
        )}
      </div>

      <WorkspaceSettings prefs={prefs} onApply={setPrefs} />
    </div>
  );
};

export default CallingWorkspaceLayout;
