import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { categoryLabel } from "@/lib/categories";
import { formatAsOf } from "@/lib/format";
import type {
  BalanceSheet,
  CashFlowGraph,
  CashFlowSide,
  CategorySlice,
  KpiSummary,
  MonthlyPoint,
  TransactionDTO,
  TxType,
} from "@/types/domain";

const TX_TYPES: TxType[] = ["income", "expense", "loan", "repay", "capex"];

export function parseTxType(value: string): TxType {
  return TX_TYPES.includes(value as TxType) ? (value as TxType) : "expense";
}

export function dateKey(date: Date | string): string {
  return format(typeof date === "string" ? new Date(date) : date, "yyyy-MM-dd");
}

export function toTransactionDTO(row: {
  id: string;
  date: Date;
  type: string;
  amount: number;
  category: string;
  title: string;
  memo: string | null;
  projectId: string | null;
  project: { title: string } | null;
}): TransactionDTO {
  return {
    id: row.id,
    date: dateKey(row.date),
    type: parseTxType(row.type),
    amount: row.amount,
    category: row.category,
    title: row.title,
    memo: row.memo,
    projectId: row.projectId,
    projectTitle: row.project?.title ?? null,
  };
}

export function signedLedgerAmount(tx: Pick<TransactionDTO, "type" | "amount">): number {
  if (tx.type === "income" || tx.type === "loan") return tx.amount;
  return -tx.amount;
}

export function sumByType(transactions: TransactionDTO[], type: TxType): number {
  return transactions
    .filter((tx) => tx.type === type)
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function balanceSheet(transactions: TransactionDTO[]): BalanceSheet {
  const incomeTotal = sumByType(transactions, "income");
  const expenseTotal = sumByType(transactions, "expense");
  const loanIn = sumByType(transactions, "loan");
  const repayOut = sumByType(transactions, "repay");
  const capexOut = sumByType(transactions, "capex");
  const cash = incomeTotal + loanIn - expenseTotal - repayOut - capexOut;
  const equipment = capexOut;
  const loan = loanIn - repayOut;
  const equity = incomeTotal - expenseTotal;

  return {
    cash,
    equipment,
    loan,
    equity,
    assets: cash + equipment,
    incomeTotal,
    expenseTotal,
    loanIn,
    repayOut,
    capexOut,
  };
}

export function summarizeKpis(transactions: TransactionDTO[]): KpiSummary {
  const sheet = balanceSheet(transactions);
  const latest = transactions.reduce<Date | null>((acc, tx) => {
    const date = new Date(`${tx.date}T00:00:00`);
    if (!acc || date > acc) return date;
    return acc;
  }, null);

  return {
    incomeTotal: sheet.incomeTotal,
    expenseTotal: sheet.expenseTotal,
    net: sheet.equity,
    balance: sheet.cash,
    asOf: formatAsOf(latest ?? new Date()),
  };
}

export function monthlySeries(transactions: TransactionDTO[]): MonthlyPoint[] {
  const map = new Map<string, MonthlyPoint>();

  for (const tx of transactions) {
    if (tx.type !== "income" && tx.type !== "expense") continue;
    const date = new Date(`${tx.date}T00:00:00`);
    const key = format(date, "yyyy-MM");
    const current = map.get(key) ?? {
      key,
      label: format(date, "yyyy年M月", { locale: ja }),
      income: 0,
      expense: 0,
      net: 0,
    };
    if (tx.type === "income") current.income += tx.amount;
    else current.expense += tx.amount;
    current.net = current.income - current.expense;
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function categorySlices(
  transactions: TransactionDTO[],
  type: TxType
): CategorySlice[] {
  const map = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== type) continue;
    map.set(tx.category, (map.get(tx.category) ?? 0) + tx.amount);
  }
  return [...map.entries()]
    .map(([key, amount]) => ({
      key,
      label: categoryLabel(key),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function monthlySeriesForYear(
  transactions: TransactionDTO[],
  year: number
): MonthlyPoint[] {
  const existing = new Map(
    monthlySeries(transactions)
      .filter((point) => point.key.startsWith(`${year}-`))
      .map((point) => [point.key, point])
  );

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    return (
      existing.get(key) ?? {
        key,
        label: `${month}月`,
        income: 0,
        expense: 0,
        net: 0,
      }
    );
  }).map((point) => ({
    ...point,
    label: `${Number(point.key.slice(5, 7))}月`,
  }));
}

export function cashFlowGraph(transactions: TransactionDTO[]): CashFlowGraph {
  const sheet = balanceSheet(transactions);
  const incomeNodes: CashFlowSide[] = categorySlices(transactions, "income").map(
    (slice) => ({
      ...slice,
      kind: "income",
    })
  );
  const expenseNodes: CashFlowSide[] = categorySlices(transactions, "expense").map(
    (slice) => ({
      ...slice,
      kind: "expense",
    })
  );

  const left = [
    ...incomeNodes,
    sheet.loanIn > 0
      ? {
          key: "loan",
          label: "マスター借入",
          amount: sheet.loanIn,
          kind: "loan" as const,
        }
      : null,
  ].filter((node): node is CashFlowSide => node !== null && node.amount > 0);

  const right = [
    ...expenseNodes,
    sheet.repayOut > 0
      ? {
          key: "repay",
          label: "返済",
          amount: sheet.repayOut,
          kind: "repay" as const,
        }
      : null,
    sheet.capexOut > 0
      ? {
          key: "capex",
          label: "機材",
          amount: sheet.capexOut,
          kind: "capex" as const,
        }
      : null,
    sheet.cash > 0
      ? {
          key: "cash",
          label: "現金",
          amount: sheet.cash,
          kind: "balance" as const,
        }
      : null,
  ].filter((node): node is CashFlowSide => node !== null && node.amount > 0);

  return {
    left,
    right,
    total: sheet.incomeTotal + sheet.loanIn,
    incomeTotal: sheet.incomeTotal,
    expenseTotal: sheet.expenseTotal,
    balance: sheet.equity,
  };
}

export function summarizeMonth(
  transactions: TransactionDTO[],
  year: number,
  month: number
): { income: number; expense: number; net: number } {
  const key = `${year}-${String(month).padStart(2, "0")}`;
  let income = 0;
  let expense = 0;
  for (const tx of transactions) {
    if (!tx.date.startsWith(key)) continue;
    if (tx.type === "income") income += tx.amount;
    else if (tx.type === "expense") expense += tx.amount;
  }
  return { income, expense, net: income - expense };
}

export function dayNet(transactions: TransactionDTO[], dateKey: string): number {
  return transactions
    .filter((tx) => tx.date.slice(0, 10) === dateKey)
    .reduce((sum, tx) => {
      if (tx.type === "income") return sum + tx.amount;
      if (tx.type === "expense") return sum - tx.amount;
      return sum;
    }, 0);
}
