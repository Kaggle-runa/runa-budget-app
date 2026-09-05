"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/categories";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { removeAnnouncement, saveAnnouncement } from "@/lib/announcements";
import { uploadAnnouncementImage } from "@/lib/storage";

const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "タイトルを入力してください").max(80),
  body: z.string().min(1, "本文を入力してください").max(4000),
  category: z.enum(["news", "stream", "other"]),
  publishedAt: z.string().min(1),
  coverUrl: z
    .union([z.literal(""), z.string().url("画像URLの形が不正です")])
    .optional(),
  published: z.enum(["true", "false"]).optional(),
});

export async function upsertAnnouncementAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = announcementSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    body: formData.get("body"),
    category: formData.get("category"),
    publishedAt: formData.get("publishedAt"),
    coverUrl: formData.get("coverUrl") ?? "",
    published: formData.get("published") ? "true" : "false",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }
  if (!(parsed.data.category in ANNOUNCEMENT_CATEGORIES)) {
    return { error: "区分が不正です" };
  }

  const publishedAt = new Date(`${parsed.data.publishedAt}T00:00:00`);
  if (Number.isNaN(publishedAt.getTime())) {
    return { error: "日付が不正です" };
  }

  const file = formData.get("coverFile");
  let coverUrl = parsed.data.coverUrl || null;
  if (file instanceof File && file.size > 0) {
    try {
      coverUrl = await uploadAnnouncementImage(file);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "画像の保存に失敗しました";
      return { error: message };
    }
  }

  const saved = await saveAnnouncement({
    id: parsed.data.id,
    title: parsed.data.title,
    body: parsed.data.body,
    category: parsed.data.category,
    publishedAt: parsed.data.publishedAt,
    coverUrl,
    published: parsed.data.published === "true",
  });
  if (!saved.ok) return { error: saved.message };
  revalidatePublic();
  return {};
}

export async function deleteAnnouncementAction(id: string): Promise<void> {
  await requireAdmin();
  const removed = await removeAnnouncement(id);
  if (!removed.ok) throw new Error(removed.message);
  revalidatePublic();
}
