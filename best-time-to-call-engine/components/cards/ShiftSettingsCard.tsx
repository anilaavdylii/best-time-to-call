"use client";

import { useEffect, useState } from "react";
import type { ShiftSettings } from "@/lib/schedule";
import { ZONES } from "@/lib/timezones";
import type { FormEvent } from "react";

const label = "mb-2 block text-[13px] font-semibold text-slate-600";
const field =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

// Shifts run 12 hours, so the end is the start plus 12.
function endTime(start: string) {
  const [h, m] = start.split(":").map(Number);
  return `${String((h + 12) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type Props = {
  value: ShiftSettings; // the applied settings (owned by the parent)
  onApply: (prefs: ShiftSettings) => void;
};

export default function ShiftSettingsCard({ value, onApply }: Props) {
  // What's typed in the form. It only becomes real when Apply is clicked.
  const [timezone, setTz] = useState(value.timezone);
  const [start, setStart] = useState(value.start);

  // When the saved settings load (or change), show them in the form.
  useEffect(() => {
    setTz(value.timezone);
    setStart(value.start);
  }, [value]);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (start) onApply({ timezone, start });
  }

  const appliedLabel =
    ZONES.find((z) => z.value === value.timezone)?.label ?? value.timezone;

  const timezoneOptions = ZONES.some((zone) => zone.value === timezone)
    ? ZONES
    : [
        ...ZONES,
        {
          value: timezone,
          label: timezone,
        },
      ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Shift settings</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Set your team's timezone and when its shift starts
      </p>

      <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
        <div>
          <label htmlFor="timezone" className={label}>
            Team / base timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTz(e.target.value)}
            className={field}
          >
            {timezoneOptions.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Your initial timezone is automatically detected from your device
            location. You can change it anytime.
          </p>
        </div>

        <div>
          <label htmlFor="start" className={label}>
            Shift start time
          </label>
          <input
            id="start"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className={field}
          />
          <p className="mt-2 text-xs text-slate-500">
            Your shift will run {start}–{endTime(start)} (12 hours).
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-500 px-4 py-3.5 text-[15px] font-semibold text-white hover:bg-blue-600"
        >
          Save changes
        </button>

        <p className="mt-1 text-xs text-slate-500">
          Currently saved: {appliedLabel} · {value.start}–{endTime(value.start)}
        </p>
      </form>
    </section>
  );
}
