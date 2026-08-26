"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import {
  NUMERAI_CACHE_TAG,
  getNmrQuote,
  getNumeraiSnapshot,
} from "@/lib/numerai";

export async function refreshNumeraiAction(): Promise<{
  error?: string;
  ok?: boolean;
  fetchedAt?: string | null;
}> {
  await requireAdmin();
  revalidateTag(NUMERAI_CACHE_TAG);
  const [snapshot] = await Promise.all([getNumeraiSnapshot(), getNmrQuote()]);
  revalidatePath("/");
  revalidatePath("/dashboard");
  revalidatePath("/numerai");
  revalidatePath("/admin/numerai");
  if (!snapshot.ok) {
    return { error: "Numeraiから取得できませんでした。時間をおいて再試行してください。" };
  }
  return { ok: true, fetchedAt: snapshot.fetchedAt };
}
