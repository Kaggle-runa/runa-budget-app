import type { TransactionDTO } from "@/types/domain";

export type LedgerOrder = "asc" | "desc";

export function parseLedgerOrder(value?: string): LedgerOrder {
  return value === "asc" ? "asc" : "desc";
}

export function ledgerSearchHref(options: {
  project?: string;
  order?: LedgerOrder;
}): string {
  const params = new URLSearchParams();
  if (options.project) params.set("project", options.project);
  if (options.order && options.order !== "desc") params.set("order", options.order);
  const query = params.toString();
  return query ? `/ledger?${query}` : "/ledger";
}

export function filterLedgerTransactions(
  transactions: TransactionDTO[],
  project?: string
): TransactionDTO[] {
  if (!project) return transactions;
  if (project === "none") {
    return transactions.filter((tx) => !tx.projectId);
  }
  return transactions.filter((tx) => tx.projectId === project);
}

export function sortLedgerTransactions(
  transactions: TransactionDTO[],
  order: LedgerOrder
): TransactionDTO[] {
  const sign = order === "asc" ? 1 : -1;
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -sign : sign;
    return a.id < b.id ? -sign : sign;
  });
}
