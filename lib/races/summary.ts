import type { RaceDayTotals, RaceTicketInput, RaceTotals } from "@/lib/races/types";

export function recoveryPercent(stakeYen: number, payoutYen: number): number | null {
  if (stakeYen <= 0) return null;
  return Math.round((payoutYen / stakeYen) * 1000) / 10;
}

export function summarizeTickets(tickets: RaceTicketInput[]): RaceTotals {
  let stakeYen = 0;
  let payoutYen = 0;
  let hits = 0;
  const races = new Set<string>();
  for (const ticket of tickets) {
    stakeYen += ticket.stakeYen;
    payoutYen += ticket.payoutYen;
    if (ticket.hitStatus === "hit") hits += 1;
    races.add(`${ticket.date}|${ticket.venue}|${ticket.race}`);
  }
  return {
    stakeYen,
    payoutYen,
    netYen: payoutYen - stakeYen,
    recoveryPercent: recoveryPercent(stakeYen, payoutYen),
    hits,
    tickets: tickets.length,
    races: races.size,
  };
}

export function summarizeDays(tickets: RaceTicketInput[]): RaceDayTotals[] {
  const groups = new Map<string, RaceTicketInput[]>();
  for (const ticket of tickets) {
    const rows = groups.get(ticket.date) ?? [];
    rows.push(ticket);
    groups.set(ticket.date, rows);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, rows]) => ({ date, ...summarizeTickets(rows) }));
}
