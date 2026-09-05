"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { removeComicStrip, saveComicStrip } from "@/lib/comics";
import { uploadPublicImage } from "@/lib/storage";

const stripSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "タイトルを入力してください").max(80),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.enum(["true", "false"]).optional(),
  imageUrl: z.string().optional(),
});

export async function upsertComicStripAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = stripSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    sortOrder: formData.get("sortOrder") || 0,
    published: formData.get("published") ? "true" : "false",
    imageUrl: formData.get("imageUrl") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  try {
    const file = formData.get("imageFile");
    let imageUrl = parsed.data.imageUrl?.trim() || "";
    if (file instanceof File && file.size > 0) {
      imageUrl = await uploadPublicImage(file, "yonkoma");
    }
    if (!imageUrl) {
      return { error: "4コマ1枚の画像が必要です" };
    }

    const saved = await saveComicStrip({
      id: parsed.data.id,
      title: parsed.data.title,
      sortOrder: parsed.data.sortOrder,
      published: parsed.data.published === "true",
      imageUrl,
    });
    if (!saved.ok) return { error: saved.message };
    revalidatePublic();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "保存に失敗しました";
    console.error("upsertComicStripAction failed", error);
    return { error: message };
  }
  redirect("/admin/yonkoma");
}

export async function deleteComicStripAction(id: string): Promise<void> {
  await requireAdmin();
  const removed = await removeComicStrip(id);
  if (!removed.ok) throw new Error(removed.message);
  revalidatePublic();
}
