"use client";
import { useEffect, useMemo, useState } from "react";
import MapPanel from "./MapPanel";
import WorkspaceSettings from "./WorkspaceSettings";
import {
  buildData,
  DEFAULT_SHIFT,
  getDefaultTimezone,
  hourLabel,
  shiftHours,
  type ShiftSettings,
} from "@/lib/schedule";
import { useStoredState } from "@/lib/useStoredState";
import ShiftTimeline from "./ShiftTimeline";

const CallingWorkspaceLayout = () => {
  // Applied settings: saved in the browser, so they survive a reload.
  const [prefs, setPrefs] = useStoredState<ShiftSettings>(
    "shiftSettings",
    DEFAULT_SHIFT,
  );
  const [hour, setHour] = useState(shiftHours(DEFAULT_SHIFT)[0]);
  const [today, setToday] = useState<Date | null>(null);

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

  // The 12 hours of the shift. If the picked hour is outside a new shift,
  // fall back to the first hour of that shift.
  const hours = useMemo(() => shiftHours(prefs), [prefs]);
  const activeHour = hours.includes(hour) ? hour : hours[0];

  const data = useMemo(
    () => (today ? buildData(prefs, activeHour, today) : null),
    [prefs, activeHour, today],
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
        <MapPanel data={data} hourLabel={hourLabel(activeHour)} />
      </div>
      <WorkspaceSettings prefs={prefs} onApply={setPrefs} />
    </div>
  );
};

export default CallingWorkspaceLayout;
