"use client";

import type { Ref } from "react";
import { NAME_TO_CODE } from "@/lib/stateMapping";
import type { StateInfo } from "@/lib/mapTypes";
import StateLeadsList from "./StateLeadsList";

// "CA" -> "California", built from the name -> code table we already have.
const CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(NAME_TO_CODE).map(([name, code]) => [code, name]),
);

type Props = {
  code: string; // "CA"
  info?: StateInfo; // schedule info for this state at the selected hour
  leadCount: number; // numbers saved in this state
  cardRef: Ref<HTMLDivElement>; // so the parent can scroll to the card
};

// The details of the state you clicked, and its phone numbers.
export default function SelectedStateCard({
  code,
  info,
  leadCount,
  cardRef,
}: Props) {
  const name = CODE_TO_NAME[code] ?? code;

  return (
    <div
      ref={cardRef}
      className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 scroll-mt-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Selected state
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            {name}
            <span className="ml-2 text-sm font-medium text-slate-500">
              {code}
            </span>
          </h3>
        </div>

        {info && (
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              info.eligible
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {info.eligible ? "Available to call" : "Not available"}
          </span>
        )}
      </div>

      {info ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Local time</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {info.localTime}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Time zone</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {info.zone}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Opportunity score</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {info.eligible ? `${Math.round(info.score * 100)}%` : "—"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Leads</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {leadCount}
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          No scheduling information available.
        </p>
      )}

      {/* The numbers in this state, if there are any */}
      {leadCount > 0 ? (
        <>
          {info && !info.eligible && (
            <p className="mt-4 text-sm text-amber-700">
              {name} is outside calling hours at the selected hour.
            </p>
          )}
          <StateLeadsList key={code} state={code} count={leadCount} />
        </>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          No leads in {name} yet. Import numbers to see them here.
        </p>
      )}
    </div>
  );
}
