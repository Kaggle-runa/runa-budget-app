import { z } from "zod";
import { differenceInCalendarDays, subDays } from "date-fns";
import { fail, type ApiFailure } from "@/lib/api/http";
import { dateKey } from "@/lib/finance";
import { todayInJapan } from "@/lib/survival";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付は yyyy-MM-dd だよ");

export const txTypeSchema = z.enum([
  "income",
  "expense",
  "loan",
  "repay",
  "capex",
]);

export const eventKindSchema = z.enum(["stream", "release", "project", "other"]);

export const transactionCreateSchema = z.object({
  date: ymd,
  type: txTypeSchema,
  amount: z.number().int().positive("金額は1円以上の整数だよ"),
  category: z.string().min(1),
  title: z.string().min(1, "摘要を入れてね").max(80),
  memo: z.string().max(400).nullable().optional(),
  projectId: z.string().min(1).nullable().optional(),
});

export const transactionPatchSchema = transactionCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "更新する項目を1つ以上入れてね" }
);

export const eventCreateSchema = z.object({
  title: z.string().min(1, "タイトルを入れてね").max(80),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  allDay: z.boolean().optional(),
  kind: eventKindSchema,
  projectId: z.string().min(1).nullable().optional(),
  body: z.string().max(4000).nullable().optional(),
  linkUrl: z
    .union([z.string().url("リンクの形が不正です"), z.literal(""), z.null()])
    .optional(),
  announcementId: z.string().min(1).nullable().optional(),
});

export const eventPatchSchema = eventCreateSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  { message: "更新する項目を1つ以上入れてね" }
);

export function parseYmdRange(
  fromRaw: string | null,
  toRaw: string | null,
  fallbackDays: number
): { ok: true; from: Date; to: Date } | ApiFailure {
  const today = todayInJapan();
  const fromText = fromRaw?.trim() ?? "";
  const toText = toRaw?.trim() ?? "";
  if (fromText && !ymd.safeParse(fromText).success) {
    return fail(400, "VALIDATION", "from は yyyy-MM-dd だよ");
  }
  if (toText && !ymd.safeParse(toText).success) {
    return fail(400, "VALIDATION", "to は yyyy-MM-dd だよ");
  }
  const fromKey = fromText || dateKey(subDays(today, fallbackDays));
  const toKey = toText || dateKey(today);
  const from = new Date(`${fromKey}T00:00:00`);
  const to = new Date(`${toKey}T23:59:59.999`);
  if (to < from) {
    return fail(400, "VALIDATION", "to は from 以降にしてね");
  }
  if (differenceInCalendarDays(to, from) > 366) {
    return fail(
      400,
      "VALIDATION",
      "期間は366日以内にしてね",
      "from と to を短くして、必要な分だけ取ってね"
    );
  }
  return { ok: true, from, to };
}

export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "入力が不正です";
}

export function parseOptionalTxType(value: string | null) {
  if (!value) return { ok: true as const, type: undefined };
  const parsed = txTypeSchema.safeParse(value);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: fail(
        400,
        "VALIDATION",
        "type が不正です",
        "income / expense / loan / repay / capex のいずれかだよ"
      ),
    };
  }
  return { ok: true as const, type: parsed.data };
}
