import { RACE_PAYOUT_CATEGORY, RACE_STAKE_CATEGORY } from "@/lib/categories";
import type { TransactionDTO } from "@/types/domain";
import { SPORT_LABEL, type RaceSport, type RaceTicketInput } from "@/lib/races/types";

export const RACE_LEDGER_SOURCE = "race";

export type RaceLedgerLine = {
  date: string;
  type: "income" | "expense";
  amount: number;
  category: typeof RACE_STAKE_CATEGORY | typeof RACE_PAYOUT_CATEGORY;
  title: string;
  memo: string;
  source: typeof RACE_LEDGER_SOURCE;
  sourceEventId: string;
};

export function stakeEventId(sport: RaceSport, date: string): string {
  return `${sport}:${date}:stake`;
}

export function payoutEventId(sport: RaceSport, date: string): string {
  return `${sport}:${date}:payout`;
}

export function dayLedgerLines(
  sport: RaceSport,
  date: string,
  tickets: RaceTicketInput[]
): RaceLedgerLine[] {
  const stakeYen = tickets.reduce((sum, ticket) => sum + ticket.stakeYen, 0);
  const payoutYen = tickets.reduce((sum, ticket) => sum + ticket.payoutYen, 0);
  const label = SPORT_LABEL[sport];
  const memo = `買い目${tickets.length}件`;
  const lines: RaceLedgerLine[] = [];
  if (stakeYen > 0) {
    lines.push({
      date,
      type: "expense",
      amount: stakeYen,
      category: RACE_STAKE_CATEGORY,
      title: `${label}の購入`,
      memo,
      source: RACE_LEDGER_SOURCE,
      sourceEventId: stakeEventId(sport, date),
    });
  }
  if (payoutYen > 0) {
    lines.push({
      date,
      type: "income",
      amount: payoutYen,
      category: RACE_PAYOUT_CATEGORY,
      title: `${label}の払戻`,
      memo,
      source: RACE_LEDGER_SOURCE,
      sourceEventId: payoutEventId(sport, date),
    });
  }
  return lines;
}

export function projectRaceLedger(
  existing: TransactionDTO[],
  lines: RaceLedgerLine[],
  dayKeys: { sport: RaceSport; date: string }[]
): TransactionDTO[] {
  const prefixes = dayKeys.map((key) => `${key.sport}:${key.date}:`);
  const kept = existing.filter((tx) => {
    if (tx.source !== RACE_LEDGER_SOURCE || !tx.sourceEventId) return true;
    return !prefixes.some((prefix) => tx.sourceEventId?.startsWith(prefix));
  });
  const projected = lines.map((line, index) => ({
    id: `race-preview-${index}`,
    date: line.date,
    type: line.type,
    amount: line.amount,
    category: line.category,
    title: line.title,
    memo: line.memo,
    projectId: null,
    projectTitle: null,
    source: line.source,
    sourceEventId: line.sourceEventId,
  }));
  return [...kept, ...projected];
}
