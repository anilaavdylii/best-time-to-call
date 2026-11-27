"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { ShiftSettings } from "@/lib/schedule";
import { ZONES } from "@/lib/timezones";

// Shifts run 12 hours, so the end is the start plus 12.
function endTime(start: string) {
  const [h, m] = start.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  return `${String((h + 12) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type Props = {
  value: ShiftSettings; // the applied settings (owned by the parent)
  onApply: (prefs: ShiftSettings) => void;
};

export default function ShiftSettingsCard({ value, onApply }: Props) {
  const [timezone, setTz] = useState(value.timezone);
  const [start, setStart] = useState(value.start);

  useEffect(() => {
    setTz(value.timezone);
    setStart(value.start);
  }, [value]);

  const hasUnsavedChanges =
    timezone !== value.timezone || start !== value.start;

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (start) onApply({ timezone, start });
  }

  const appliedLabel =
    ZONES.find((z) => z.value === value.timezone)?.label ?? value.timezone;

  const timezoneOptions = ZONES.some((zone) => zone.value === timezone)
    ? ZONES
    : [...ZONES, { value: timezone, label: timezone }];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex items-center gap-3.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/70">
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="7" />
              <path d="M10 6v4l2.5 1.5" />
            </svg>
          </span>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Shift settings
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Set your team&apos;s timezone and 12-hour shift start
            </p>
          </div>
        </div>

        {hasUnsavedChanges && (
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
            Unsaved
          </span>
        )}
      </div>

      <form
        onSubmit={submit}
        className="flex flex-col gap-4 bg-slate-50/40 px-6 py-5"
      >
        <div>
          <label
            htmlFor="timezone"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Team / base timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTz(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {timezoneOptions.map((zone) => (
              <option key={zone.value} value={zone.value}>
                {zone.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-slate-500">
            Detected automatically from your device; change anytime.
          </p>
        </div>

        <div>
          <label
            htmlFor="start"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Shift start time
          </label>
          <input
            id="start"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 shadow-2xs transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          {start && (
            <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
              <span>12-hour shift window</span>
              <span className="font-mono font-medium tabular-nums text-slate-700">
                {start} – {endTime(start)}
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!start || !hasUnsavedChanges}
          className="mt-1 w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Save changes
        </button>

        <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs text-slate-600">
          <span className="font-medium text-slate-400">Active: </span>
          <span className="font-medium text-slate-800">{appliedLabel}</span>
          <span className="mx-1.5 text-slate-300">·</span>
          <span className="font-mono tabular-nums text-slate-700">
            {value.start}–{endTime(value.start)}
          </span>
        </div>
      </form>
    </section>
  );
}
