import { categoriesForType } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { fail, type ApiFailure } from "@/lib/api/http";
import { balanceSheet, toTransactionDTO } from "@/lib/finance";
import type { TransactionDTO, TxType } from "@/types/domain";

export type TransactionWriteInput = {
  id?: string;
  date: string;
  type: TxType;
  amount: number;
  category: string;
  title: string;
  memo?: string | null;
  projectId?: string | null;
};

type WriteOk<T> = { ok: true; data: T };
export type WriteResult<T> = WriteOk<T> | ApiFailure;

function isPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

async function loadSheetRows(): Promise<TransactionDTO[]> {
  const rows = await prisma.transaction.findMany({
    include: { project: true },
  });
  return rows.map(toTransactionDTO);
}

export function solvencyError(transactions: TransactionDTO[]): string | null {
  const sheet = balanceSheet(transactions);
  if (sheet.cash < 0) {
    return "現金が不足するため、この内容では保存できません";
  }
  if (sheet.loan < 0) {
    return "借入残高を超える返済は登録できません";
  }
  return null;
}

export function categoryHint(type: TxType): string {
  const allowed = Object.keys(categoriesForType(type));
  return `${type} で使える category は ${allowed.join(", ")} だよ`;
}

export function assertCategory(
  type: TxType,
  category: string
): ApiFailure | null {
  const allowed = Object.keys(categoriesForType(type));
  if (!allowed.includes(category)) {
    return fail(400, "VALIDATION", "カテゴリが不正です", categoryHint(type));
  }
  return null;
}

export async function saveTransaction(
  input: TransactionWriteInput
): Promise<WriteResult<TransactionDTO>> {
  const categoryError = assertCategory(input.type, input.category);
  if (categoryError) return categoryError;

  const nextRow: TransactionDTO = {
    id: input.id ?? "preview",
    date: input.date,
    type: input.type,
    amount: input.amount,
    category: input.category,
    title: input.title,
    memo: input.memo || null,
    projectId: input.projectId || null,
    projectTitle: null,
  };
  const current = await loadSheetRows();
  if (input.id && !current.some((row) => row.id === input.id)) {
    return fail(404, "NOT_FOUND", "その明細は無いよ", "GET /api/v1/transactions で id を確認してね");
  }
  const next = input.id
    ? current.map((row) => (row.id === input.id ? nextRow : row))
    : [...current, nextRow];
  const blocked = solvencyError(next);
  if (blocked) {
    return fail(422, "SOLVENCY", blocked, "金額・区分を見直すか、先に収入や借入を登録してね");
  }

  const data = {
    date: new Date(`${input.date}T00:00:00`),
    type: input.type,
    amount: input.amount,
    category: input.category,
    title: input.title,
    memo: input.memo || null,
    projectId: input.projectId || null,
  };

  try {
    const row = input.id
      ? await prisma.transaction.update({
          where: { id: input.id },
          data,
          include: { project: true },
        })
      : await prisma.transaction.create({
          data,
          include: { project: true },
        });
    return { ok: true, data: toTransactionDTO(row) };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その明細は無いよ");
    }
    if (isPrismaCode(error, "P2003")) {
      return fail(
        400,
        "VALIDATION",
        "企画 id が不正です",
        "GET /api/v1/projects で id を確認してね。無いときは null にしてね"
      );
    }
    console.error("saveTransaction failed", error);
    return fail(500, "INTERNAL", "保存に失敗しました");
  }
}

export async function removeTransaction(id: string): Promise<WriteResult<{ id: string }>> {
  const current = await loadSheetRows();
  if (!current.some((row) => row.id === id)) {
    return fail(404, "NOT_FOUND", "その明細は無いよ");
  }
  const next = current.filter((row) => row.id !== id);
  const blocked = solvencyError(next);
  if (blocked) {
    return fail(422, "SOLVENCY", blocked, "この明細を消すと現金か借入残高が壊れるよ");
  }
  try {
    await prisma.transaction.delete({ where: { id } });
    return { ok: true, data: { id } };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その明細は無いよ");
    }
    console.error("removeTransaction failed", error);
    return fail(500, "INTERNAL", "削除に失敗しました");
  }
}
