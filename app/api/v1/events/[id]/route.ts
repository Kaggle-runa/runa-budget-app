import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { eventKindSchema, eventPatchSchema, firstZodMessage } from "@/lib/api/schemas";
import { removeEvent, saveEvent } from "@/lib/events";
import { getEvent } from "@/lib/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const row = await getEvent(id);
    if (!row) return jsonError(404, "NOT_FOUND", "その予定は無いよ");
    return NextResponse.json(row);
  });
}

export async function PATCH(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const current = await getEvent(id);
    if (!current) return jsonError(404, "NOT_FOUND", "その予定は無いよ");
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = eventPatchSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const kindParsed = eventKindSchema.safeParse(parsed.data.kind ?? current.kind);
    if (!kindParsed.success) {
      return jsonError(400, "VALIDATION", "種別が不正です");
    }
    const saved = await saveEvent({
      id,
      title: parsed.data.title ?? current.title,
      startAt: parsed.data.startAt ?? current.startAt,
      endAt: parsed.data.endAt ?? current.endAt,
      allDay: parsed.data.allDay ?? current.allDay,
      kind: kindParsed.data,
      projectId:
        parsed.data.projectId === undefined ? current.projectId : parsed.data.projectId,
      body: parsed.data.body === undefined ? current.body : parsed.data.body,
      linkUrl: parsed.data.linkUrl === undefined ? current.linkUrl : parsed.data.linkUrl,
      announcementId:
        parsed.data.announcementId === undefined
          ? current.announcementId
          : parsed.data.announcementId,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data);
  });
}

export async function DELETE(request: Request, context: Ctx) {
  return handleApi(request, async () => {
    const { id } = await context.params;
    const removed = await removeEvent(id);
    if (!removed.ok) return failureResponse(removed);
    revalidatePublic();
    return NextResponse.json({ ok: true, id });
  });
}
