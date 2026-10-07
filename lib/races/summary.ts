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

export type RaceGroupTotals = RaceTotals & {
  key: string;
};

export function summarizeGroups(
  tickets: RaceTicketInput[],
  keyOf: (ticket: RaceTicketInput) => string
): RaceGroupTotals[] {
  const groups = new Map<string, RaceTicketInput[]>();
  for (const ticket of tickets) {
    const key = keyOf(ticket);
    const rows = groups.get(key) ?? [];
    rows.push(ticket);
    groups.set(key, rows);
  }
  return [...groups.entries()]
    .map(([key, rows]) => ({ key, ...summarizeTickets(rows) }))
    .sort((a, b) => b.stakeYen - a.stakeYen || a.key.localeCompare(b.key, "ja"));
}

export function summarizeBetTypes(tickets: RaceTicketInput[]): RaceGroupTotals[] {
  return summarizeGroups(tickets, (ticket) => ticket.betType);
}

export function summarizeMonths(tickets: RaceTicketInput[]): RaceGroupTotals[] {
  return summarizeGroups(tickets, (ticket) => ticket.date.slice(0, 7)).sort((a, b) =>
    b.key.localeCompare(a.key)
  );
}

export const RACE_PAGE_SIZE = 20;

export function pageWindow(total: number, page: number, size = RACE_PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  return { current, pages, start, end: Math.min(start + size, total) };
}

export function monthBounds(month: string): { from: string; to: string } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const mon = Number(match[2]);
  if (mon < 1 || mon > 12) return null;
  const last = new Date(year, mon, 0).getDate();
  return {
    from: `${month}-01`,
    to: `${month}-${String(last).padStart(2, "0")}`,
  };
}

export function shiftMonth(month: string, delta: number): string | null {
  const bounds = monthBounds(month);
  if (!bounds) return null;
  const [year, mon] = month.split("-").map(Number);
  const date = new Date(year, mon - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
