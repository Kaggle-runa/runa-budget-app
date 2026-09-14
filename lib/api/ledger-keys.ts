import { createHash } from "node:crypto";
import type { transactionCreateSchema } from "@/lib/api/schemas";
import type { z } from "zod";

export type TransactionCreateInput = z.infer<typeof transactionCreateSchema>;

export function hashTransactionWrite(input: TransactionCreateInput): string {
  const body = {
    date: input.date,
    type: input.type,
    amount: input.amount,
    category: input.category,
    title: input.title,
    memo: input.memo ?? null,
    projectId: input.projectId ?? null,
    source: input.source ?? null,
    sourceEventId: input.sourceEventId ?? null,
  };
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export function readIdempotencyKey(
  request: Request
): { ok: true; key: string | null } | { ok: false; message: string } {
  const raw = request.headers.get("idempotency-key")?.trim() ?? "";
  if (!raw) return { ok: true, key: null };
  if (raw.length > 200) return { ok: false, message: "Idempotency-Key は200文字以内だよ" };
  return { ok: true, key: raw };
}
