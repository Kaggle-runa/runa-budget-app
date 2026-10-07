"use server";

import { requireAdmin } from "@/lib/auth/session";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { decodeCsvBytes, parseKyoteiCsv } from "@/lib/races/csv";
import { ingestRaceTickets } from "@/lib/races/ingest";

const MAX_CSV_BYTES = 2_000_000;

export async function importKyoteiCsvAction(
  _prev: { error?: string; message?: string },
  formData: FormData
): Promise<{ error?: string; message?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "CSVファイルを選んでください" };
  }
  if (file.size > MAX_CSV_BYTES) {
    return { error: "CSVが大きすぎます" };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const parsed = parseKyoteiCsv(decodeCsvBytes(bytes));
  if (!parsed.ok) return { error: parsed.message };

  const saved = await ingestRaceTickets(parsed.tickets);
  if (!saved.ok) return { error: saved.message };
  revalidatePublic();
  const { added, updated, unchanged, cash } = saved.stats;
  return {
    message: `取り込みました。新規 ${added}、更新 ${updated}、そのまま ${unchanged}。現金は ${cash.toLocaleString("ja-JP")}円です。`,
  };
}
