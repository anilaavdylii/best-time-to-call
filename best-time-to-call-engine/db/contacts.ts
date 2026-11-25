import { pool } from "./index";
import type { ParsedNumber } from "@/lib/phone";

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
