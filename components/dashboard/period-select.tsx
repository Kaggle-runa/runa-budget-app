"use client";

import {
  CHART_PERIOD_ORDER,
  CHART_PERIODS,
  type ChartPeriod,
} from "@/lib/chart-period";

export function PeriodSelect({
  value,
  onChange,
  id,
}: {
  value: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
  id: string;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-xs text-muted-foreground">期間</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as ChartPeriod)}
        className="flex h-9 min-w-[10rem] rounded-md border border-input bg-white px-3 text-sm"
      >
        {CHART_PERIOD_ORDER.map((period) => (
          <option key={period} value={period}>
            {CHART_PERIODS[period]}
          </option>
        ))}
      </select>
    </label>
  );
}
