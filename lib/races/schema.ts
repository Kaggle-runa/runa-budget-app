import { z } from "zod";
import { normalizeVenue, type RaceTicketInput } from "@/lib/races/types";

const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付は yyyy-MM-dd だよ");

export const raceTicketSchema = z
  .object({
    sport: z.enum(["kyotei", "keiba"]),
    date: ymd,
    receiptNumber: z.string().trim().min(1).max(40),
    venue: z.string().trim().min(1).max(40),
    race: z.string().trim().min(1).max(20),
    betType: z.string().trim().min(1).max(40),
    selection: z.string().trim().min(1).max(40),
    stakeYen: z.number().int().positive("購入金額は1円以上の整数だよ"),
    hitStatus: z.enum(["hit", "miss"]),
    payoutYen: z.number().int().min(0, "払戻金は0以上の整数だよ"),
    payoutTotalYen: z.number().int().min(0, "払戻計は0以上の整数だよ"),
    source: z.string().trim().min(1).max(40).nullable().optional(),
    sourceEventId: z.string().trim().min(1).max(120).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const source = value.source ?? null;
    const sourceEventId = value.sourceEventId ?? null;
    if (Boolean(source) !== Boolean(sourceEventId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "source と sourceEventId は両方入れるか、両方やめてね",
        path: source ? ["sourceEventId"] : ["source"],
      });
    }
  })
  .transform((value): RaceTicketInput => ({
    sport: value.sport,
    date: value.date,
    receiptNumber: value.receiptNumber.trim(),
    venue: normalizeVenue(value.venue),
    race: value.race.trim(),
    betType: value.betType.trim(),
    selection: value.selection.trim(),
    stakeYen: value.stakeYen,
    hitStatus: value.hitStatus,
    payoutYen: value.payoutYen,
    payoutTotalYen: value.payoutTotalYen,
    source: value.source ?? null,
    sourceEventId: value.sourceEventId ?? null,
  }));
