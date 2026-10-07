import { prisma } from "@/lib/db";
import { toRaceTicketDTO } from "@/lib/races/ingest";
import type { RaceSport, RaceTicketDTO } from "@/lib/races/types";

export async function listRaceTickets(filter?: {
  sport?: RaceSport;
  from?: string;
  to?: string;
}): Promise<RaceTicketDTO[]> {
  const rows = await prisma.raceTicket.findMany({
    where: {
      ...(filter?.sport ? { sport: filter.sport } : {}),
      ...(filter?.from || filter?.to
        ? {
            date: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
    },
    orderBy: [{ date: "desc" }, { receiptNumber: "asc" }],
  });
  return rows
    .map(toRaceTicketDTO)
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      const left = Number(a.receiptNumber);
      const right = Number(b.receiptNumber);
      if (Number.isFinite(left) && Number.isFinite(right) && left !== right) return left - right;
      return a.receiptNumber.localeCompare(b.receiptNumber);
    });
}
