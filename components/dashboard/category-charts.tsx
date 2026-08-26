"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { PeriodSelect } from "@/components/dashboard/period-select";
import { DashCard } from "@/components/layout/dash-card";
import {
  chartPeriodCaption,
  filterTransactionsByPeriod,
  type ChartPeriod,
} from "@/lib/chart-period";
import { categorySlices } from "@/lib/finance";
import { formatYen } from "@/lib/format";
import type { CategorySlice, TransactionDTO } from "@/types/domain";

const INCOME_COLORS = [
  "#0ea5e9",
  "#2563eb",
  "#7c3aed",
  "#0d9488",
  "#f59e0b",
  "#16a34a",
];
const EXPENSE_COLORS = [
  "#e11d48",
  "#ea580c",
  "#7c3aed",
  "#0369a1",
  "#57534e",
];

function ChartCard({
  title,
  description,
  data,
  colors,
  periodControl,
}: {
  title: string;
  description: string;
  data: CategorySlice[];
  colors: string[];
  periodControl?: ReactNode;
}) {
  return (
    <DashCard shutter>
      <DashSectionHeader
        title={title}
        description={description}
        action={periodControl}
      />
      {data.length === 0 ? (
        <p className="text-sm text-zinc-500">データがまだないよ。</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="label"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.key} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatYen(Number(value))}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashCard>
  );
}

export function CategoryCharts({
  transactions,
  today,
}: {
  transactions: TransactionDTO[];
  today: string;
}) {
  const [period, setPeriod] = useState<ChartPeriod>("all");
  const rows = useMemo(
    () => filterTransactionsByPeriod(transactions, period, today),
    [transactions, period, today]
  );
  const income = useMemo(() => categorySlices(rows, "income"), [rows]);
  const expense = useMemo(() => categorySlices(rows, "expense"), [rows]);
  const caption = period === "all" ? null : chartPeriodCaption(period, today);
  const incomeDescription = caption
    ? `収入の科目別合計だよ。${caption}。`
    : "収入の科目別合計だよ。";
  const expenseDescription = caption
    ? `支出の科目別合計だよ。${caption}。`
    : "支出の科目別合計だよ。";
  const periodControl = (
    <PeriodSelect id="category-period" value={period} onChange={setPeriod} />
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="収入の内訳"
        description={incomeDescription}
        data={income}
        colors={INCOME_COLORS}
        periodControl={periodControl}
      />
      <ChartCard
        title="支出の内訳"
        description={expenseDescription}
        data={expense}
        colors={EXPENSE_COLORS}
        periodControl={
          <PeriodSelect
            id="category-period-expense"
            value={period}
            onChange={setPeriod}
          />
        }
      />
    </div>
  );
}
