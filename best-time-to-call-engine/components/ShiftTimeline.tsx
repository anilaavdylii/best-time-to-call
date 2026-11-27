"use client";

import { hourLabel } from "@/lib/schedule";

type Props = {
  hours: number[];
  activeHour: number;
  onSelect: (hour: number) => void;
};

export default function ShiftTimeline({ hours, activeHour, onSelect }: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Calling opportunities across the shift
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Pick an hour to explore open states on the map.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
        {hours.map((hour) => {
          const selected = hour === activeHour;

          return (
            <button
              key={hour}
              type="button"
              onClick={() => onSelect(hour)}
              aria-pressed={selected}
              aria-label={`Select ${hourLabel(hour)}`}
              className={`rounded-xl border px-2 py-3 text-center transition ${
                selected
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500 hover:bg-emerald-50"
              }`}
            >
              <span className="block text-sm font-semibold">
                {hourLabel(hour).split("-")[0]}
              </span>

              <span
                className={`mt-1 block text-[10px] ${
                  selected ? "text-emerald-100" : "text-slate-400"
                }`}
              >
                {selected ? "Selected" : "Explore"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
