import type { StateInfo, CallStatsByStateHour } from "@/lib/mapTypes";
import { STATES_BY_TZ, ZONE_LABEL } from "./stateTimezones";

export const TEAM_TZ = "America/New_York";

export function getDefaultTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || TEAM_TZ;
}

export type ShiftSettings = {
  timezone: string;
  start: string;
};

export const DEFAULT_SHIFT: ShiftSettings = {
  timezone: "America/New_York", // fallback until browser detection
  start: "09:00",
};

export const WINDOW_START = 8; // 8am
export const WINDOW_END = 21; // 9pm (calls must start before this hour)

const ALLO_PRIOR_ATTEMPTS = 20;

export const STATE_TZ: Record<string, string> = Object.fromEntries(
  Object.entries(STATES_BY_TZ).flatMap(([timezone, codes]) =>
    codes.map((code) => [code, timezone]),
  ),
);

function partsIn(timezone: string, date: Date) {
  const f = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
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

export function offsetMinutes(timezone: string, date: Date) {
  const p = partsIn(timezone, date);
  const asUTC = Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s);
  return (asUTC - Math.floor(date.getTime() / 1000) * 1000) / 60000;
}

const SHIFT_HOURS = 12;

export function shiftHours(p: ShiftSettings): number[] {
  const s = parseInt(p.start.split(":")[0], 10) || 0;
  return Array.from({ length: SHIFT_HOURS }, (_, i) => (s + i) % 24);
}

function instantForTeamHour(teamHour: number, timezone: string, base: Date) {
  const { y, m, d } = partsIn(timezone, base);
  const guess = new Date(Date.UTC(y, m - 1, d, teamHour));
  return new Date(guess.getTime() - offsetMinutes(timezone, guess) * 60000);
}

export function fmtHour(h: number) {
  const hh = ((h % 24) + 24) % 24;
  return `${hh % 12 === 0 ? 12 : hh % 12}${hh < 12 ? "am" : "pm"}`;
}

export function hourLabel(teamHour: number) {
  return `${fmtHour(teamHour)}-${fmtHour(teamHour + 1)} (team time)`;
}

export function buildData(
  prefs: ShiftSettings,
  teamHour: number,
  base: Date,
  baselineRates: Record<number, number> = {},
  callStats: CallStatsByStateHour = {},
): Record<string, StateInfo> {
  const onShift = shiftHours(prefs).includes(teamHour);
  const instant = instantForTeamHour(teamHour, prefs.timezone, base);
  const out: Record<string, StateInfo> = {};

  for (const [code, timezone] of Object.entries(STATE_TZ)) {
    const localHour = partsIn(timezone, instant).h;

    const inWindow = localHour >= WINDOW_START && localHour < WINDOW_END;

    const eligible = onShift && inWindow;

    const ownStats = callStats[code]?.[localHour];
    const answered = ownStats?.answered ?? 0;
    const attempts = ownStats?.attempts ?? 0;

    const baselineRate = baselineRates[localHour];

    let score = 0;
    let predictionAvailable = false;
    let predictionSource: StateInfo["predictionSource"];

    if (
      eligible &&
      baselineRate !== undefined &&
      Number.isFinite(baselineRate) &&
      baselineRate >= 0 &&
      baselineRate <= 1
    ) {
      score =
        (answered + ALLO_PRIOR_ATTEMPTS * baselineRate) /
        (attempts + ALLO_PRIOR_ATTEMPTS);

      predictionAvailable = true;
      predictionSource = attempts > 0 ? "combined" : "allo";
    } else if (eligible && attempts >= ALLO_PRIOR_ATTEMPTS) {
      score = answered / attempts;
      predictionAvailable = true;
      predictionSource = "history";
    }

    out[code] = {
      eligible,
      score,
      predictionAvailable,
      predictionSource,
      ownAttempts: attempts,
      zone: ZONE_LABEL[timezone] ?? timezone,
      localTime: fmtHour(localHour),
      teamTime: fmtHour(teamHour),
    };
  }

  return out;
}
