// What the schedule logic knows about ONE state at the selected hour.
export type StateInfo = {
  score: number;
  zone: string;
  localTime: string;
  teamTime: string;
  eligible: boolean;
  predictionAvailable?: boolean;
};
