"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// State shapes (TopoJSON) from the us-atlas package, served by a CDN.
const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// What the schedule logic gives us for ONE state at the selected hour.
export type StateInfo = {
  score: number; // 0..1 expected contact rate (0 = do not call)
  zone: string; // e.g. "Eastern"
  localTime: string; // e.g. "6pm"
  teamTime: string; // e.g. "12pm"
};

type Props = {
  // Optional on purpose: the parent may render before the schedule is computed.
  data?: Record<string, StateInfo> | null;
  hourLabel?: string; // e.g. "12pm-1pm (team time)"
};

// The map data identifies states by full name, our data by 2-letter code.
const NAME_TO_CODE: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  "District of Columbia": "DC",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

// Tiny states are hard to hover on the map, so they also get buttons.
const SMALL_STATES = ["VT", "NH", "MA", "RI", "CT", "NJ", "DE", "MD", "DC"];

const NO_CALL = "#d9d9d4";

// react-simple-maps accepts { default, hover, pressed } here at runtime, but
// @types/react-simple-maps types `style` as plain CSSProperties. Cast once.
const GEO_STYLE = {
  default: { outline: "none" },
  hover: { outline: "none", stroke: "#111", strokeWidth: 1.5 },
  pressed: { outline: "none" },
} as unknown as CSSProperties;

// Score -> color. Missing or zero score = grey (not allowed to call right now).
// Accepts undefined, so it is safe for states with no data.
function fillFor(info?: StateInfo | null) {
  const score = info?.score;
  if (typeof score !== "number" || !Number.isFinite(score) || score <= 0) {
    return NO_CALL;
  }
  const s = Math.min(score, 1);
  return `rgba(15, 110, 86, ${0.15 + s * 0.85})`;
}

export default function MapPanel({ data, hourLabel = "" }: Props) {
  // Normalize once: everything below can rely on `safe` being an object.
  const safe = useMemo<Record<string, StateInfo>>(() => data ?? {}, [data]);

  // Hover is temporary; a click or tap pins the selection so it
  // survives the mouse leaving the map (and works for the buttons too).
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const active = hovered ?? pinned;
  const info = active ? safe[active] : undefined;
  const loading = data == null;

  return (
    <section className="rounded-[17px] border border-gray bg-white p-5 shadow-xs">
      <ComposableMap projection="geoAlbersUsa" width={800} height={500}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = NAME_TO_CODE[geo.properties?.name];
              if (!code) return null; // skip territories we don't dial
              const isPinned = pinned === code;
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillFor(safe[code])}
                  stroke={isPinned ? "#111" : "#ffffff"}
                  strokeWidth={isPinned ? 1.5 : 0.7}
                  onMouseEnter={() => setHovered(code)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setPinned(isPinned ? null : code)}
                  style={GEO_STYLE}
                />
              );
            })
          }
        </Geographies>
      </ComposableMap>
    </section>
  );
}
