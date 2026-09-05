import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { firstZodMessage, ideaPatchSchema, ideaStatusSchema } from "@/lib/api/schemas";
import { removeIdea, saveIdea } from "@/lib/ideas";
import { getIdea } from "@/lib/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const row = await getIdea(id);
    if (!row) return jsonError(404, "NOT_FOUND", "その企画は無いよ");
    return NextResponse.json(row);
  });
}

export async function PATCH(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const current = await getIdea(id);
    if (!current) return jsonError(404, "NOT_FOUND", "その企画は無いよ");
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = ideaPatchSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const statusParsed = ideaStatusSchema.safeParse(
      parsed.data.status ?? current.status
    );
    if (!statusParsed.success) {
      return jsonError(400, "VALIDATION", "ステータスが不正です");
    }
    const saved = await saveIdea({
      id,
      displayName:
        parsed.data.displayName === undefined
          ? current.displayName
          : parsed.data.displayName ?? "匿名",
      title: parsed.data.title ?? current.title,
      body: parsed.data.body ?? current.body,
      status: statusParsed.data,
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
    const removed = await removeIdea(id);
    if (!removed.ok) return failureResponse(removed);
    revalidatePublic();
    return NextResponse.json({ ok: true, id });
  });
}
