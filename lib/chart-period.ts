import { subDays, subMonths, subYears } from "date-fns";
import { dateKey } from "@/lib/finance";
import type { TransactionDTO } from "@/types/domain";

export const CHART_PERIODS = {
  all: "全体期間",
  year: "ここ1年",
  half: "ここ半年",
  days30: "ここ30日",
  month: "ここ1ヶ月",
  week: "ここ1週間",
} as const;

export type ChartPeriod = keyof typeof CHART_PERIODS;

export const CHART_PERIOD_ORDER = [
  "all",
  "year",
  "half",
  "days30",
  "month",
  "week",
] as const satisfies readonly ChartPeriod[];

function todayDate(today: string): Date {
  return new Date(`${today}T12:00:00`);
}

export function chartPeriodStart(
  period: ChartPeriod,
  today: string
): string | null {
  const date = todayDate(today);
  switch (period) {
    case "all":
      return null;
    case "year":
      return dateKey(subYears(date, 1));
    case "half":
      return dateKey(subMonths(date, 6));
    case "days30":
      return dateKey(subDays(date, 29));
    case "month":
      return dateKey(subMonths(date, 1));
    case "week":
      return dateKey(subDays(date, 6));
  }
}

export function filterTransactionsByPeriod(
  transactions: TransactionDTO[],
  period: ChartPeriod,
  today: string
): TransactionDTO[] {
  const start = chartPeriodStart(period, today);
  if (!start) return transactions;
  return transactions.filter((tx) => tx.date >= start && tx.date <= today);
}

export function chartPeriodCaption(period: ChartPeriod, today: string): string {
  if (period === "all") return CHART_PERIODS.all;
  const start = chartPeriodStart(period, today);
  return `${CHART_PERIODS[period]}（${start}〜${today}）`;
}
