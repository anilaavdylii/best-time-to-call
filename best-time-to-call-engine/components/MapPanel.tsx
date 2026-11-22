"use client";

import { NAME_TO_CODE } from "@/lib/stateMapping";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export type StateInfo = {
  score: number;
  zone: string;
  localTime: string;
  teamTime: string;
  eligible: boolean;
};

// react-simple-maps types `path` as a plain function, but it is a d3 path
// generator at runtime, and d3 path generators have .centroid().
type PathWithCentroid = {
  centroid: (feature: unknown) => [number, number];
};

type Props = {
  data?: Record<string, StateInfo> | null;
  hourLabel?: string;
  leadsByState?: Record<string, number>;
};

const AVAILABLE_COLOR = "#15966b";
const UNAVAILABLE_COLOR = "#e5e7eb";

const GEO_STYLE = {
  default: { outline: "none", transition: "fill 150ms ease" },
  hover: {
    outline: "none",
    stroke: "#111827",
    strokeWidth: 1.8,
    cursor: "pointer",
  },
  pressed: { outline: "none" },
} as unknown as CSSProperties;

function fillFor(info?: StateInfo | null) {
  return info?.eligible ? AVAILABLE_COLOR : UNAVAILABLE_COLOR;
}

export default function MapPanel({
  data,
  hourLabel = "",
  leadsByState,
}: Props) {
  const safe = useMemo(() => data ?? {}, [data]);
  const detailsRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const active = hovered ?? pinned;
  const info = pinned ? safe[pinned] : undefined;

  const availableCount = Object.values(safe).filter(
    (state) => state.eligible,
  ).length;

  const totalCount = Object.keys(safe).length;

  const leads = leadsByState ?? {};
  const totalLeads = Object.values(leads).reduce((sum, n) => sum + n, 0);
  // leads sitting in states you can call at the selected hour
  const callableLeads = Object.entries(leads).reduce(
    (sum, [code, n]) => sum + (safe[code]?.eligible ? n : 0),
    0,
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between items-center">
        {/* Header */}
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

        {/* Availability summary */}
        <div className="mt-5 flex flex-wrap items-center gap-3 scroll-mt-6">
          <div className="rounded-xl bg-emerald-50 px-4 py-3">
            <p className="text-2xl font-bold text-emerald-700 tabular-nums">
              {availableCount}
            </p>
            <p className="text-xs font-medium text-emerald-800">
              Available states
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-2xl font-bold text-slate-700 tabular-nums">
              {Math.max(0, totalCount - availableCount)}
            </p>
            <p className="text-xs font-medium text-slate-500">
              Unavailable states
            </p>
          </div>
          <div className="rounded-xl bg-indigo-50 px-4 py-3">
            <p className="text-2xl font-bold text-indigo-700 tabular-nums">
              {totalLeads > 0 ? callableLeads : "-"}
            </p>
            <p className="text-xs font-medium text-indigo-800">
              {totalLeads > 0
                ? `Leads you can call (of ${totalLeads})`
                : "Import numbers to see leads"}
            </p>
          </div>
        </div>
      </div>
      {/* Map */}
      <div className="mt-3">
        <ComposableMap
          projection="geoAlbersUsa"
          width={800}
          height={500}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies, path }) => (
              <>
                {/* 1. The states (your existing code) */}
                {geographies.map((geo) => {
                  const code = NAME_TO_CODE[geo.properties?.name];

                  if (!code) return null;

                  const isActive = active === code;
                  const isPinned = pinned === code;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillFor(safe[code])}
                      stroke={isActive || isPinned ? "#111827" : "#ffffff"}
                      strokeWidth={isActive || isPinned ? 2 : 0.9}
                      onMouseEnter={() => setHovered(code)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => {
                        setPinned(isPinned ? null : code);

                        if (!isPinned) {
                          requestAnimationFrame(() => {
                            detailsRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "center",
                            });
                          });
                        }
                      }}
                      style={GEO_STYLE}
                    />
                  );
                })}

                {/* 2. The labels, drawn after the states so they sit on top */}
                {geographies.map((geo) => {
                  const code = NAME_TO_CODE[geo.properties?.name];
                  if (!code) return null;

                  const [x, y] = (path as unknown as PathWithCentroid).centroid(
                    geo,
                  );
                  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

                  const info = safe[code];
                  const eligible = info?.eligible;
                  const n = leads[code] ?? 0;
                  const showLeads = eligible && n > 0;

                  return (
                    <g
                      key={`label-${geo.rsmKey}`}
                      textAnchor="middle"
                      fill={eligible ? "#ffffff" : "#475569"}
                      style={{ pointerEvents: "none" }}
                    >
                      <text
                        x={x}
                        y={showLeads ? y - 3 : y}
                        dy="0.35em"
                        fontSize={11}
                        fontWeight={700}
                      >
                        {code}
                      </text>
                      {showLeads && (
                        <text x={x} y={y + 9} dy="0.35em" fontSize={9}>
                          {n}
                        </text>
                      )}
                    </g>
                  );
                })}
              </>
            )}
          </Geographies>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-5 border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-emerald-600" />
          <span className="text-xs text-slate-600">Available to call</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-slate-200" />
          <span className="text-xs text-slate-600">Outside calling hours</span>
        </div>
      </div>

      {/* Selected state details */}
      {pinned && (
        <div
          ref={detailsRef}
          className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 scroll-mt-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Selected state
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900">
                {pinned}
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
                  {leads[pinned] ?? 0}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No scheduling information available.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
