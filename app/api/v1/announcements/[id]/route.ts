import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { removeAnnouncement, saveAnnouncement } from "@/lib/announcements";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import {
  announcementCategorySchema,
  announcementPatchSchema,
  firstZodMessage,
} from "@/lib/api/schemas";
import { dateKey } from "@/lib/finance";
import { getAnnouncement } from "@/lib/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const row = await getAnnouncement(id);
    if (!row) return jsonError(404, "NOT_FOUND", "そのお知らせは無いよ");
    return NextResponse.json(row);
  });
}

export async function PATCH(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const current = await getAnnouncement(id);
    if (!current) return jsonError(404, "NOT_FOUND", "そのお知らせは無いよ");
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = announcementPatchSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const categoryParsed = announcementCategorySchema.safeParse(
      parsed.data.category ?? current.category
    );
    if (!categoryParsed.success) {
      return jsonError(400, "VALIDATION", "区分が不正です");
    }
    const saved = await saveAnnouncement({
      id,
      title: parsed.data.title ?? current.title,
      body: parsed.data.body ?? current.body,
      category: categoryParsed.data,
      publishedAt: parsed.data.publishedAt ?? dateKey(current.publishedAt),
      coverUrl:
        parsed.data.coverUrl === undefined ? current.coverUrl : parsed.data.coverUrl,
      published: parsed.data.published ?? current.published,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data);
  });
}

export async function DELETE(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const removed = await removeAnnouncement(id);
    if (!removed.ok) return failureResponse(removed);
    revalidatePublic();
    return NextResponse.json({ ok: true, id });
  });
}
