"use client";

import type { CSSProperties } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { NAME_TO_CODE } from "@/lib/stateMapping";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

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

// react-simple-maps types `path` as a plain function, but it is a d3 path
// generator at runtime, and d3 path generators have .centroid().
type PathWithCentroid = {
  centroid: (feature: unknown) => [number, number];
};

type Props = {
  leads: Record<string, number>; // leads per state
  isFilled: (code: string) => boolean; // should this state be green?
  active: string | null; // hovered or pinned state (gets an outline)
  pinned: string | null;
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void; // a state was clicked
};

// Draws the US map: the states, then their labels on top.
export default function StateMap({
  leads,
  isFilled,
  active,
  pinned,
  onHover,
  onSelect,
}: Props) {
  return (
    <ComposableMap
      projection="geoAlbersUsa"
      width={800}
      height={500}
      style={{ width: "100%", height: "auto" }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies, path }) => (
          <>
            {/* 1. The states */}
            {geographies.map((geo) => {
              const code = NAME_TO_CODE[geo.properties?.name];
              if (!code) return null;

              const outlined = active === code || pinned === code;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isFilled(code) ? AVAILABLE_COLOR : UNAVAILABLE_COLOR}
                  stroke={outlined ? "#111827" : "#ffffff"}
                  strokeWidth={outlined ? 2 : 0.9}
                  onMouseEnter={() => onHover(code)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(code)}
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

              const filled = isFilled(code);
              const n = leads[code] ?? 0;
              const showLeads = filled && n > 0;

              return (
                <g
                  key={`label-${geo.rsmKey}`}
                  textAnchor="middle"
                  fill={filled ? "#ffffff" : "#475569"}
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
  );
}
