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

type Props = {
  leadsByState: Record<string, number>;
};

const CallingWorkspaceLayout = ({ leadsByState }: Props) => {
  // Applied settings: saved in the browser.
  const [prefs, setPrefs] = useStoredState<ShiftSettings>(
    "shiftSettings",
    DEFAULT_SHIFT,
  );

  const [hour, setHour] = useState(shiftHours(DEFAULT_SHIFT)[0]);
  const [today, setToday] = useState<Date | null>(null);

  // Allo hourly benchmark rates loaded from the CSV.
  const [baselineRates, setBaselineRates] = useState<Record<number, number>>(
    {},
  );

  // Initialize timezone and current date.
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

  // Load Allo benchmark rates from the CSV.
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
        <div className="flex flex-col gap-4">
          <ShiftTimeline
            hours={hours}
            activeHour={activeHour}
            onSelect={setHour}
          />
        </div>

        <MapPanel
          data={data}
          hourLabel={hourLabel(activeHour)}
          leadsByState={leadsByState}
        />
      </div>

      <WorkspaceSettings prefs={prefs} onApply={setPrefs} />
    </div>
  );
};

export default CallingWorkspaceLayout;
