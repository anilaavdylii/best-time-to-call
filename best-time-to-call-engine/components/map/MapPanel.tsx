"use client";

import { useMemo, useRef, useState } from "react";
import type { StateInfo } from "../../lib/mapTypes";
import StateMap from "./StateMap";
import MapSummary from "./MapSummary";
import LeadsSwitch from "./LeadsSwitch";
import MapLegend from "./MapLegend";
import SelectedStateCard from "./SelectedStateCard";

// Other files import this type from here, so keep exporting it.
export type { StateInfo };

type Props = {
  data?: Record<string, StateInfo> | null;
  hourLabel?: string;
  leadsByState?: Record<string, number>;
};

// Holds the map's state and decides what is filled.
export default function MapPanel({ data, leadsByState }: Props) {
  const safe = useMemo(() => data ?? {}, [data]);
  const leads = leadsByState ?? {};

  const detailsRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [showAllStates, setShowAllStates] = useState(false);

  // Numbers for the tiles
  const totalCount = Object.keys(safe).length;
  const availableCount = Object.values(safe).filter((s) => s.eligible).length;
  const totalLeads = Object.values(leads).reduce((sum, n) => sum + n, 0);
  const callableLeads = Object.entries(leads).reduce(
    (sum, [code, n]) => sum + (safe[code]?.eligible ? n : 0),
    0,
  );

  const hasLeads = totalLeads > 0;
  // With no leads imported yet, a leads-only map would be empty, so show all.
  const showAll = showAllStates || !hasLeads;

  // Filled = callable now, and (has leads, or we are showing all states).
  const isFilled = (code: string) =>
    !!safe[code]?.eligible && (showAll || (leads[code] ?? 0) > 0);
  const filledCount = Object.keys(safe).filter(isFilled).length;

  // Click a state to pin it, click it again to unpin it.
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              US calling opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              States you can call during this hour of your shift.
            </p>
          </div>
        </div>

        <MapSummary
          filledCount={filledCount}
          showAll={showAll}
          unavailableCount={Math.max(0, totalCount - availableCount)}
          hasLeads={hasLeads}
          callableLeads={callableLeads}
          totalLeads={totalLeads}
        />
      </div>

      <LeadsSwitch
        checked={showAll}
        disabled={!hasLeads}
        onToggle={() => setShowAllStates((v) => !v)}
      />

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
