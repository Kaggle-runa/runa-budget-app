import { ANNOUNCEMENT_CATEGORIES, type AnnouncementCategory } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { fail, type ApiFailure } from "@/lib/api/http";
import type { AnnouncementDTO } from "@/types/domain";

export type AnnouncementWriteInput = {
  id?: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  publishedAt: string;
  coverUrl?: string | null;
  published?: boolean;
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

function toAnnouncementDTO(row: {
  id: string;
  title: string;
  body: string;
  category: string;
  publishedAt: Date;
  coverUrl: string | null;
  published: boolean;
}): AnnouncementDTO {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    publishedAt: row.publishedAt.toISOString(),
    coverUrl: row.coverUrl,
    published: row.published,
  };
}

function parsePublishedAt(value: string): { ok: true; date: Date } | ApiFailure {
  const trimmed = value.trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? new Date(`${trimmed}T00:00:00`)
    : new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return fail(400, "VALIDATION", "日付が不正です", "publishedAt は yyyy-MM-dd だよ");
  }
  return { ok: true, date };
}

export async function saveAnnouncement(
  input: AnnouncementWriteInput
): Promise<WriteResult<AnnouncementDTO>> {
  if (!(input.category in ANNOUNCEMENT_CATEGORIES)) {
    return fail(
      400,
      "VALIDATION",
      "区分が不正です",
      `category は ${Object.keys(ANNOUNCEMENT_CATEGORIES).join(", ")} のいずれかだよ`
    );
  }
  const publishedAt = parsePublishedAt(input.publishedAt);
  if (!publishedAt.ok) return publishedAt;

  const data = {
    title: input.title,
    body: input.body,
    category: input.category,
    publishedAt: publishedAt.date,
    coverUrl: input.coverUrl?.trim() || null,
    published: input.published ?? true,
  };

  try {
    const row = input.id
      ? await prisma.announcement.update({ where: { id: input.id }, data })
      : await prisma.announcement.create({ data });
    return { ok: true, data: toAnnouncementDTO(row) };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "そのお知らせは無いよ");
    }
    console.error("saveAnnouncement failed", error);
    return fail(500, "INTERNAL", "保存に失敗しました");
  }
}

export async function removeAnnouncement(
  id: string
): Promise<WriteResult<{ id: string }>> {
  const linked = await prisma.event.count({ where: { announcementId: id } });
  if (linked > 0) {
    return fail(
      422,
      "CONFLICT",
      "予定が付いているお知らせは削除できないよ",
      "先に予定の announcementId を外してね"
    );
  }
  try {
    await prisma.announcement.delete({ where: { id } });
    return { ok: true, data: { id } };
  } catch (error) {
    if (isPrismaCode(error, "P2025")) {
      return fail(404, "NOT_FOUND", "そのお知らせは無いよ");
    }
    console.error("removeAnnouncement failed", error);
    return fail(500, "INTERNAL", "削除に失敗しました");
  }
}
