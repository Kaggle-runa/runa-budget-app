import { signedLedgerAmount } from "@/lib/finance";
import { normalizeVenue, type RaceTicketDTO, type RaceView } from "@/lib/races/types";
import type { TransactionDTO } from "@/types/domain";

const KYOTEI = /^競艇\s+(.+?)(\d+R)(?:\s+(\S+))?(?:\s+(\S+))?$/;
const KEIBA = /^競馬AIの(的中収入|不的中損失)\((.+?)(\d+R)[：:](.+)\)$/;

const LEDGER_STAKE_YEN = { kyotei: 100, keiba: 2000 } as const;

function withStake(sport: keyof typeof LEDGER_STAKE_YEN, netYen: number) {
  const stakeYen = LEDGER_STAKE_YEN[sport];
  return { stakeYen, payoutYen: stakeYen + netYen };
}

export function parseLedgerRace(
  transaction: Pick<TransactionDTO, "id" | "date" | "type" | "amount" | "title">
): RaceView | null {
  const title = transaction.title.trim();
  const netYen = signedLedgerAmount(transaction);
  const kyotei = KYOTEI.exec(title);
  if (kyotei) {
    const betType = kyotei[3] ?? "";
    return {
      id: transaction.id,
      sport: "kyotei",
      date: transaction.date,
      venue: normalizeVenue(kyotei[1]),
      race: kyotei[2],
      betType,
      selection: kyotei[4] ?? "",
      note: "",
      ...withStake("kyotei", netYen),
      netYen,
      hitStatus: netYen > 0 ? "hit" : netYen < 0 ? "miss" : "unknown",
    };
  }
  const keiba = KEIBA.exec(title);
  if (!keiba) return null;
  return {
    id: transaction.id,
    sport: "keiba",
    date: transaction.date,
    venue: normalizeVenue(keiba[2]),
    race: keiba[3],
    betType: "",
    selection: "",
    note: keiba[4].trim(),
    ...withStake("keiba", netYen),
    netYen,
    hitStatus: keiba[1] === "的中収入" ? "hit" : "miss",
  };
}

export function ticketToView(ticket: RaceTicketDTO): RaceView {
  return {
    id: ticket.id,
    sport: ticket.sport,
    date: ticket.date,
    venue: ticket.venue,
    race: ticket.race,
    betType: ticket.betType,
    selection: ticket.selection,
    note: "",
    stakeYen: ticket.stakeYen,
    payoutYen: ticket.payoutYen,
    netYen: ticket.netYen,
    hitStatus: ticket.hitStatus,
  };
}

function raceKey(line: Pick<RaceView, "date" | "sport" | "venue" | "race" | "betType">): string {
  return `${line.date}|${line.sport}|${line.venue}|${line.race}|${line.betType}`;
}

export function mergeRaceViews(tickets: RaceTicketDTO[], transactions: TransactionDTO[]): RaceView[] {
  const fromTickets = tickets.map(ticketToView);
  const covered = new Set(fromTickets.map(raceKey));
  const fromLedger = transactions
    .map(parseLedgerRace)
    .filter((line): line is RaceView => line !== null)
    .filter((line) => !covered.has(raceKey(line)));
  return [...fromTickets, ...fromLedger].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.venue.localeCompare(b.venue, "ja") || a.race.localeCompare(b.race, "ja");
  });
}
