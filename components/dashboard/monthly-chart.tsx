"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatAxisYen, formatSignedYen, formatYen } from "@/lib/format";
import type { MonthlyPoint } from "@/types/domain";

type ChartRow = MonthlyPoint & { expenseNeg: number };

type TooltipBodyProps = {
  active?: boolean;
  label?: string;
  payload?: Array<{ payload: ChartRow }>;
};

function MonthlyTooltip({ active, label, payload }: TooltipBodyProps) {
  if (!active || !payload?.[0]) return null;
  const row = payload[0].payload;

  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm">
      <p className="mb-1 font-medium text-zinc-900">{label}</p>
      <p className="tabular-nums text-[#0f9d8a]">収入 : {formatYen(row.income)}</p>
      <p className="tabular-nums text-[#e11d48]">支出 : {formatYen(row.expense)}</p>
      <p className="tabular-nums text-zinc-900">収支 : {formatSignedYen(row.net)}</p>
    </div>
  );
}

export function MonthlyChart({ data }: { data: MonthlyPoint[] }) {
  const chartData = data.map((point) => ({
    ...point,
    expenseNeg: -point.expense,
  }));

  if (data.every((point) => point.income === 0 && point.expense === 0)) {
    return <p className="text-sm text-zinc-500">まだ月次データがないよ。</p>;
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} barCategoryGap="32%" barGap={0}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAxisYen}
            tick={{ fontSize: 12, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <ReferenceLine y={0} stroke="#a1a1aa" strokeWidth={1} />
          <Tooltip
            content={<MonthlyTooltip />}
            cursor={{ stroke: "#d4d4d8", strokeDasharray: "4 4" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: 8 }}
            formatter={(value) => <span className="text-zinc-600">{value}</span>}
          />
          <Bar
            dataKey="income"
            name="収入"
            fill="#0f9d8a"
            maxBarSize={26}
            radius={[4, 4, 0, 0]}
            stackId="month"
          />
          <Bar
            dataKey="expenseNeg"
            name="支出"
            fill="#e11d48"
            maxBarSize={26}
            radius={[0, 0, 4, 4]}
            stackId="month"
          />
          <Line
            type="monotone"
            dataKey="net"
            name="収支"
            stroke="#18181b"
            strokeWidth={2}
            dot={{ r: 3, fill: "#18181b" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
