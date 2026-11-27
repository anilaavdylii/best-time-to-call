"use client";

import { useEffect, useState } from "react";
import { getLeadsForState, logCall, undoLastCall } from "../../lib/leadActions";
import type { CallKind, LeadRow, Outcome } from "../../lib/leadTypes";
import "./StateLeadsList.css";

const ACTIONS: { kind: CallKind; label: string }[] = [
  { kind: "answered", label: "Answered" },
  { kind: "positive", label: "Positive" },
  { kind: "no_answer", label: "No answer" },
  { kind: "busy", label: "Busy" },
  { kind: "failed", label: "Failed" },
];

const BADGE: Record<Outcome, { label: string; cls: string }> = {
  answered: { label: "Answered", cls: "bg-sky-100 text-sky-800" },
  no_answer: { label: "No answer", cls: "bg-slate-200 text-slate-700" },
  busy: { label: "Busy", cls: "bg-amber-100 text-amber-800" },
  failed: { label: "Failed", cls: "bg-rose-100 text-rose-800" },
};

// "+14155550101" -> "+1 415-555-0101"
function formatPhone(phone: string) {
  const m = phone.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
  return m ? `+1 ${m[1]}-${m[2]}-${m[3]}` : phone;
}

type Props = {
  state: string;
  count: number;
  onCallLogged: () => Promise<void>;
};

export default function StateLeadsList({ state, count, onCallLogged }: Props) {
  const [rows, setRows] = useState<LeadRow[] | null>(null); // null = loading
  const [busyId, setBusyId] = useState<number | null>(null);
  const [justLogged, setJustLogged] = useState<number | null>(null); // can be undone
  const [error, setError] = useState(false);

  // Load the numbers, and reload when a new import changes the count.
  useEffect(() => {
    let stale = false;
    getLeadsForState(state)
      .then((r) => !stale && setRows(r))
      .catch(() => !stale && setError(true));
    return () => {
      stale = true;
    };
  }, [state, count]);

  // Swap one row for its fresh version. Its position stays put until the next load.
  function replaceRow(row: LeadRow) {
    setRows((rs) => (rs ? rs.map((r) => (r.id === row.id ? row : r)) : rs));
  }

  async function log(id: number, kind: CallKind) {
    setBusyId(id);
    setError(false);

    try {
      const row = await logCall(id, kind);
      if (!row) throw new Error("not saved");

      replaceRow(row);
      setJustLogged(id);

      try {
        await onCallLogged();
      } catch (error) {
        console.error("Failed to refresh call stats:", error);
      }
    } catch (error) {
      console.error("Failed to log call:", error);
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  async function undo(id: number) {
    setBusyId(id);
    setError(false);

    try {
      const row = await undoLastCall(id);
      if (!row) throw new Error("nothing to undo");

      replaceRow(row);
      setJustLogged(null);

      try {
        await onCallLogged();
      } catch (error) {
        console.error("Failed to refresh call stats:", error);
      }
    } catch (error) {
      console.error("Failed to undo call:", error);
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  function formatBreakdown(counts: LeadRow["outcomeCounts"]) {
    const parts: string[] = [];
    if (counts?.answered > 0) parts.push(`${counts.answered} answered`);
    if (counts?.busy > 0) parts.push(`${counts.busy} busy`);
    if (counts?.no_answer > 0) parts.push(`${counts.no_answer} no answer`);
    if (counts?.failed > 0) parts.push(`${counts.failed} failed`);
    return parts.join(", ");
  }

  return (
    <div className="mt-4">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900">Leads</h4>
        {rows && count > rows.length && (
          <p className="text-xs text-slate-500">
            Showing the first {rows.length} of {count}
          </p>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-rose-600">
          Something went wrong. Please try again.
        </p>
      )}

      {rows === null && !error && (
        <p className="mt-2 text-sm text-slate-500">Loading numbers…</p>
      )}

      {rows && rows.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">
          No numbers in {state} yet. Import numbers to add some.
        </p>
      )}

      {rows && rows.length > 0 && (
        <ul className="mt-2 max-h-80 divide-y divide-slate-200 overflow-y-auto rounded-xl border border-slate-200 bg-white">
          {rows.map((r) => {
            const badge = r.lastOutcome ? BADGE[r.lastOutcome] : null;
            return (
              <li key={r.id} className="flex flex-col gap-2 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={`tel:${r.phone}`}
                    className="font-mono text-sm font-semibold text-slate-900 hover:underline"
                  >
                    {formatPhone(r.phone)}
                  </a>

                  <span className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    {r.attempts > 0 ? (
                      <span>
                        {r.attempts} call{r.attempts === 1 ? "" : "s"} (
                        {formatBreakdown(r.outcomeCounts)})
                      </span>
                    ) : (
                      "Not called yet"
                    )}
                    {badge && (
                      <span
                        className={`outcome-badge outcome-badge--${
                          r.lastPositive ? "positive" : r.lastOutcome
                        }`}
                      >
                        Latest: {r.lastPositive ? "Positive" : badge.label}
                      </span>
                    )}
                    {justLogged === r.id && (
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => undo(r.id)}
                        className="font-medium text-slate-600 underline hover:text-slate-900 disabled:opacity-50"
                      >
                        Undo
                      </button>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {ACTIONS.map((a) => (
                    <button
                      key={a.kind}
                      type="button"
                      disabled={busyId === r.id}
                      onClick={() => log(r.id, a.kind)}
                      className={`action-btn action-btn--${a.kind}`}
                    >
                      <span className="action-btn__dot" />
                      {a.label}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
