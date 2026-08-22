import { CalendarView } from "@/components/calendar/calendar-view";
import { PageShell } from "@/components/layout/page-shell";
import { formatAsOf } from "@/lib/format";
import { getLatestUpdatedAt, listEvents, listTransactions } from "@/lib/queries";

export default async function CalendarPage() {
  const now = new Date();
  const [transactions, events, latest] = await Promise.all([
    listTransactions(),
    listEvents(),
    getLatestUpdatedAt(),
  ]);

  return (
    <PageShell currentPath="/calendar">
      <CalendarView
        initialYear={now.getFullYear()}
        initialMonth={now.getMonth() + 1}
        transactions={transactions}
        events={events}
        asOf={latest ? formatAsOf(latest) : undefined}
      />
    </PageShell>
  );
}
