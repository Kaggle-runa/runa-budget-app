import { RaceBoard } from "@/components/races/race-board";
import { DashCard } from "@/components/layout/dash-card";
import { PageShell } from "@/components/layout/page-shell";
import { balanceSheet } from "@/lib/finance";
import { listTransactions } from "@/lib/queries";
import { listRaceTickets } from "@/lib/races/queries";
import { isRaceSport, type RaceSport } from "@/lib/races/types";

function ymd(value: string | undefined): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return value;
}

export default async function RacesPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const sport: "" | RaceSport =
    params.sport && isRaceSport(params.sport) ? params.sport : "";
  const from = ymd(params.from);
  const to = ymd(params.to);
  const [allTickets, transactions] = await Promise.all([
    listRaceTickets(),
    listTransactions(),
  ]);
  const tickets = allTickets.filter((ticket) => {
    if (sport && ticket.sport !== sport) return false;
    if (from && ticket.date < from) return false;
    if (to && ticket.date > to) return false;
    return true;
  });

  return (
    <PageShell currentPath="/races">
      <DashCard>
        <RaceBoard
          tickets={tickets}
          cash={balanceSheet(transactions).cash}
          sport={sport}
          from={from}
          to={to}
          hasAny={allTickets.length > 0}
        />
      </DashCard>
    </PageShell>
  );
}
