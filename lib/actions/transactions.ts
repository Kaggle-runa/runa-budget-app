"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { removeTransaction, saveTransaction } from "@/lib/transactions";
import type { TxType } from "@/types/domain";

const transactionSchema = z.object({
  id: z.string().optional(),
  date: z.string().min(1),
  type: z.enum(["income", "expense", "loan", "repay", "capex"]),
  amount: z.coerce.number().int().positive("金額は1円以上にしてください"),
  category: z.string().min(1),
  title: z.string().min(1, "項目名を入力してください").max(80),
  memo: z.string().max(400).optional().or(z.literal("")),
  projectId: z.string().optional().or(z.literal("")),
});

export async function upsertTransactionAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = transactionSchema.safeParse({
    id: formData.get("id") || undefined,
    date: formData.get("date"),
    type: formData.get("type"),
    amount: formData.get("amount"),
    category: formData.get("category"),
    title: formData.get("title"),
    memo: formData.get("memo") ?? "",
    projectId: formData.get("projectId") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  const saved = await saveTransaction({
    id: parsed.data.id,
    date: parsed.data.date,
    type: parsed.data.type as TxType,
    amount: parsed.data.amount,
    category: parsed.data.category,
    title: parsed.data.title,
    memo: parsed.data.memo || null,
    projectId: parsed.data.projectId || null,
  });
  if (!saved.ok) return { error: saved.message };
  revalidatePublic();
  return {};
}

export async function deleteTransactionAction(id: string): Promise<void> {
  await requireAdmin();
  const removed = await removeTransaction(id);
  if (!removed.ok) {
    throw new Error(removed.message);
  }
  revalidatePublic();
}
