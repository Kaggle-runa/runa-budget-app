import { AdminNav } from "@/components/admin/admin-nav";
import { RaceCsvForm } from "@/components/admin/race-csv-form";
import { GlassCard } from "@/components/layout/glass-card";
import { formatYen } from "@/lib/format";
import { currentCash } from "@/lib/races/ingest";
import { listRaceTickets } from "@/lib/races/queries";
import { summarizeTickets } from "@/lib/races/summary";

export default async function AdminRacesPage() {
  const [tickets, cash] = await Promise.all([listRaceTickets(), currentCash()]);
  const kyotei = summarizeTickets(tickets.filter((ticket) => ticket.sport === "kyotei"));
  const keiba = summarizeTickets(tickets.filter((ticket) => ticket.sport === "keiba"));

  return (
    <>
      <AdminNav currentPath="/admin/races" />
      <h1 className="mb-4 text-2xl font-bold text-secondary">レースの取込</h1>
      <GlassCard className="mb-6 p-5">
        <RaceCsvForm />
      </GlassCard>
      <GlassCard className="p-5">
        <h2 className="text-lg font-semibold text-secondary">いま入っている買い目</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">現金</dt>
            <dd>{formatYen(cash)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">競艇</dt>
            <dd>{kyotei.tickets}件</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">競馬</dt>
            <dd>{keiba.tickets}件</dd>
          </div>
        </dl>
      </GlassCard>
    </>
  );
}
