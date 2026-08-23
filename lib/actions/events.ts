"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { EVENT_KINDS } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/actions/revalidate";

const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "タイトルを入力してください").max(80),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  allDay: z.enum(["true", "false"]).optional(),
  kind: z.enum(["stream", "release", "project", "other"]),
  projectId: z.string().optional().or(z.literal("")),
  body: z.string().max(4000).optional().or(z.literal("")),
  linkUrl: z
    .union([z.literal(""), z.string().url("リンクの形が不正です")])
    .optional(),
  announcementId: z.string().optional().or(z.literal("")),
});

export async function upsertEventAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = eventSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    allDay: formData.get("allDay") ? "true" : "false",
    kind: formData.get("kind"),
    projectId: formData.get("projectId") ?? "",
    body: formData.get("body") ?? "",
    linkUrl: formData.get("linkUrl") ?? "",
    announcementId: formData.get("announcementId") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  if (!(parsed.data.kind in EVENT_KINDS)) {
    return { error: "種別が不正です" };
  }

  const allDay = parsed.data.allDay === "true";
  const startAt = new Date(parsed.data.startAt);
  const endAt = new Date(parsed.data.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { error: "日時が不正です" };
  }
  if (endAt < startAt) {
    return { error: "終了は開始以降にしてください" };
  }

  try {
    const data = {
      title: parsed.data.title,
      startAt,
      endAt,
      allDay,
      kind: parsed.data.kind,
      projectId: parsed.data.projectId || null,
      body: parsed.data.body?.trim() || null,
      linkUrl: parsed.data.linkUrl || null,
      announcementId: parsed.data.announcementId || null,
    };
    if (parsed.data.id) {
      await prisma.event.update({ where: { id: parsed.data.id }, data });
    } else {
      await prisma.event.create({ data });
    }
    revalidatePublic();
    return {};
  } catch (error) {
    console.error("upsertEventAction failed", error);
    return { error: "保存に失敗しました" };
  }
}

export async function deleteEventAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.event.delete({ where: { id } });
  revalidatePublic();
}
