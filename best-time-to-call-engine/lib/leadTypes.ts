// Types shared by the database code, the server actions and the UI.

// What can happen on a call. These match the check on call_attempts.outcome.
export type Outcome = "answered" | "no_answer" | "busy" | "failed";

// What a rep can click. "positive" means answered AND it went well.
export type CallKind = Outcome | "positive";

export type OutcomeCounts = Record<Outcome, number>;

export type LeadRow = {
  id: number;
  phone: string; // "+14155550101"
  attempts: number; // how many times it has been called
  outcomeCounts: OutcomeCounts; // per-outcome totals
  lastOutcome: Outcome | null; // null = never called
  lastPositive: boolean;
  lastCalledAt: string | null; // ISO time
};
