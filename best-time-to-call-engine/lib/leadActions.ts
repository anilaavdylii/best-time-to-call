"use server";

import { getWorkspaceId } from "@/lib/workspace";
import { STATE_TZ } from "@/lib/schedule";
import {
  deleteLastCallAttempt,
  findContactState,
  getLead,
  insertCallAttempt,
  listLeadsForState,
} from "@/db/contacts";
import type { CallKind, LeadRow, Outcome } from "./leadTypes";

const KINDS: CallKind[] = [
  "answered",
  "positive",
  "no_answer",
  "busy",
  "failed",
];

// The hour (0-23) it is right now in a time zone.
function localHourNow(timeZone: string) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "numeric",
    hourCycle: "h23",
  }).format(new Date());
  return Number(hour) % 24;
}

// The numbers in one state for this browser's workspace.
export async function getLeadsForState(state: string): Promise<LeadRow[]> {
  if (typeof state !== "string" || !/^[A-Z]{2}$/.test(state)) return [];

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return [];

  return listLeadsForState(workspaceId, state);
}

// Records what happened on a call. The time is always "now", on the real clock.
// Returns the updated row, or null if the call could not be saved.
export async function logCall(
  contactId: number,
  kind: CallKind,
): Promise<LeadRow | null> {
  if (!Number.isInteger(contactId) || !KINDS.includes(kind)) return null;

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return null;

  // Also proves the number belongs to this workspace.
  const state = await findContactState(workspaceId, contactId);
  const timeZone = state ? STATE_TZ[state] : undefined;
  if (!state || !timeZone) return null;

  const outcome: Outcome = kind === "positive" ? "answered" : kind;
  await insertCallAttempt(
    contactId,
    localHourNow(timeZone),
    outcome,
    kind === "positive",
  );

  return getLead(workspaceId, contactId);
}

// Removes the latest logged call of a number (the "Undo" button).
// Returns the updated row, or null if there was nothing to undo.
export async function undoLastCall(contactId: number): Promise<LeadRow | null> {
  if (!Number.isInteger(contactId)) return null;

  const workspaceId = await getWorkspaceId();
  if (!workspaceId) return null;

  const removed = await deleteLastCallAttempt(workspaceId, contactId);
  if (!removed) return null;

  return getLead(workspaceId, contactId);
}
