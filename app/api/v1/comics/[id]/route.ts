import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { comicPatchSchema, firstZodMessage } from "@/lib/api/schemas";
import { removeComicStrip, saveComicStrip } from "@/lib/comics";
import { getComicStrip } from "@/lib/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const row = await getComicStrip(id);
    if (!row) return jsonError(404, "NOT_FOUND", "その4コマは無いよ");
    return NextResponse.json(row);
  });
}

export async function PATCH(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const current = await getComicStrip(id);
    if (!current) return jsonError(404, "NOT_FOUND", "その4コマは無いよ");
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = comicPatchSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const saved = await saveComicStrip({
      id,
      title: parsed.data.title ?? current.title,
      imageUrl: parsed.data.imageUrl ?? current.imageUrl,
      published: parsed.data.published ?? current.published,
      sortOrder: parsed.data.sortOrder ?? current.sortOrder,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data);
  });
}

export async function DELETE(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const removed = await removeComicStrip(id);
    if (!removed.ok) return failureResponse(removed);
    revalidatePublic();
    return NextResponse.json({ ok: true, id });
  });
}
