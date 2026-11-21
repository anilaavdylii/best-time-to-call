/* ------------------------------------------------------------------ *
 * 1. SETTINGS: the things you will actually edit
 * ------------------------------------------------------------------ */

import { StateInfo } from "@/components/MapPanel";

// Where your team sits. Use an IANA name so daylight saving is handled for you.
export const TEAM_TZ = "America/New_York";

// Legal / policy dialing window in the CALLED state's local time.
export const WINDOW_START = 8; // 8am
export const WINDOW_END = 21; // 9pm (calls must start before this hour)

/* ------------------------------------------------------------------ *
 * 2. STATE -> TIME ZONE (static facts, written once)
 * States that straddle zones (TX, FL, TN, KY, IN, KS, NE, SD, ND, ID, OR, MI)
 * are assigned the zone covering most of their population.
 * ------------------------------------------------------------------ */

const STATES_BY_TZ: Record<string, string[]> = {
  "America/New_York": [
    "CT",
    "DE",
    "DC",
    "FL",
    "GA",
    "IN",
    "KY",
    "ME",
    "MD",
    "MA",
    "MI",
    "NH",
    "NJ",
    "NY",
    "NC",
    "OH",
    "PA",
    "RI",
    "SC",
    "VT",
    "VA",
    "WV",
  ],
  "America/Chicago": [
    "AL",
    "AR",
    "IL",
    "IA",
    "KS",
    "LA",
    "MN",
    "MS",
    "MO",
    "NE",
    "ND",
    "OK",
    "SD",
    "TN",
    "TX",
    "WI",
  ],
  "America/Denver": ["CO", "ID", "MT", "NM", "UT", "WY"],
  "America/Phoenix": ["AZ"], // no daylight saving
  "America/Los_Angeles": ["CA", "NV", "OR", "WA"],
  "America/Anchorage": ["AK"],
  "Pacific/Honolulu": ["HI"], // no daylight saving
};

const ZONE_LABEL: Record<string, string> = {
  "America/New_York": "Eastern",
  "America/Chicago": "Central",
  "America/Denver": "Mountain",
  "America/Phoenix": "Arizona",
  "America/Los_Angeles": "Pacific",
  "America/Anchorage": "Alaska",
  "Pacific/Honolulu": "Hawaii",
};

export const STATE_TZ: Record<string, string> = Object.fromEntries(
  Object.entries(STATES_BY_TZ).flatMap(([tz, codes]) =>
    codes.map((code) => [code, tz]),
  ),
);

/* ------------------------------------------------------------------ *
 * 3. CONTACT RATE BY LOCAL HOUR (PLACEHOLDER: replace with your data)
 * Key = local hour (24h), value = 0..1.
 * Best source: your call log. For each local hour, divide
 * connected calls by dials, then scale so the best hour is 1.
 * ------------------------------------------------------------------ */

export const CONTACT_RATE_BY_HOUR: Record<number, number> = {
  8: 0.35,
  9: 0.5,
  10: 0.6,
  11: 0.55,
  12: 0.45,
  13: 0.5,
  14: 0.55,
  15: 0.6,
  16: 0.7,
  17: 0.85,
  18: 0.95,
  19: 0.8,
  20: 0.5,
};

/* ------------------------------------------------------------------ *
 * 4. TIME HELPERS (daylight-saving safe, no library needed)
 * ------------------------------------------------------------------ */

function partsIn(tz: string, date: Date) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  const p = Object.fromEntries(
    f.formatToParts(date).map((x) => [x.type, x.value]),
  );
  return {
    y: +p.year,
    m: +p.month,
    d: +p.day,
    h: +p.hour % 24,
    mi: +p.minute,
    s: +p.second,
  };
}

function offsetMinutes(tz: string, date: Date) {
  const p = partsIn(tz, date);
  const asUTC = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
  return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000;
}

// The moment when the team's wall clock reads `teamHour:00` today.
function instantForTeamHour(teamHour: number, base: Date) {
  const { y, m, d } = partsIn(TEAM_TZ, base);
  const guess = new Date(Date.UTC(y, m - 1, d, teamHour));
  return new Date(guess.getTime() - offsetMinutes(TEAM_TZ, guess) * 60000);
}

export function fmtHour(h: number) {
  const hh = ((h % 24) + 24) % 24;
  return `${hh % 12 === 0 ? 12 : hh % 12}${hh < 12 ? "am" : "pm"}`;
}

export function hourLabel(teamHour: number) {
  return `${fmtHour(teamHour)}-${fmtHour(teamHour + 1)} (team time)`;
}

/* ------------------------------------------------------------------ *
 * 5. THE FUNCTION YOU CALL: builds the `data` prop for MapPanel
 * ------------------------------------------------------------------ */

export function buildData(
  teamHour: number, // 0..23 in TEAM_TZ
  base: Date = new Date(),
): Record<string, StateInfo> {
  const instant = instantForTeamHour(teamHour, base);
  const out: Record<string, StateInfo> = {};

  for (const [code, tz] of Object.entries(STATE_TZ)) {
    const localHour = partsIn(tz, instant).h;
    const callable = localHour >= WINDOW_START && localHour < WINDOW_END;
    out[code] = {
      score: callable ? (CONTACT_RATE_BY_HOUR[localHour] ?? 0) : 0,
      zone: ZONE_LABEL[tz] ?? tz,
      localTime: fmtHour(localHour),
      teamTime: fmtHour(teamHour),
    };
  }
  return out;
}
