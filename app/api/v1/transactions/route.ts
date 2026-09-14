import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { readBearerToken, tokenFingerprint } from "@/lib/api/auth";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { createOrReplayTransaction, readIdempotencyKey } from "@/lib/api/ledger-ingest";
import {
  firstZodMessage,
  parseOptionalTxType,
  parseYmdRange,
  transactionCreateSchema,
} from "@/lib/api/schemas";
import { listTransactionsFiltered } from "@/lib/queries";

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
    const idem = readIdempotencyKey(request);
    if (!idem.ok) return jsonError(400, "VALIDATION", idem.message);
    const bearer = readBearerToken(request);
    if (!bearer) {
      return jsonError(401, "UNAUTHORIZED", "認証できないよ");
    }
    const saved = await createOrReplayTransaction({
      write: parsed.data,
      tokenHash: tokenFingerprint(bearer),
      idempotencyKey: idem.key,
    });
    if (!saved.ok) return failureResponse(saved);
    if (saved.result.created) revalidatePublic();
    return NextResponse.json(saved.result.data, { status: saved.result.created ? 201 : 200 });
  });
}
