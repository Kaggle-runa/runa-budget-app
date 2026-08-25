import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import {
  firstZodMessage,
  parseOptionalTxType,
  parseYmdRange,
  transactionCreateSchema,
} from "@/lib/api/schemas";
import { listTransactionsFiltered } from "@/lib/queries";
import { saveTransaction } from "@/lib/transactions";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const range = parseYmdRange(
      url.searchParams.get("from"),
      url.searchParams.get("to"),
      90
    );
    if (!range.ok) return failureResponse(range);
    const typeParsed = parseOptionalTxType(url.searchParams.get("type"));
    if (!typeParsed.ok) return failureResponse(typeParsed.error);
    const transactions = await listTransactionsFiltered({
      from: range.from,
      to: range.to,
      type: typeParsed.type,
    });
    return NextResponse.json({ transactions });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = transactionCreateSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const saved = await saveTransaction({
      date: parsed.data.date,
      type: parsed.data.type,
      amount: parsed.data.amount,
      category: parsed.data.category,
      title: parsed.data.title,
      memo: parsed.data.memo ?? null,
      projectId: parsed.data.projectId ?? null,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data, { status: 201 });
  });
}
