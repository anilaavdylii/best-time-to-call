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
  rate: number | null;
};

export type ZoneGroup = {
  zone: string;
  localTime: string;
  states: StateItem[];
  leads: number;
  rate: number | null;
  expectedConnects: number;
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

export type HourScheduleItem = {
  teamHour: number;
  groups: ZoneGroup[]; // Time zones that have leads > 0
  openZones: ZoneGroup[]; // All legally open time zones (even with 0 leads)
  availableStateCount: number;
  totalLeads: number;
  topGroup: ZoneGroup | null;
};

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

      const activeZoneGroups = new Map<string, ZoneGroup>();
      const openZoneGroups = new Map<string, ZoneGroup>();
      let availableStateCount = 0;
      let totalLeads = 0;

      for (const [code, info] of Object.entries(stateData)) {
        if (!info.eligible) continue;
        availableStateCount += 1;

        const leadCount = leadsByState[code] ?? 0;
        const stateRate = info.predictionAvailable ? info.score : null;

        let openGroup = openZoneGroups.get(info.zone);
        if (!openGroup) {
          openGroup = {
            zone: info.zone,
            localTime: info.localTime,
            states: [],
            leads: 0,
            rate: stateRate,
            expectedConnects: 0,
          };
          openZoneGroups.set(info.zone, openGroup);
        }
        openGroup.states.push({ code, leads: leadCount, rate: stateRate });
        openGroup.leads += leadCount;
        if (openGroup.rate === null && stateRate !== null) {
          openGroup.rate = stateRate;
        }

        if (leadCount <= 0) continue;
        totalLeads += leadCount;

        let activeGroup = activeZoneGroups.get(info.zone);
        if (!activeGroup) {
          activeGroup = {
            zone: info.zone,
            localTime: info.localTime,
            states: [],
            leads: 0,
            rate: stateRate,
            expectedConnects: 0,
          };
          activeZoneGroups.set(info.zone, activeGroup);
        }
        activeGroup.states.push({ code, leads: leadCount, rate: stateRate });
        activeGroup.leads += leadCount;
        if (activeGroup.rate === null && stateRate !== null) {
          activeGroup.rate = stateRate;
        }
      }

      const groups = Array.from(activeZoneGroups.values())
        .map((group) => {
          group.states.sort(
            (a, b) => b.leads - a.leads || a.code.localeCompare(b.code),
          );
          group.expectedConnects = group.states.reduce(
            (sum, s) => sum + (s.rate !== null ? s.leads * s.rate : 0),
            0,
          );
          return group;
        })
        .sort(
          (a, b) =>
            b.expectedConnects - a.expectedConnects ||
            (b.rate ?? -1) - (a.rate ?? -1),
        );

      const openZones = Array.from(openZoneGroups.values())
        .map((group) => {
          group.states.sort((a, b) => a.code.localeCompare(b.code));
          return group;
        })
        .sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));

      return {
        teamHour,
        groups,
        openZones,
        availableStateCount,
        totalLeads,
        topGroup: totalLeads > 0 ? (groups[0] ?? null) : null,
      };
    });
  }, [hours, prefs, today, baselineRates, callStats, leadsByState]);
}
