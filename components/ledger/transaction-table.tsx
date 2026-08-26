import { EmptyState } from "@/components/layout/empty-state";
import { categoryLabel, txTypeLabel } from "@/lib/categories";
import { signedLedgerAmount } from "@/lib/finance";
import { formatDateDot, formatSignedYen } from "@/lib/format";
import { ledgerSearchHref, type LedgerOrder } from "@/lib/ledger-query";
import Link from "next/link";
import type { TransactionDTO } from "@/types/domain";

export function TransactionTable({
  transactions,
  order,
  project,
  filtered,
}: {
  transactions: TransactionDTO[];
  order: LedgerOrder;
  project?: string;
  filtered: boolean;
}) {
  if (transactions.length === 0) {
    return (
      <div className="px-6 pb-8">
        <EmptyState
          title={filtered ? "この条件の取引は無いよ" : "まだ取引がないよ"}
          description={
            filtered
              ? "企画を変えるか、全部表示に戻してみてね。"
              : "取引が入ると、ここに並ぶよ。"
          }
        />
      </div>
    );
  }

  const nextOrder: LedgerOrder = order === "desc" ? "asc" : "desc";
  const dateHref = ledgerSearchHref({ project, order: nextOrder });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-6 py-3 font-medium sm:px-8">
              <Link href={dateHref} className="hover:text-secondary">
                日付 {order === "desc" ? "↓" : "↑"}
              </Link>
            </th>
            <th className="px-4 py-3 font-medium">科目</th>
            <th className="px-4 py-3 font-medium">摘要</th>
            <th className="px-4 py-3 font-medium">企画</th>
            <th className="px-6 py-3 text-right font-medium sm:px-8">金額（円）</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-t border-zinc-100">
              <td className="px-6 py-3 tabular-nums sm:px-8">
                {formatDateDot(new Date(`${tx.date}T00:00:00`))}
              </td>
              <td className="px-4 py-3">
                {categoryLabel(tx.category)}
                {tx.type !== "income" && tx.type !== "expense" ? (
                  <span className="ml-2 text-xs text-zinc-400">
                    {txTypeLabel(tx.type)}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">{tx.title}</td>
              <td className="px-4 py-3">
                {tx.projectId && tx.projectTitle ? (
                  <Link
                    href={ledgerSearchHref({ project: tx.projectId, order })}
                    className="text-secondary hover:underline"
                  >
                    {tx.projectTitle}
                  </Link>
                ) : (
                  <span className="text-zinc-400">—</span>
                )}
              </td>
              <td
                className={
                  tx.type === "income"
                    ? "px-6 py-3 text-right text-teal-600 sm:px-8"
                    : tx.type === "expense"
                      ? "px-6 py-3 text-right text-rose-600 sm:px-8"
                      : "px-6 py-3 text-right text-zinc-600 sm:px-8"
                }
              >
                {formatSignedYen(signedLedgerAmount(tx))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
