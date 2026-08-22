"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { categoriesForType } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { balanceSheet, toTransactionDTO } from "@/lib/finance";
import type { TransactionDTO, TxType } from "@/types/domain";

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

function assertCategory(type: TxType, category: string) {
  const allowed = Object.keys(categoriesForType(type));
  if (!allowed.includes(category)) {
    throw new Error("カテゴリが不正です");
  }
}

async function loadSheetRows(): Promise<TransactionDTO[]> {
  const rows = await prisma.transaction.findMany({
    include: { project: true },
  });
  return rows.map(toTransactionDTO);
}

function solvencyError(transactions: TransactionDTO[]): string | null {
  const sheet = balanceSheet(transactions);
  if (sheet.cash < 0) {
    return "現金が不足するため、この内容では保存できません";
  }
  if (sheet.loan < 0) {
    return "借入残高を超える返済は登録できません";
  }
  return null;
}

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

  try {
    assertCategory(parsed.data.type, parsed.data.category);
    const nextRow: TransactionDTO = {
      id: parsed.data.id ?? "preview",
      date: parsed.data.date,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      title: parsed.data.title,
      memo: parsed.data.memo || null,
      projectId: parsed.data.projectId || null,
      projectTitle: null,
    };
    const current = await loadSheetRows();
    const next = parsed.data.id
      ? current.map((row) => (row.id === parsed.data.id ? nextRow : row))
      : [...current, nextRow];
    const blocked = solvencyError(next);
    if (blocked) return { error: blocked };

    const data = {
      date: new Date(`${parsed.data.date}T00:00:00`),
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      title: parsed.data.title,
      memo: parsed.data.memo || null,
      projectId: parsed.data.projectId || null,
    };
    if (parsed.data.id) {
      await prisma.transaction.update({
        where: { id: parsed.data.id },
        data,
      });
    } else {
      await prisma.transaction.create({ data });
    }
    revalidatePublic();
    return {};
  } catch (error) {
    console.error("upsertTransactionAction failed", error);
    return { error: "保存に失敗しました" };
  }
}

export async function deleteTransactionAction(id: string): Promise<void> {
  await requireAdmin();
  const current = await loadSheetRows();
  const next = current.filter((row) => row.id !== id);
  const blocked = solvencyError(next);
  if (blocked) {
    throw new Error(blocked);
  }
  await prisma.transaction.delete({ where: { id } });
  revalidatePublic();
}
