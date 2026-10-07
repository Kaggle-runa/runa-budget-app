export const RACE_SPORTS = ["kyotei", "keiba"] as const;

export type RaceSport = (typeof RACE_SPORTS)[number];

export type HitStatus = "hit" | "miss";

export type RaceTicketInput = {
  sport: RaceSport;
  date: string;
  receiptNumber: string;
  venue: string;
  race: string;
  betType: string;
  selection: string;
  stakeYen: number;
  hitStatus: HitStatus;
  payoutYen: number;
  payoutTotalYen: number;
  source?: string | null;
  sourceEventId?: string | null;
};

export type RaceTicketDTO = RaceTicketInput & {
  id: string;
  netYen: number;
};

export type RaceTotals = {
  stakeYen: number;
  payoutYen: number;
  netYen: number;
  stakeKnown: boolean;
  recoveryPercent: number | null;
  hits: number;
  tickets: number;
  races: number;
};

export type RaceView = {
  id: string;
  sport: RaceSport;
  date: string;
  venue: string;
  race: string;
  betType: string;
  selection: string;
  note: string;
  stakeYen: number | null;
  payoutYen: number | null;
  netYen: number;
  hitStatus: HitStatus | "unknown";
};

export type RaceDayTotals = RaceTotals & {
  date: string;
};

export const SPORT_LABEL: Record<RaceSport, string> = {
  kyotei: "競艇",
  keiba: "競馬",
};

export function isRaceSport(value: string): value is RaceSport {
  return value === "kyotei" || value === "keiba";
}

export function normalizeVenue(value: string): string {
  return value.replace(/[\s\u3000]+/g, "");
}

export function hitLabel(status: HitStatus | "unknown"): string {
  if (status === "hit") return "的中";
  if (status === "miss") return "なし";
  return "—";
}
