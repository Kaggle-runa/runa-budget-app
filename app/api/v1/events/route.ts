import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { eventCreateSchema, firstZodMessage, parseYmdRange } from "@/lib/api/schemas";
import { saveEvent } from "@/lib/events";
import { listEventsOverlapping } from "@/lib/queries";

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const range = parseYmdRange(
      url.searchParams.get("from"),
      url.searchParams.get("to"),
      60
    );
    if (!range.ok) return failureResponse(range);
    const events = await listEventsOverlapping(range.from, range.to);
    return NextResponse.json({ events });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = eventCreateSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const saved = await saveEvent({
      title: parsed.data.title,
      startAt: parsed.data.startAt,
      endAt: parsed.data.endAt,
      allDay: parsed.data.allDay,
      kind: parsed.data.kind,
      projectId: parsed.data.projectId ?? null,
      body: parsed.data.body ?? null,
      linkUrl: parsed.data.linkUrl || null,
      announcementId: parsed.data.announcementId ?? null,
    });
    if (!saved.ok) return failureResponse(saved);
    revalidatePublic();
    return NextResponse.json(saved.data, { status: 201 });
  });
}
