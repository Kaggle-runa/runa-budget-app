"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CashFlowSankey } from "@/components/dashboard/cash-flow-sankey";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { DashCard } from "@/components/layout/dash-card";
import { Button } from "@/components/ui/button";
import {
  chartPeriodCaption,
  filterTransactionsByPeriod,
  type ChartPeriod,
} from "@/lib/chart-period";
import { cashFlowGraph } from "@/lib/finance";
import type { TransactionDTO } from "@/types/domain";

export function CashFlowCard({
  transactions,
  today,
  asOf,
}: {
  transactions: TransactionDTO[];
  today: string;
  asOf: string;
}) {
  const [period, setPeriod] = useState<ChartPeriod>("all");
  const graph = useMemo(
    () =>
      cashFlowGraph(filterTransactionsByPeriod(transactions, period, today)),
    [transactions, period, today]
  );
  const caption = period === "all" ? asOf : chartPeriodCaption(period, today);

  return (
    <DashCard shutter>
      <DashSectionHeader
        title="収支の流れ"
        asOf={caption}
        description="選んだ期間の入りと出だよ。左が収入とマスター借入、右が支出と現金。借入は損益に入れてないよ。"
        action={
          <div className="flex flex-wrap items-end gap-3">
            <PeriodSelect id="cash-flow-period" value={period} onChange={setPeriod} />
            <Button asChild variant="outline" size="sm">
              <Link href="/ledger">取引明細</Link>
            </Button>
          </div>
        }
      />
      <KpiStrip
        incomeTotal={graph.incomeTotal}
        expenseTotal={graph.expenseTotal}
        net={graph.balance}
      />
      <CashFlowSankey graph={graph} />
    </DashCard>
  );
}
