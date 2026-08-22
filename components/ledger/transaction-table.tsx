import { EmptyState } from "@/components/layout/empty-state";
import { categoryLabel, txTypeLabel } from "@/lib/categories";
import { signedLedgerAmount } from "@/lib/finance";
import { formatDateDot, formatSignedYen } from "@/lib/format";
import type { TransactionDTO } from "@/types/domain";

export function TransactionTable({
  transactions,
}: {
  transactions: TransactionDTO[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="px-6 pb-8">
        <EmptyState
          title="まだ取引がないよ"
          description="取引が入ると、ここに並ぶよ。"
        />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-zinc-50 text-left text-zinc-500">
          <tr>
            <th className="px-6 py-3 font-medium sm:px-8">日付</th>
            <th className="px-4 py-3 font-medium">科目</th>
            <th className="px-4 py-3 font-medium">摘要</th>
            <th className="px-6 py-3 text-right font-medium sm:px-8">金額（円）</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className="border-t border-zinc-100">
              <td className="px-6 py-3 sm:px-8">
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
              <td className="px-4 py-3">
                {tx.title}
                {tx.projectTitle ? (
                  <span className="ml-2 text-xs text-zinc-400">
                    {tx.projectTitle}
                  </span>
                ) : null}
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
