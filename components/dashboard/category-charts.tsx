"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DashSectionHeader } from "@/components/dashboard/section-header";
import { DashCard } from "@/components/layout/dash-card";
import { formatYen } from "@/lib/format";
import type { CategorySlice } from "@/types/domain";

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
}: {
  title: string;
  description: string;
  data: CategorySlice[];
  colors: string[];
}) {
  return (
    <DashCard shutter>
      <DashSectionHeader title={title} description={description} />
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
  income,
  expense,
}: {
  income: CategorySlice[];
  expense: CategorySlice[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard
        title="収入の内訳"
        description="収入の科目別合計だよ。"
        data={income}
        colors={INCOME_COLORS}
      />
      <ChartCard
        title="支出の内訳"
        description="支出の科目別合計だよ。"
        data={expense}
        colors={EXPENSE_COLORS}
      />
    </div>
  );
}
