"use client";

import type { CSSProperties } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { NAME_TO_CODE } from "@/lib/stateMapping";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Different colors for availability and calling priority.
export type StatePriority =
  | "unavailable"
  | "no-data"
  | "low"
  | "medium"
  | "high";

export const PRIORITY_COLORS: Record<StatePriority, string> = {
  unavailable: "#E5E7EB", // Gray
  "no-data": "#FEF3C7", // Soft yellow
  low: "#DCFCE7", // Light green
  medium: "#86EFAC", // Medium green
  high: "#15803D", // Dark green
};

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

type PathWithCentroid = {
  centroid: (feature: unknown) => [number, number];
};

type Props = {
  leads: Record<string, number>;
  isFilled: (code: string) => boolean;
  getPriority: (code: string) => StatePriority;
  active: string | null;
  pinned: string | null;
  onHover: (code: string | null) => void;
  onSelect: (code: string) => void;
};

export default function StateMap({
  leads,
  isFilled,
  getPriority,
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
            {/* 1. Draw the states */}
            {geographies.map((geo) => {
              const code = NAME_TO_CODE[geo.properties?.name];
              if (!code) return null;

              const outlined = active === code || pinned === code;

              // States without leads are not filled unless included.
              const filled = isFilled(code);

              const priority = filled ? getPriority(code) : "unavailable";

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={PRIORITY_COLORS[priority]}
                  stroke={outlined ? "#111827" : "#ffffff"}
                  strokeWidth={outlined ? 2 : 0.9}
                  onMouseEnter={() => onHover(code)}
                  onMouseLeave={() => onHover(null)}
                  onClick={() => onSelect(code)}
                  style={GEO_STYLE}
                />
              );
            })}

            {/* 2. Draw state labels */}
            {geographies.map((geo) => {
              const code = NAME_TO_CODE[geo.properties?.name];
              if (!code) return null;

              const [x, y] = (path as unknown as PathWithCentroid).centroid(
                geo,
              );

              if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

              const filled = isFilled(code);
              const priority = filled ? getPriority(code) : "unavailable";

              const n = leads[code] ?? 0;
              const showLeads = filled && n > 0;

              // Dark text on light states, white text on dark green.
              const labelColor = priority === "high" ? "#ffffff" : "#334155";

              return (
                <g
                  key={`label-${geo.rsmKey}`}
                  textAnchor="middle"
                  fill={filled ? labelColor : "#475569"}
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
