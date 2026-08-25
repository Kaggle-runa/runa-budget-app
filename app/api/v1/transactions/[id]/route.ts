import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { firstZodMessage, transactionPatchSchema } from "@/lib/api/schemas";
import { getTransaction } from "@/lib/queries";
import { removeTransaction, saveTransaction } from "@/lib/transactions";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const row = await getTransaction(id);
    if (!row) return jsonError(404, "NOT_FOUND", "その明細は無いよ");
    return NextResponse.json(row);
  });
}

export async function PATCH(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const current = await getTransaction(id);
    if (!current) return jsonError(404, "NOT_FOUND", "その明細は無いよ");
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = transactionPatchSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const saved = await saveTransaction({
      id,
      date: parsed.data.date ?? current.date,
      type: parsed.data.type ?? current.type,
      amount: parsed.data.amount ?? current.amount,
      category: parsed.data.category ?? current.category,
      title: parsed.data.title ?? current.title,
      memo: parsed.data.memo === undefined ? current.memo : parsed.data.memo,
      projectId:
        parsed.data.projectId === undefined ? current.projectId : parsed.data.projectId,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data);
  });
}

export async function DELETE(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const removed = await removeTransaction(id);
    if (!removed.ok) return failureResponse(removed);
    revalidatePublic();
    return NextResponse.json({ ok: true, id });
  });
}
