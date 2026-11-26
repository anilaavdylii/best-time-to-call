"use client";

import { useMemo, useRef, useState } from "react";
import type { StateInfo } from "../../lib/mapTypes";
import StateMap from "./StateMap";
import MapSummary from "./MapSummary";
import LeadsSwitch from "./LeadsSwitch";
import MapLegend from "./MapLegend";
import SelectedStateCard from "./SelectedStateCard";

// Other files import this type from here, so kept the export
export type { StateInfo };

type Props = {
  data?: Record<string, StateInfo> | null;
  hourLabel?: string;
  leadsByState?: Record<string, number>;
};

export default function MapPanel({ data, leadsByState }: Props) {
  const safe = useMemo(() => data ?? {}, [data]);
  const leads = leadsByState ?? {};

  const detailsRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [showAllStates, setShowAllStates] = useState(false);

  const totalCount = Object.keys(safe).length;
  const availableCount = Object.values(safe).filter((s) => s.eligible).length;
  const totalLeads = Object.values(leads).reduce((sum, n) => sum + n, 0);
  const callableLeads = Object.entries(leads).reduce(
    (sum, [code, n]) => sum + (safe[code]?.eligible ? n : 0),
    0,
  );

  const hasLeads = totalLeads > 0;
  const showAll = showAllStates || !hasLeads;

  const isFilled = (code: string) =>
    !!safe[code]?.eligible && (showAll || (leads[code] ?? 0) > 0);
  const filledCount = Object.keys(safe).filter(isFilled).length;

  function select(code: string) {
    const unpin = pinned === code;
    setPinned(unpin ? null : code);

    if (!unpin) {
      requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start sm:gap-3">
            <h2 className="text-base font-semibold tracking-tight text-slate-900">
              US calling overview
            </h2>
            <LeadsSwitch
              checked={showAll}
              disabled={!hasLeads}
              onToggle={() => setShowAllStates((v) => !v)}
            />
          </div>
          <p className="text-xs text-slate-500">
            States available to call during the selected shift hour.
          </p>
        </div>

        <div className="w-full xl:w-auto xl:shrink-0">
          <MapSummary
            filledCount={filledCount}
            showAll={showAll}
            unavailableCount={Math.max(0, totalCount - availableCount)}
            hasLeads={hasLeads}
            callableLeads={callableLeads}
            totalLeads={totalLeads}
          />
        </div>
      </div>

      <div className="mt-3">
        <StateMap
          leads={leads}
          isFilled={isFilled}
          active={hovered ?? pinned}
          pinned={pinned}
          onHover={setHovered}
          onSelect={select}
        />
      </div>

      <MapLegend showAll={showAll} />

      {pinned && (
        <SelectedStateCard
          code={pinned}
          info={safe[pinned]}
          leadCount={leads[pinned] ?? 0}
          cardRef={detailsRef}
        />
      )}
    </section>
  );
}
