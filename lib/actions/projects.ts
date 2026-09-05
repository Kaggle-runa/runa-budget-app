"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { PROJECT_STATUSES } from "@/lib/categories";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { parseProjectLinks } from "@/lib/project-links";
import { removeProject, saveProject } from "@/lib/projects";

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

  const saved = await saveProject({
    id: parsed.data.id,
    title: parsed.data.title,
    status: parsed.data.status,
    masterNote: parsed.data.masterNote?.trim() || null,
    overview: parsed.data.overview?.trim() || null,
    links,
  });
  if (!saved.ok) return { error: saved.message };
  revalidatePublic();
  return {};
}

export async function deleteProjectAction(id: string): Promise<void> {
  await requireAdmin();
  const removed = await removeProject(id);
  if (!removed.ok) throw new Error(removed.message);
  revalidatePublic();
}
