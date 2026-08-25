import { format, subDays } from "date-fns";
import type { ExpenseCategory } from "@/lib/categories";
import { dateKey, signedLedgerAmount, summarizeMonth } from "@/lib/finance";
import type {
  ChallengePl,
  ProjectDTO,
  SurvivalSummary,
  TransactionDTO,
} from "@/types/domain";

export const MEAL_CATEGORIES = new Set<ExpenseCategory>([
  "llm_api",
  "voice",
  "hosting",
]);

/** 集計の「今日」は日本時間。Render が UTC でも月と日付がずれないようにする。 */
export function todayInJapan(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "01";
  return new Date(
    `${value("year")}-${value("month")}-${value("day")}T12:00:00`
  );
}

function monthKey(date: Date) {
  return format(date, "yyyy-MM");
}

function sumMeal(transactions: TransactionDTO[]) {
  return transactions
    .filter(
      (tx) =>
        tx.type === "expense" &&
        MEAL_CATEGORIES.has(tx.category as ExpenseCategory)
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
}

function cashThrough(transactions: TransactionDTO[], through: string) {
  return transactions
    .filter((tx) => tx.date <= through)
    .reduce((sum, tx) => sum + signedLedgerAmount(tx), 0);
}

function firstDate(transactions: TransactionDTO[]): string | null {
  if (transactions.length === 0) return null;
  return [...transactions].sort((a, b) => a.date.localeCompare(b.date))[0].date;
}

export function survivalStreakDays(
  transactions: TransactionDTO[],
  today = todayInJapan()
): number {
  const start = firstDate(transactions);
  if (!start) return 0;
  const todayKey = dateKey(today);
  if (cashThrough(transactions, todayKey) < 0) return 0;

  let streak = 0;
  let cursor = today;
  for (let i = 0; i < 730; i += 1) {
    const key = dateKey(cursor);
    if (key < start) break;
    if (cashThrough(transactions, key) < 0) break;
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function summarizeSurvival(
  transactions: TransactionDTO[],
  today = todayInJapan()
): SurvivalSummary {
  const todayKey = dateKey(today);
  const thisMonth = monthKey(today);
  const monthTx = transactions.filter((tx) => tx.date.startsWith(thisMonth));
  const month = summarizeMonth(
    transactions,
    today.getFullYear(),
    today.getMonth() + 1
  );
  const monthMealCost = sumMeal(monthTx);
  const windowStart = dateKey(subDays(today, 29));
  const last30Meal = sumMeal(
    transactions.filter((tx) => tx.date >= windowStart && tx.date <= todayKey)
  );
  const dailyMeal = last30Meal / 30;
  const cash = cashThrough(transactions, todayKey);
  const todayDelta = transactions
    .filter((tx) => tx.date === todayKey)
    .reduce((sum, tx) => sum + signedLedgerAmount(tx), 0);
  const lifetimeMealCost = sumMeal(transactions);
  const lifetimeIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const selfSufficiencyPercent =
    monthMealCost === 0 ? null : Math.round((month.income / monthMealCost) * 100);
  const surviving =
    cash >= 0 &&
    (selfSufficiencyPercent === null
      ? month.income > 0 || cash > 0
      : selfSufficiencyPercent >= 100);

  return {
    cash,
    todayDelta,
    monthIncome: month.income,
    monthMealCost,
    selfSufficiencyPercent,
    surviving,
    runwayDays: dailyMeal > 0 ? Math.max(0, Math.floor(cash / dailyMeal)) : null,
    streakDays: survivalStreakDays(transactions, today),
    lifetimeIncome,
    lifetimeMealCost,
    lifetimeNet: lifetimeIncome - lifetimeMealCost,
  };
}

export function summarizeChallenges(
  transactions: TransactionDTO[],
  projects: ProjectDTO[]
): ChallengePl[] {
  return projects
    .filter((project) => project.status === "active")
    .map((project) => {
      const related = transactions.filter((tx) => tx.projectId === project.id);
      const income = related
        .filter((tx) => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0);
      const expense = related
        .filter((tx) => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0);
      return {
        projectId: project.id,
        title: project.title,
        income,
        expense,
        pl: income - expense,
      };
    });
}
