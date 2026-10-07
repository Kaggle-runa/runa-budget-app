import { RaceBoard } from "@/components/races/race-board";
import { DashCard } from "@/components/layout/dash-card";
import { PageShell } from "@/components/layout/page-shell";
import { balanceSheet } from "@/lib/finance";
import { listTransactions } from "@/lib/queries";
import { mergeRaceViews } from "@/lib/races/from-ledger";
import { listRaceTickets } from "@/lib/races/queries";
import {
  monthBounds,
  pageWindow,
  RACE_PAGE_SIZE,
  summarizeBetTypesBySport,
  summarizeDays,
  summarizeMonths,
  summarizeTickets,
} from "@/lib/races/summary";
import { isRaceSport, type RaceSport, type RaceView } from "@/lib/races/types";

function ymd(value: string | undefined): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  return value;
}

function positivePage(value: string | undefined): number {
  const page = Number(value);
  if (!Number.isInteger(page) || page < 1) return 1;
  return page;
}

export default async function RacesPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string; month?: string; day?: string; page?: string }>;
}) {
  const params = await searchParams;
  const sport: "" | RaceSport =
    params.sport && isRaceSport(params.sport) ? params.sport : "";
  const day = ymd(params.day);
  const [allTickets, transactions] = await Promise.all([
    listRaceTickets(),
    listTransactions(),
  ]);
  const views = mergeRaceViews(allTickets, transactions);
  const bySport = views.filter((ticket) => !sport || ticket.sport === sport);
  const months = [...new Set(bySport.map((ticket) => ticket.date.slice(0, 7)))].sort((a, b) =>
    b.localeCompare(a)
  );
  const month =
    params.month === "all"
      ? "all"
      : params.month && monthBounds(params.month)
        ? params.month
        : (months[0] ?? "");
  const period = filterPeriod(bySport, month);
  const activeDay = day && period.some((ticket) => ticket.date === day) ? day : "";
  const listed = activeDay ? period.filter((ticket) => ticket.date === activeDay) : period;
  const window = pageWindow(listed.length, positivePage(params.page));

  return (
    <PageShell currentPath="/races">
      <DashCard>
        <RaceBoard
          tickets={listed.slice(window.start, window.end)}
          totalTickets={listed.length}
          page={window.current}
          pages={window.pages}
          pageStart={window.start}
          pageEnd={window.end}
          pageSize={RACE_PAGE_SIZE}
          cash={balanceSheet(transactions).cash}
          sport={sport}
          month={month}
          day={activeDay}
          months={months}
          days={month === "all" ? [] : summarizeDays(period)}
          monthRows={month === "all" ? summarizeMonths(bySport) : []}
          betTypes={summarizeBetTypesBySport(listed)}
          totals={summarizeTickets(listed)}
          hasAny={views.length > 0}
        />
      </DashCard>
    </PageShell>
  );
}

function filterPeriod(tickets: RaceView[], month: string): RaceView[] {
  if (month === "all" || !month) return tickets;
  const bounds = monthBounds(month);
  if (!bounds) return tickets;
  return tickets.filter((ticket) => ticket.date >= bounds.from && ticket.date <= bounds.to);
}
