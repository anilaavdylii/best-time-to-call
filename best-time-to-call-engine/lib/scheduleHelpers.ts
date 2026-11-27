import { useMemo } from "react";
import { buildData, type ShiftSettings } from "@/lib/schedule";
import { NAME_TO_CODE } from "@/lib/stateMapping";
import { CallStatsByStateHour } from "./mapTypes";

export const CODE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(NAME_TO_CODE).map(([name, code]) => [code, name]),
);

export type StateItem = {
  code: string;
  leads: number;
};

export type ZoneGroup = {
  zone: string;
  localTime: string;
  states: StateItem[];
  leads: number;
  rate: number | null;
  expectedConnects: number;
};

export type HourScheduleItem = {
  teamHour: number;
  groups: ZoneGroup[];
  availableStateCount: number;
  totalLeads: number;
  topGroup: ZoneGroup | null;
};

export function getPriority(rate: number | null) {
  if (rate === null) return "No estimate";
  if (rate >= 0.27) return "Best chance";
  if (rate >= 0.24) return "Good chance";
  return "Lower chance";
}

export function getPriorityColor(rate: number | null) {
  if (rate === null) return "bg-amber-50 text-amber-800 border-amber-200";
  if (rate >= 0.27) return "bg-emerald-700 text-white border-emerald-700";
  if (rate >= 0.24) return "bg-emerald-100 text-emerald-900 border-emerald-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

export function useDialSchedule(
  hours: number[],
  prefs: ShiftSettings,
  today: Date,
  baselineRates: Record<number, number>,
  callStats: CallStatsByStateHour,
  leadsByState: Record<string, number>,
): HourScheduleItem[] {
  return useMemo(() => {
    return (hours ?? []).map((teamHour) => {
      const stateData = buildData(
        prefs,
        teamHour,
        today,
        baselineRates,
        callStats,
      );
      const zoneGroups = new Map<string, ZoneGroup>();
      let availableStateCount = 0;
      let totalLeads = 0;

      for (const [code, info] of Object.entries(stateData)) {
        if (!info.eligible) continue;
        availableStateCount += 1;

        const leadCount = leadsByState[code] ?? 0;
        if (leadCount <= 0) continue;
        totalLeads += leadCount;

        let group = zoneGroups.get(info.zone);
        if (!group) {
          group = {
            zone: info.zone,
            localTime: info.localTime,
            states: [],
            leads: 0,
            rate: info.predictionAvailable ? info.score : null,
            expectedConnects: 0,
          };
          zoneGroups.set(info.zone, group);
        }

        group.states.push({ code, leads: leadCount });
        group.leads += leadCount;

        if (group.rate === null && info.predictionAvailable) {
          group.rate = info.score;
        }
      }

      const groups = Array.from(zoneGroups.values())
        .map((group) => {
          group.states.sort(
            (a, b) => b.leads - a.leads || a.code.localeCompare(b.code),
          );
          group.expectedConnects =
            group.rate !== null ? group.leads * group.rate : 0;
          return group;
        })
        .sort(
          (a, b) =>
            b.expectedConnects - a.expectedConnects ||
            (b.rate ?? -1) - (a.rate ?? -1),
        );

      return {
        teamHour,
        groups,
        availableStateCount,
        totalLeads,
        topGroup: groups[0] ?? null,
      };
    });
  }, [hours, prefs, today, baselineRates, callStats, leadsByState]);
}
