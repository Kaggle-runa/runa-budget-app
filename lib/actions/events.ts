"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { removeEvent, saveEvent } from "@/lib/events";

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

  const saved = await saveEvent({
    id: parsed.data.id,
    title: parsed.data.title,
    startAt: parsed.data.startAt,
    endAt: parsed.data.endAt,
    allDay: parsed.data.allDay === "true",
    kind: parsed.data.kind,
    projectId: parsed.data.projectId || null,
    body: parsed.data.body || null,
    linkUrl: parsed.data.linkUrl || null,
    announcementId: parsed.data.announcementId || null,
  });
  if (!saved.ok) return { error: saved.message };
  revalidatePublic();
  return {};
}

export async function deleteEventAction(id: string): Promise<void> {
  await requireAdmin();
  const removed = await removeEvent(id);
  if (!removed.ok) {
    throw new Error(removed.message);
  }
  revalidatePublic();
}
