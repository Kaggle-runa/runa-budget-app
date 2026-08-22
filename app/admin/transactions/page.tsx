import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { DeleteButton } from "@/components/admin/delete-button";
import { TransactionForm } from "@/components/admin/transaction-form";
import { GlassCard } from "@/components/layout/glass-card";
import { categoryLabel, txTypeLabel } from "@/lib/categories";
import { signedLedgerAmount } from "@/lib/finance";
import { formatDateDot, formatSignedYen } from "@/lib/format";
import { deleteTransactionAction } from "@/lib/actions/transactions";
import { listProjects, listTransactions } from "@/lib/queries";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const [transactions, projects] = await Promise.all([
    listTransactions(),
    listProjects(),
  ]);
  const editing = transactions.find((tx) => tx.id === id);

  return (
    <>
      <AdminNav currentPath="/admin/transactions" />
      <h1 className="mb-4 text-2xl font-bold text-secondary">取引の登録</h1>
      <GlassCard className="mb-6 p-5">
        {editing ? (
          <p className="mb-3 text-sm">
            編集中: {editing.title}{" "}
            <Link href="/admin/transactions" className="text-secondary underline">
              新規に戻る
            </Link>
          </p>
        ) : null}
        <TransactionForm projects={projects} initial={editing} />
      </GlassCard>
      <GlassCard className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-sky-50/80 text-left">
            <tr>
              <th className="px-4 py-3">日付</th>
              <th className="px-4 py-3">摘要</th>
              <th className="px-4 py-3">科目</th>
              <th className="px-4 py-3 text-right">金額（円）</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-pink-100">
                <td className="px-4 py-3">
                  {formatDateDot(new Date(`${tx.date}T00:00:00`))}
                </td>
                <td className="px-4 py-3">{tx.title}</td>
                <td className="px-4 py-3">
                  {categoryLabel(tx.category)}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {txTypeLabel(tx.type)}
                  </span>
                </td>
                <td
                  className={
                    tx.type === "income"
                      ? "px-4 py-3 text-right text-accent"
                      : tx.type === "expense"
                        ? "px-4 py-3 text-right text-rose-600"
                        : "px-4 py-3 text-right text-zinc-600"
                  }
                >
                  {formatSignedYen(signedLedgerAmount(tx))}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/transactions?id=${tx.id}`}
                      className="text-secondary underline"
                    >
                      編集
                    </Link>
                    <DeleteButton action={deleteTransactionAction} id={tx.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </>
  );
}
