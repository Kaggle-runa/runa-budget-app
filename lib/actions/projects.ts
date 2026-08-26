"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { PROJECT_STATUSES } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { parseProjectLinks } from "@/lib/project-links";

const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "タイトルを入力してください").max(80),
  status: z.enum(["planned", "active", "completed"]),
  masterNote: z.string().max(500).optional().or(z.literal("")),
  overview: z.string().max(400).optional().or(z.literal("")),
  linksJson: z.string().optional().or(z.literal("")),
});

export async function upsertProjectAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = projectSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    status: formData.get("status"),
    masterNote: formData.get("masterNote") ?? "",
    overview: formData.get("overview") ?? "",
    linksJson: formData.get("linksJson") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }
  if (!(parsed.data.status in PROJECT_STATUSES)) {
    return { error: "ステータスが不正です" };
  }

  let linksRaw: unknown = [];
  if (parsed.data.linksJson) {
    try {
      linksRaw = JSON.parse(parsed.data.linksJson) as unknown;
    } catch {
      return { error: "リンクの形が不正です" };
    }
  }
  const links = parseProjectLinks(linksRaw);

  const data = {
    title: parsed.data.title,
    status: parsed.data.status,
    masterNote: parsed.data.masterNote?.trim() || null,
    overview: parsed.data.overview?.trim() || null,
    links,
  };

  if (parsed.data.id) {
    await prisma.project.update({
      where: { id: parsed.data.id },
      data,
    });
  } else {
    await prisma.project.create({ data });
  }
  revalidatePublic();
  return {};
}

export async function deleteProjectAction(id: string): Promise<void> {
  await requireAdmin();
  const [tx, event, idea] = await Promise.all([
    prisma.transaction.count({ where: { projectId: id } }),
    prisma.event.count({ where: { projectId: id } }),
    prisma.idea.count({ where: { projectId: id } }),
  ]);
  if (tx + event + idea > 0) {
    throw new Error("明細・予定・募集案が付いている挑戦は削除できません");
  }
  await prisma.project.delete({ where: { id } });
  revalidatePublic();
}
