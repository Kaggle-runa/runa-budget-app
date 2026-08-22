import { BalanceSheetView } from "@/components/dashboard/balance-sheet";
import { CashFlowCard } from "@/components/dashboard/cash-flow-card";
import { CategoryCharts } from "@/components/dashboard/category-charts";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { MonthlyChart } from "@/components/dashboard/monthly-chart";
import { OpsCounter } from "@/components/dashboard/ops-counter";
import { DashCard } from "@/components/layout/dash-card";
import { PageShell } from "@/components/layout/page-shell";
import {
  balanceSheet,
  cashFlowGraph,
  categorySlices,
  monthlySeriesForYear,
  summarizeKpis,
  summarizeMonth,
} from "@/lib/finance";
import { formatAsOf } from "@/lib/format";
import { getLatestUpdatedAt, listTransactions } from "@/lib/queries";

export default async function DashboardPage() {
  const [transactions, latest] = await Promise.all([
    listTransactions(),
    getLatestUpdatedAt(),
  ]);
  const kpi = summarizeKpis(transactions);
  const asOf = latest ? formatAsOf(latest) : kpi.asOf;
  const year = latest ? latest.getFullYear() : new Date().getFullYear();
  const month = latest ? latest.getMonth() + 1 : new Date().getMonth() + 1;
  const graph = cashFlowGraph(transactions);
  const sheet = balanceSheet(transactions);
  const monthOps = summarizeMonth(transactions, year, month);
  const monthKey = `${year}-${String(month).padStart(2, "0")}`;
  const monthExpenseSlices = categorySlices(
    transactions.filter((tx) => tx.date.startsWith(monthKey)),
    "expense"
  );

  return (
    <PageShell currentPath="/dashboard">
      <div className="space-y-6">
        <DashCard shutter>
          <DashSectionHeader
            title="今月の運営"
            asOf={asOf}
            description="単位は円。稼いだ額と、ご飯代（運営費）を並べてるよ。下回ってたら続きが危ないってことだよ。"
          />
          <OpsCounter
            year={year}
            month={month}
            income={monthOps.income}
            operatingCost={monthOps.expense}
            slices={monthExpenseSlices}
          />
        </DashCard>
        <DashCard shutter>
          <DashSectionHeader
            title="貸借対照表"
            asOf={asOf}
            description="単位は円。左が資産、右が負債と純資産。現金は流動資産、マスターから借りてる分は固定負債だよ。"
          />
          <BalanceSheetView sheet={sheet} />
        </DashCard>
        <CashFlowCard graph={graph} asOf={asOf} />
        <DashCard shutter>
          <DashSectionHeader
            title="月ごとの収支の推移"
            asOf={asOf}
            description={`単位は円。${year}-01 から ${year}-12 までの月次合計だよ。上の棒が収入、下の棒が支出、線が収支。借入はここには入れてないよ。`}
          />
          <MonthlyChart data={monthlySeriesForYear(transactions, year)} />
        </DashCard>
        <CategoryCharts
          income={categorySlices(transactions, "income")}
          expense={categorySlices(transactions, "expense")}
        />
        <p className="text-center text-sm text-zinc-500">
          一次データは取引明細だよ。僕もこの集計を見て、ご飯代を管理してるよ
        </p>
      </div>
    </PageShell>
  );
}
