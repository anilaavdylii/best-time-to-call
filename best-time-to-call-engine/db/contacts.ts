import { pool } from "./index";
import type { ParsedNumber } from "@/lib/phone";
import type { LeadRow, Outcome } from "../lib/leadTypes";
import type { CallStatsByStateHour } from "../lib/mapTypes";

// Saves numbers for one workspace. Numbers it already has are skipped.
// Returns how many NEW rows were added.
export async function saveContacts(
  workspaceId: string,
  numbers: ParsedNumber[],
) {
  if (numbers.length === 0) return 0;

  const res = await pool.query(
    `insert into contacts (workspace_id, phone, state)
     select $1::uuid, p, s from unnest($2::text[], $3::text[]) as t(p, s)
     on conflict (workspace_id, phone) do nothing
     returning id`,
    [workspaceId, numbers.map((n) => n.phone), numbers.map((n) => n.state)],
  );
  return res.rowCount ?? 0;
}

// How many leads this workspace has in each state: { CA: 12, NY: 5, ... }
export async function countLeadsByState(workspaceId: string) {
  const res = await pool.query<{ state: string; n: number }>(
    `select state, count(*)::int as n
     from contacts
     where workspace_id = $1 and state is not null
     group by state`,
    [workspaceId],
  );
  return Object.fromEntries(res.rows.map((r) => [r.state, r.n])) as Record<
    string,
    number
  >;
}

// Returns outbound answer statistics for each state and local hour.
export async function getCallStatsByStateHour(
  workspaceId: string,
): Promise<CallStatsByStateHour> {
  const res = await pool.query<{
    state: string;
    local_hour: number;
    answered: number;
    attempts: number;
  }>(
    `SELECT
       c.state,
       a.local_hour,
       COUNT(*) FILTER (
         WHERE a.outcome = 'answered'
       )::int AS answered,
       COUNT(*) FILTER (
         WHERE a.outcome IN ('answered', 'no_answer', 'busy')
       )::int AS attempts
     FROM call_attempts a
     JOIN contacts c ON c.id = a.contact_id
     WHERE c.workspace_id = $1
       AND c.state IS NOT NULL
       AND a.local_hour BETWEEN 0 AND 23
     GROUP BY c.state, a.local_hour`,
    [workspaceId],
  );

  const stats: CallStatsByStateHour = {};

  for (const row of res.rows) {
    const state = row.state.toUpperCase();

    if (!stats[state]) {
      stats[state] = {};
    }

    stats[state][row.local_hour] = {
      answered: row.answered,
      attempts: row.attempts,
    };
  }

  return stats;
}

const LEAD_SELECT = `
  select c.id, c.phone,
         coalesce(stats.attempts, 0)::int as attempts,
         coalesce(stats.answered_count, 0)::int as answered_count,
         coalesce(stats.no_answer_count, 0)::int as no_answer_count,
         coalesce(stats.busy_count, 0)::int as busy_count,
         coalesce(stats.failed_count, 0)::int as failed_count,
         l.outcome as last_outcome,
         l.positive as last_positive,
         l.called_at as last_called_at
  from contacts c
  left join lateral (
    select
      count(*)::int as attempts,
      count(*) filter (where outcome = 'answered')::int as answered_count,
      count(*) filter (where outcome = 'no_answer')::int as no_answer_count,
      count(*) filter (where outcome = 'busy')::int as busy_count,
      count(*) filter (where outcome = 'failed')::int as failed_count
    from call_attempts a
    where a.contact_id = c.id
  ) stats on true
  left join lateral (
    select outcome, positive, called_at
    from call_attempts
    where contact_id = c.id
    order by called_at desc, id desc
    limit 1
  ) l on true`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toLeadRow(r: any): LeadRow {
  return {
    id: r.id,
    phone: r.phone,
    attempts: r.attempts,
    outcomeCounts: {
      answered: r.answered_count ?? 0,
      no_answer: r.no_answer_count ?? 0,
      busy: r.busy_count ?? 0,
      failed: r.failed_count ?? 0,
    },
    lastOutcome: r.last_outcome as Outcome | null,
    lastPositive: r.last_positive ?? false,
    lastCalledAt: r.last_called_at
      ? new Date(r.last_called_at).toISOString()
      : null,
  };
}

// The numbers in one state. Order = who to call next:
// never called first, then the one called longest ago.
export async function listLeadsForState(
  workspaceId: string,
  state: string,
  limit = 100,
): Promise<LeadRow[]> {
  const res = await pool.query(
    `${LEAD_SELECT}
     where c.workspace_id = $1 and c.state = $2
     order by (l.called_at is not null), l.called_at asc, c.id
     limit $3`,
    [workspaceId, state, limit],
  );
  return res.rows.map(toLeadRow);
}

// One contact, but only if it belongs to this workspace.
export async function getLead(workspaceId: string, contactId: number) {
  const res = await pool.query(
    `${LEAD_SELECT} where c.id = $1 and c.workspace_id = $2`,
    [contactId, workspaceId],
  );
  return res.rows[0] ? toLeadRow(res.rows[0]) : null;
}

// The contact's state, but only if it belongs to this workspace (else null).
export async function findContactState(workspaceId: string, contactId: number) {
  const res = await pool.query<{ state: string | null }>(
    "select state from contacts where id = $1 and workspace_id = $2",
    [contactId, workspaceId],
  );
  return res.rows[0]?.state ?? null;
}

export async function insertCallAttempt(
  contactId: number,
  localHour: number,
  outcome: Outcome,
  positive: boolean,
) {
  await pool.query(
    `insert into call_attempts (contact_id, called_at, local_hour, outcome, positive)
     values ($1, now(), $2, $3, $4)`,
    [contactId, localHour, outcome, positive],
  );
}

// Deletes the most recent call of a contact (for "Undo"). The join makes sure
// the contact belongs to this workspace. Returns true if a row was deleted.
export async function deleteLastCallAttempt(
  workspaceId: string,
  contactId: number,
) {
  const res = await pool.query(
    `delete from call_attempts
     where id = (
       select a.id
       from call_attempts a
       join contacts c on c.id = a.contact_id
       where a.contact_id = $1 and c.workspace_id = $2
       order by a.called_at desc, a.id desc
       limit 1
     )`,
    [contactId, workspaceId],
  );
  return (res.rowCount ?? 0) > 0;
}
