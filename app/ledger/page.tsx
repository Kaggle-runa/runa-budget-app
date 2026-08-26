import { LedgerFilters } from "@/components/ledger/ledger-filters";
import { TransactionTable } from "@/components/ledger/transaction-table";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { DashCard } from "@/components/layout/dash-card";
import { PageShell } from "@/components/layout/page-shell";
import { formatAsOf } from "@/lib/format";
import {
  filterLedgerTransactions,
  parseLedgerOrder,
  sortLedgerTransactions,
} from "@/lib/ledger-query";
import {
  getLatestUpdatedAt,
  listProjects,
  listTransactions,
} from "@/lib/queries";

export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; order?: string }>;
}) {
  const params = await searchParams;
  const order = parseLedgerOrder(params.order);
  const [transactions, projects, latest] = await Promise.all([
    listTransactions(),
    listProjects(),
    getLatestUpdatedAt(),
  ]);
  const projectIds = new Set(projects.map((project) => project.id));
  const project =
    params.project === "none" || (params.project && projectIds.has(params.project))
      ? params.project
      : undefined;
  const filtered = Boolean(project);
  const rows = sortLedgerTransactions(
    filterLedgerTransactions(transactions, project),
    order
  );

  return (
    <PageShell currentPath="/ledger">
      <DashCard className="overflow-hidden p-0 sm:p-0">
        <div className="space-y-4 p-6 pb-4 sm:p-8 sm:pb-4">
          <DashSectionHeader
            title="取引明細"
            asOf={latest ? formatAsOf(latest) : undefined}
            description="一次データだよ。日付の順と企画で絞れるよ。"
          />
          <LedgerFilters projects={projects} project={project} order={order} />
        </div>
        <TransactionTable
          transactions={rows}
          order={order}
          project={project}
          filtered={filtered}
        />
      </DashCard>
    </PageShell>
  );
}
