"use client";

import type { Ref } from "react";
import { NAME_TO_CODE } from "@/lib/stateMapping";
import type { StateInfo } from "@/lib/mapTypes";
import StateLeadsList from "./StateLeadsList";

const CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(NAME_TO_CODE).map(([name, code]) => [code, name]),
);

type Props = {
  code: string;
  info?: StateInfo;
  leadCount: number;
  cardRef: Ref<HTMLDivElement>;
  showAll: boolean;
  onCallLogged: () => Promise<void>;
};

export default function SelectedStateCard({
  code,
  info,
  leadCount,
  cardRef,
  showAll,
  onCallLogged,
}: Props) {
  const normalizedCode = code.toUpperCase();
  const name = CODE_TO_NAME[normalizedCode] ?? normalizedCode;

  const noLeadsMessage = !info
    ? `No leads in ${name} yet. Import numbers to get started.`
    : info.eligible
      ? `No leads in ${name} yet. This state is available for calling at the selected hour. Import numbers to get started.`
      : `No leads in ${name} yet. This state is not available for calling at the selected hour. Import numbers to get started.`;

  type PriorityLabel =
    | "Not callable or no leads"
    | "No estimate available"
    | "Lower chance"
    | "Good chance"
    | "Best chance";

  const priorityLabel: PriorityLabel =
    !info?.eligible || (!showAll && leadCount === 0)
      ? "Not callable or no leads"
      : !info.predictionAvailable
        ? "No estimate available"
        : info.score >= 0.27
          ? "Best chance"
          : info.score >= 0.24
            ? "Good chance"
            : "Lower chance";

  const priorityStyles: Record<PriorityLabel, string> = {
    "Not callable or no leads": "border-slate-200 bg-slate-100 text-slate-700",
    "No estimate available": "border-amber-200 bg-amber-50 text-amber-800",
    "Lower chance": "border-green-200 bg-green-50 text-green-800",
    "Good chance": "border-green-300 bg-green-100 text-green-900",
    "Best chance": "border-green-700 bg-green-700 text-white",
  };

  return (
    <section
      ref={cardRef}
      aria-label={`${name} details`}
      className="mt-4 scroll-mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-2xs"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500">
            Selected state
          </p>
          <div className="mt-0.5 flex items-baseline gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              {name}
            </h3>
            <span className="rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-xs font-medium text-slate-600">
              {normalizedCode}
            </span>
          </div>
        </div>

        {info && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
              info.eligible
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-slate-200/70 text-slate-700"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                info.eligible ? "bg-emerald-500" : "bg-slate-500"
              }`}
            />
            {info.eligible ? "Available to call" : "Not available"}
          </span>
        )}
      </div>

      {info ? (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2">
            <p className="text-xs text-slate-500">Local time</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {info.localTime}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2">
            <div className="text-xs text-slate-500">Time zone</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900">
              {info.zone}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2">
            <div className="text-xs text-slate-500">Leads</div>
            <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
              {leadCount}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-500">
          No scheduling information available.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">
          Calling priority
        </span>

        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${priorityStyles[priorityLabel]}`}
        >
          {priorityLabel}
        </span>
      </div>
      {info?.eligible &&
        info.predictionAvailable &&
        (showAll || leadCount > 0) && (
          <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-emerald-700">
                  Chance someone answers
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  When it's {info.localTime} in this state
                </p>
              </div>

              <p className="text-2xl font-bold tabular-nums text-emerald-800">
                {(info.score * 100).toFixed(1)}%
              </p>
            </div>
            <p className="mt-2 text-xs text-slate-600">
              Based on past calls across the US. Results in this state may be
              different.
            </p>
          </div>
        )}

      {info?.eligible &&
        !info.predictionAvailable &&
        (showAll || leadCount > 0) && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs text-amber-800">
              No estimate is available for this local time.
            </p>
          </div>
        )}

      {leadCount > 0 ? (
        <>
          {info && !info.eligible && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
              {name} is outside calling hours at the selected hour.
            </div>
          )}
          <StateLeadsList
            key={normalizedCode}
            state={normalizedCode}
            count={leadCount}
            onCallLogged={onCallLogged}
          />
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-500">
          {noLeadsMessage}
        </div>
      )}
    </section>
  );
}
