import { EVENT_KINDS, type EventKind } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { fail, type ApiFailure } from "@/lib/api/http";
import type { EventDTO } from "@/types/domain";

type EventRow = {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date;
  allDay: boolean;
  kind: string;
  body: string | null;
  linkUrl: string | null;
  projectId: string | null;
  project: { title: string } | null;
  announcementId: string | null;
  announcement: { title: string; published: boolean } | null;
};

export type EventWriteInput = {
  id?: string;
  title: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  kind: EventKind;
  projectId?: string | null;
  body?: string | null;
  linkUrl?: string | null;
  announcementId?: string | null;
};

type WriteOk<T> = { ok: true; data: T };
export type WriteResult<T> = WriteOk<T> | ApiFailure;

function isPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

function toEventDTO(row: EventRow): EventDTO {
  return {
    id: row.id,
    title: row.title,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    allDay: row.allDay,
    kind: row.kind,
    body: row.body,
    linkUrl: row.linkUrl,
    projectId: row.projectId,
    projectTitle: row.project?.title ?? null,
    announcementId: row.announcementId,
    announcementTitle: row.announcement?.title ?? null,
    announcementPublished: row.announcement?.published === true,
  };
}

export async function saveEvent(
  input: EventWriteInput
): Promise<WriteResult<EventDTO>> {
  if (!(input.kind in EVENT_KINDS)) {
    return fail(
      400,
      "VALIDATION",
      "種別が不正です",
      `kind は ${Object.keys(EVENT_KINDS).join(", ")} のいずれかだよ`
    );
  }
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return fail(
      400,
      "VALIDATION",
      "日時が不正です",
      "startAt / endAt は ISO 8601（例: 2026-08-26T20:00:00+09:00）で送ってね"
    );
  }
  if (endAt < startAt) {
    return fail(400, "VALIDATION", "終了は開始以降にしてください");
  }

  const data = {
    title: input.title,
    startAt,
    endAt,
    allDay: Boolean(input.allDay),
    kind: input.kind,
    projectId: input.projectId || null,
    body: input.body?.trim() || null,
    linkUrl: input.linkUrl || null,
    announcementId: input.announcementId || null,
  };

  try {
    const row = input.id
      ? await prisma.event.update({
          where: { id: input.id },
          data,
          include: { project: true, announcement: true },
        })
      : await prisma.event.create({
          data,
          include: { project: true, announcement: true },
        });
    return { ok: true, data: toEventDTO(row) };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その予定は無いよ", "GET /api/v1/events で id を確認してね");
    }
    if (isPrismaCode(error, "P2003")) {
      return fail(
        400,
        "VALIDATION",
        "企画 id かお知らせ id が不正です",
        "GET /api/v1/projects で企画 id を確認してね。無いときは null にしてね"
      );
    }
    console.error("saveEvent failed", error);
    return fail(500, "INTERNAL", "保存に失敗しました");
  }
}

export async function removeEvent(id: string): Promise<WriteResult<{ id: string }>> {
  try {
    await prisma.event.delete({ where: { id } });
    return { ok: true, data: { id } };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "その予定は無いよ");
    }
    console.error("removeEvent failed", error);
    return fail(500, "INTERNAL", "削除に失敗しました");
  }
}
