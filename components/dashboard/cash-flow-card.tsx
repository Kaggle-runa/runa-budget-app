import Link from "next/link";
import { CashFlowSankey } from "@/components/dashboard/cash-flow-sankey";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { KpiStrip } from "@/components/dashboard/kpi-strip";
import { DashCard } from "@/components/layout/dash-card";
import { Button } from "@/components/ui/button";
import type { CashFlowGraph } from "@/types/domain";

export function CashFlowCard({
  graph,
  asOf,
}: {
  graph: CashFlowGraph;
  asOf: string;
}) {
  return (
    <DashCard shutter>
      <DashSectionHeader
        title="収支の流れ"
        asOf={asOf}
        description="左が収入とマスター借入、右が支出と現金。借入は損益に入れてないよ。"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/ledger">取引明細</Link>
          </Button>
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
