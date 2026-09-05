"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { IDEA_STATUSES } from "@/lib/categories";
import { prisma } from "@/lib/db";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { removeIdea, saveIdea } from "@/lib/ideas";
import { getIdea } from "@/lib/queries";

const ideaSchema = z.object({
  displayName: z.string().max(40).optional().or(z.literal("")),
  title: z.string().min(1, "タイトルを書いてね").max(80),
  body: z.string().min(10, "企画の内容を10文字以上で書いてね").max(1000),
  website: z.string().optional().or(z.literal("")),
});

const recentByIp = new Map<string, number>();
const RATE_LIMIT_MS = 30_000;

async function clientIp(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerStore.get("x-real-ip") ||
    "unknown"
  );
}

export async function submitIdeaAction(
  _prev: { error?: string; ok?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const parsed = ideaSchema.safeParse({
    displayName: formData.get("displayName") ?? "",
    title: formData.get("title"),
    body: formData.get("body"),
    website: formData.get("website") ?? "",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力がちょっと変かも" };
  }

  if (parsed.data.website) {
    return { ok: true };
  }

  const ip = await clientIp();
  const last = recentByIp.get(ip) ?? 0;
  if (Date.now() - last < RATE_LIMIT_MS) {
    return { error: "ちょっと待ってから、もういっかい送ってね" };
  }

  await prisma.idea.create({
    data: {
      displayName: parsed.data.displayName || "匿名",
      title: parsed.data.title,
      body: parsed.data.body,
      status: "submitted",
    },
  });
  recentByIp.set(ip, Date.now());
  revalidatePublic();
  return { ok: true };
}

const statusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["submitted", "reviewing", "adopted", "in_progress", "done"]),
  projectId: z.string().optional().or(z.literal("")),
});

export async function updateIdeaStatusAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    projectId: formData.get("projectId") ?? "",
  });
  if (!parsed.success) {
    throw new Error("ステータスが不正です");
  }
  if (!(parsed.data.status in IDEA_STATUSES)) {
    throw new Error("ステータスが不正です");
  }

  const current = await getIdea(parsed.data.id);
  if (!current) {
    throw new Error("その企画は無いよ");
  }

  const saved = await saveIdea({
    id: parsed.data.id,
    displayName: current.displayName,
    title: current.title,
    body: current.body,
    status: parsed.data.status,
    projectId: parsed.data.projectId || null,
  });
  if (!saved.ok) throw new Error(saved.message);
  revalidatePublic();
}

export async function deleteIdeaAction(id: string): Promise<void> {
  await requireAdmin();
  const removed = await removeIdea(id);
  if (!removed.ok) throw new Error(removed.message);
  revalidatePublic();
}
