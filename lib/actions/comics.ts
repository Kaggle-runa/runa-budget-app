"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { uploadPublicImage } from "@/lib/storage";

const stripSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "タイトルを入力してください").max(80),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  published: z.enum(["true", "false"]).optional(),
  panel1Url: z.string().optional(),
  panel2Url: z.string().optional(),
  panel3Url: z.string().optional(),
  panel4Url: z.string().optional(),
});

async function resolvePanel(
  file: FormDataEntryValue | null,
  current?: string
): Promise<string | null> {
  if (file instanceof File && file.size > 0) {
    return uploadPublicImage(file, "yonkoma");
  }
  return current?.trim() ? current.trim() : null;
}

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
    panel1Url: formData.get("panel1Url") || undefined,
    panel2Url: formData.get("panel2Url") || undefined,
    panel3Url: formData.get("panel3Url") || undefined,
    panel4Url: formData.get("panel4Url") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  try {
    const [panel1Url, panel2Url, panel3Url, panel4Url] = await Promise.all([
      resolvePanel(formData.get("panel1File"), parsed.data.panel1Url),
      resolvePanel(formData.get("panel2File"), parsed.data.panel2Url),
      resolvePanel(formData.get("panel3File"), parsed.data.panel3Url),
      resolvePanel(formData.get("panel4File"), parsed.data.panel4Url),
    ]);
    if (!panel1Url || !panel2Url || !panel3Url || !panel4Url) {
      return { error: "4コマすべての画像が必要です" };
    }

    const data = {
      title: parsed.data.title,
      sortOrder: parsed.data.sortOrder,
      published: parsed.data.published === "true",
      panel1Url,
      panel2Url,
      panel3Url,
      panel4Url,
    };
    if (parsed.data.id) {
      await prisma.comicStrip.update({ where: { id: parsed.data.id }, data });
    } else {
      await prisma.comicStrip.create({ data });
    }
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
  await prisma.comicStrip.delete({ where: { id } });
  revalidatePublic();
}
