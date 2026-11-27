export type Outcome = "answered" | "no_answer" | "busy" | "failed";

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
