import { TransactionTable } from "@/components/ledger/transaction-table";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { DashCard } from "@/components/layout/dash-card";
import { PageShell } from "@/components/layout/page-shell";
import { formatAsOf } from "@/lib/format";
import { getLatestUpdatedAt, listTransactions } from "@/lib/queries";

export default async function LedgerPage() {
  const [transactions, latest] = await Promise.all([
    listTransactions(),
    getLatestUpdatedAt(),
  ]);

  return (
    <PageShell currentPath="/ledger">
      <DashCard className="overflow-hidden p-0 sm:p-0">
        <div className="p-6 sm:p-8 pb-0">
          <DashSectionHeader
            title="取引明細"
            asOf={latest ? formatAsOf(latest) : undefined}
            description="一次データだよ。新しい取引から並べてるよ。"
          />
        </div>
        <TransactionTable transactions={transactions} />
      </DashCard>
    </PageShell>
  );
}
