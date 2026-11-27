// What the schedule logic knows about ONE state at the selected hour.
export type StateInfo = {
  score: number;
  zone: string;
  localTime: string;
  teamTime: string;
  eligible: boolean;
  predictionAvailable?: boolean;
  predictionSource?: PredictionSource;
  ownAttempts?: number;
};

export type HourlyCallStats = {
  answered: number;
  attempts: number;
};

export type CallStatsByStateHour = Record<
  string,
  Record<number, HourlyCallStats>
>;

export type PredictionSource = "allo" | "combined" | "history";
