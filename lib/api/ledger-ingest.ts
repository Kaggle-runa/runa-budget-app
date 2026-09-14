import { prisma } from "@/lib/db";
import { toTransactionDTO } from "@/lib/finance";
import { saveTransaction } from "@/lib/transactions";
import type { TransactionDTO } from "@/types/domain";
import { fail, type ApiFailure } from "@/lib/api/http";
import {
  hashTransactionWrite,
  readIdempotencyKey,
  type TransactionCreateInput,
} from "@/lib/api/ledger-keys";

export { hashTransactionWrite, readIdempotencyKey };
export type { TransactionCreateInput };

type Replay = { created: boolean; data: TransactionDTO };

export async function createOrReplayTransaction(input: {
  write: TransactionCreateInput;
  tokenHash: string;
  idempotencyKey: string | null;
}): Promise<{ ok: true; result: Replay } | ApiFailure> {
  const requestHash = hashTransactionWrite(input.write);
  if (input.idempotencyKey) {
    const hit = await prisma.apiIdempotency.findUnique({
      where: { key_tokenHash: { key: input.idempotencyKey, tokenHash: input.tokenHash } },
    });
    if (hit) {
      if (hit.requestHash !== requestHash) {
        return fail(
          422,
          "CONFLICT",
          "同じ Idempotency-Key で中身が違うよ",
          "1回目の本文を正とする。キーを変えるか、同じ本文でもう一度送ってね"
        );
      }
      const row = await prisma.transaction.findUnique({
        where: { id: hit.transactionId },
        include: { project: true },
      });
      if (row) return { ok: true, result: { created: false, data: toTransactionDTO(row) } };
    }
  }

  const source = input.write.source ?? null;
  const sourceEventId = input.write.sourceEventId ?? null;
  if (source && sourceEventId) {
    const existing = await prisma.transaction.findFirst({
      where: { source, sourceEventId },
      include: { project: true },
    });
    if (existing) {
      const remembered = await rememberIdempotency({
        key: input.idempotencyKey,
        tokenHash: input.tokenHash,
        requestHash,
        transactionId: existing.id,
      });
      if (!remembered.ok) return remembered;
      return { ok: true, result: { created: false, data: toTransactionDTO(existing) } };
    }
  }

  const saved = await saveTransaction({
    date: input.write.date,
    type: input.write.type,
    amount: input.write.amount,
    category: input.write.category,
    title: input.write.title,
    memo: input.write.memo ?? null,
    projectId: input.write.projectId ?? null,
    source,
    sourceEventId,
  });
  if (!saved.ok) {
    if (saved.code === "CONFLICT" && source && sourceEventId) {
      const existing = await prisma.transaction.findFirst({
        where: { source, sourceEventId },
        include: { project: true },
      });
      if (existing) {
        await rememberIdempotency({
          key: input.idempotencyKey,
          tokenHash: input.tokenHash,
          requestHash,
          transactionId: existing.id,
        });
        return { ok: true, result: { created: false, data: toTransactionDTO(existing) } };
      }
    }
    return saved;
  }

  const remembered = await rememberIdempotency({
    key: input.idempotencyKey,
    tokenHash: input.tokenHash,
    requestHash,
    transactionId: saved.data.id,
  });
  if (!remembered.ok) return remembered;
  return { ok: true, result: { created: true, data: saved.data } };
}

async function rememberIdempotency(input: {
  key: string | null;
  tokenHash: string;
  requestHash: string;
  transactionId: string;
}): Promise<{ ok: true } | ApiFailure> {
  if (!input.key) return { ok: true };
  try {
    await prisma.apiIdempotency.create({
      data: {
        key: input.key,
        tokenHash: input.tokenHash,
        requestHash: input.requestHash,
        transactionId: input.transactionId,
      },
    });
    return { ok: true };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      const hit = await prisma.apiIdempotency.findUnique({
        where: { key_tokenHash: { key: input.key, tokenHash: input.tokenHash } },
      });
      if (hit && hit.requestHash !== input.requestHash) {
        return fail(422, "CONFLICT", "同じ Idempotency-Key で中身が違うよ");
      }
      return { ok: true };
    }
    console.error("rememberIdempotency failed", error);
    return fail(500, "INTERNAL", "保存に失敗しました");
  }
}
