import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { balanceSheet, toTransactionDTO } from "@/lib/finance";
import { fail, type ApiFailure } from "@/lib/api/http";
import { solvencyError } from "@/lib/transactions";
import {
  dayLedgerLines,
  projectRaceLedger,
  RACE_LEDGER_SOURCE,
  type RaceLedgerLine,
} from "@/lib/races/ledger";
import type { RaceSport, RaceTicketDTO, RaceTicketInput } from "@/lib/races/types";

type TicketRow = {
  id: string;
  sport: string;
  date: string;
  receiptNumber: string;
  venue: string;
  race: string;
  betType: string;
  selection: string;
  stakeYen: number;
  hitStatus: string;
  payoutYen: number;
  payoutTotalYen: number;
  source: string | null;
  sourceEventId: string | null;
};

export type IngestStats = {
  added: number;
  updated: number;
  unchanged: number;
  cash: number;
};

class IngestRejected extends Error {
  failure: ApiFailure;

  constructor(failure: ApiFailure) {
    super(failure.message);
    this.failure = failure;
  }
}

function isPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === code
  );
}

export function hashRaceTicket(input: RaceTicketInput): string {
  const body = {
    sport: input.sport,
    date: input.date,
    receiptNumber: input.receiptNumber,
    venue: input.venue,
    race: input.race,
    betType: input.betType,
    selection: input.selection,
    stakeYen: input.stakeYen,
    hitStatus: input.hitStatus,
    payoutYen: input.payoutYen,
    payoutTotalYen: input.payoutTotalYen,
    source: input.source ?? null,
    sourceEventId: input.sourceEventId ?? null,
  };
  return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

export function toRaceTicketDTO(row: TicketRow): RaceTicketDTO {
  return {
    id: row.id,
    sport: row.sport === "keiba" ? "keiba" : "kyotei",
    date: row.date,
    receiptNumber: row.receiptNumber,
    venue: row.venue,
    race: row.race,
    betType: row.betType,
    selection: row.selection,
    stakeYen: row.stakeYen,
    hitStatus: row.hitStatus === "hit" ? "hit" : "miss",
    payoutYen: row.payoutYen,
    payoutTotalYen: row.payoutTotalYen,
    source: row.source,
    sourceEventId: row.sourceEventId,
    netYen: row.payoutYen - row.stakeYen,
  };
}

function identityOf(input: RaceTicketInput) {
  return {
    sport: input.sport,
    date: input.date,
    receiptNumber: input.receiptNumber,
    venue: input.venue,
    race: input.race,
    betType: input.betType,
    selection: input.selection,
  };
}

function sameIdentity(row: TicketRow, input: RaceTicketInput): boolean {
  const identity = identityOf(input);
  return (
    row.sport === identity.sport &&
    row.date === identity.date &&
    row.receiptNumber === identity.receiptNumber &&
    row.venue === identity.venue &&
    row.race === identity.race &&
    row.betType === identity.betType &&
    row.selection === identity.selection
  );
}

function sameMoney(row: TicketRow, input: RaceTicketInput): boolean {
  return (
    row.stakeYen === input.stakeYen &&
    row.hitStatus === input.hitStatus &&
    row.payoutYen === input.payoutYen &&
    row.payoutTotalYen === input.payoutTotalYen
  );
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function writeTicket(tx: Tx, input: RaceTicketInput): Promise<{
  status: "added" | "updated" | "unchanged";
  row: TicketRow;
}> {
  const source = input.source ?? null;
  const sourceEventId = input.sourceEventId ?? null;
  if (source && sourceEventId) {
    const bySource = await tx.raceTicket.findFirst({
      where: { source, sourceEventId },
    });
    if (bySource && !sameIdentity(bySource, input)) {
      throw new IngestRejected(
        fail(422, "CONFLICT", "同じ source の買い目が別のレースを指してるよ")
      );
    }
    if (bySource) {
      return updateTicket(tx, bySource, input);
    }
  }

  const existing = await tx.raceTicket.findUnique({
    where: { ticket_identity: identityOf(input) },
  });
  if (!existing) {
    const row = await tx.raceTicket.create({
      data: {
        ...identityOf(input),
        stakeYen: input.stakeYen,
        hitStatus: input.hitStatus,
        payoutYen: input.payoutYen,
        payoutTotalYen: input.payoutTotalYen,
        source,
        sourceEventId,
      },
    });
    return { status: "added", row };
  }
  if (
    source &&
    sourceEventId &&
    existing.source &&
    existing.sourceEventId &&
    (existing.source !== source || existing.sourceEventId !== sourceEventId)
  ) {
    throw new IngestRejected(
      fail(422, "CONFLICT", "この買い目は別の source で入ってるよ")
    );
  }
  return updateTicket(tx, existing, input);
}

async function updateTicket(
  tx: Tx,
  existing: TicketRow,
  input: RaceTicketInput
): Promise<{ status: "updated" | "unchanged"; row: TicketRow }> {
  const source = input.source ?? existing.source;
  const sourceEventId = input.sourceEventId ?? existing.sourceEventId;
  const sourceChanged = source !== existing.source || sourceEventId !== existing.sourceEventId;
  if (sameMoney(existing, input) && !sourceChanged) {
    return { status: "unchanged", row: existing };
  }
  const row = await tx.raceTicket.update({
    where: { id: existing.id },
    data: {
      stakeYen: input.stakeYen,
      hitStatus: input.hitStatus,
      payoutYen: input.payoutYen,
      payoutTotalYen: input.payoutTotalYen,
      source,
      sourceEventId,
    },
  });
  return { status: sameMoney(existing, input) ? "unchanged" : "updated", row };
}

async function syncDays(tx: Tx, dayKeys: { sport: RaceSport; date: string }[]) {
  const unique = new Map<string, { sport: RaceSport; date: string }>();
  for (const key of dayKeys) unique.set(`${key.sport}:${key.date}`, key);
  const days = [...unique.values()];
  if (days.length === 0) return;

  const ticketsByDay = await Promise.all(
    days.map(async (day) => ({
      day,
      tickets: await tx.raceTicket.findMany({
        where: { sport: day.sport, date: day.date },
      }),
    }))
  );
  const lines: RaceLedgerLine[] = ticketsByDay.flatMap(({ day, tickets }) =>
    dayLedgerLines(day.sport, day.date, tickets.map(toRaceTicketDTO))
  );
  const current = (
    await tx.transaction.findMany({ include: { project: true } })
  ).map(toTransactionDTO);
  const blocked = solvencyError(projectRaceLedger(current, lines, days));
  if (blocked) {
    throw new IngestRejected(
      fail(422, "SOLVENCY", blocked, "先に収入や借入を登録するか、金額を見直してね")
    );
  }

  const prefixes = days.map((day) => `${day.sport}:${day.date}:`);
  const existing = await tx.transaction.findMany({
    where: { source: RACE_LEDGER_SOURCE },
  });
  const affected = existing.filter(
    (row) =>
      row.sourceEventId &&
      prefixes.some((prefix) => row.sourceEventId?.startsWith(prefix))
  );
  for (const row of affected) {
    if (!lines.some((line) => line.sourceEventId === row.sourceEventId)) {
      await tx.transaction.delete({ where: { id: row.id } });
    }
  }
  for (const line of lines) {
    const row = affected.find((item) => item.sourceEventId === line.sourceEventId);
    const data = {
      date: new Date(`${line.date}T12:00:00+09:00`),
      type: line.type,
      amount: line.amount,
      category: line.category,
      title: line.title,
      memo: line.memo,
      source: line.source,
      sourceEventId: line.sourceEventId,
    };
    if (row) {
      await tx.transaction.update({ where: { id: row.id }, data });
    } else {
      await tx.transaction.create({ data });
    }
  }
}

export async function currentCash(): Promise<number> {
  const rows = await prisma.transaction.findMany({ include: { project: true } });
  return balanceSheet(rows.map(toTransactionDTO)).cash;
}

export async function ingestRaceTickets(
  tickets: RaceTicketInput[]
): Promise<{ ok: true; stats: IngestStats; rows: RaceTicketDTO[] } | ApiFailure> {
  if (tickets.length === 0) {
    return fail(400, "VALIDATION", "買い目が無いよ");
  }
  try {
    const saved = await prisma.$transaction(async (tx) => {
      const rows: RaceTicketDTO[] = [];
      let added = 0;
      let updated = 0;
      let unchanged = 0;
      const days: { sport: RaceSport; date: string }[] = [];
      for (const ticket of tickets) {
        const written = await writeTicket(tx, ticket);
        if (written.status === "added") added += 1;
        else if (written.status === "updated") updated += 1;
        else unchanged += 1;
        rows.push(toRaceTicketDTO(written.row));
        days.push({ sport: ticket.sport, date: ticket.date });
      }
      await syncDays(tx, days);
      return { added, updated, unchanged, rows };
    }, { maxWait: 20_000, timeout: 120_000 });
    const cash = await currentCash();
    return { ok: true, stats: { ...saved, cash }, rows: saved.rows };
  } catch (error) {
    if (error instanceof IngestRejected) return error.failure;
    if (isPrismaCode(error, "P2002")) {
      return fail(422, "CONFLICT", "同じ買い目がもうあるよ");
    }
    console.error("ingestRaceTickets failed", error);
    return fail(500, "INTERNAL", "保存に失敗しました");
  }
}

export async function findIdempotentTicket(input: {
  key: string;
  tokenHash: string;
  requestHash: string;
}): Promise<{ ok: true; ticket: RaceTicketDTO | null } | ApiFailure> {
  const hit = await prisma.raceIdempotency.findUnique({
    where: { key_tokenHash: { key: input.key, tokenHash: input.tokenHash } },
  });
  if (!hit) return { ok: true, ticket: null };
  if (hit.requestHash !== input.requestHash) {
    return fail(
      422,
      "CONFLICT",
      "同じ Idempotency-Key で中身が違うよ",
      "1回目の本文を正とする。キーを変えるか、同じ本文でもう一度送ってね"
    );
  }
  const row = await prisma.raceTicket.findUnique({ where: { id: hit.raceTicketId } });
  return { ok: true, ticket: row ? toRaceTicketDTO(row) : null };
}

export async function rememberRaceIdempotency(input: {
  key: string;
  tokenHash: string;
  requestHash: string;
  raceTicketId: string;
}): Promise<void> {
  await prisma.raceIdempotency.upsert({
    where: { key_tokenHash: { key: input.key, tokenHash: input.tokenHash } },
    update: {},
    create: input,
  });
}
