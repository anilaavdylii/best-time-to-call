"use client";
import { useEffect, useMemo, useState } from "react";
import MapPanel from "./MapPanel";
import WorkspaceSettings from "./WorkspaceSettings";
import { buildData, hourLabel } from "@/lib/schedule";

const CallingWorkspaceLayout = () => {
  const [hour, setHour] = useState(12);
  const [today, setToday] = useState<Date | null>(null);

  // Runs only in the browser, so the server never sees a changing clock.
  useEffect(() => setToday(new Date()), []);

  const data = useMemo(
    () => (today ? buildData(hour, today) : null),
    [hour, today],
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_0.85fr]">
      <MapPanel data={data} hourLabel={hourLabel(hour)} />
      <WorkspaceSettings />
    </div>
  );
};

export default CallingWorkspaceLayout;
