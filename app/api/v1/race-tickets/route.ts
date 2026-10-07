import { NextResponse } from "next/server";
import { revalidatePublic } from "@/lib/actions/revalidate";
import { readBearerToken, tokenFingerprint } from "@/lib/api/auth";
import { failureResponse, handleApi, jsonError, readJsonBody } from "@/lib/api/http";
import { readIdempotencyKey } from "@/lib/api/ledger-keys";
import { firstZodMessage } from "@/lib/api/schemas";
import {
  findIdempotentTicket,
  hashRaceTicket,
  ingestRaceTickets,
  rememberRaceIdempotency,
} from "@/lib/races/ingest";
import { listRaceTickets } from "@/lib/races/queries";
import { raceTicketSchema } from "@/lib/races/schema";
import { summarizeTickets } from "@/lib/races/summary";
import { isRaceSport } from "@/lib/races/types";

function ymdOrNull(value: string | null): string | null {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export async function GET(request: Request) {
  return handleApi(request, async () => {
    const url = new URL(request.url);
    const sportText = url.searchParams.get("sport");
    if (sportText && !isRaceSport(sportText)) {
      return jsonError(400, "VALIDATION", "sport は kyotei か keiba だよ");
    }
    const fromText = url.searchParams.get("from");
    const toText = url.searchParams.get("to");
    if ((fromText && !ymdOrNull(fromText)) || (toText && !ymdOrNull(toText))) {
      return jsonError(400, "VALIDATION", "日付は yyyy-MM-dd だよ");
    }
    const tickets = await listRaceTickets({
      sport: sportText && isRaceSport(sportText) ? sportText : undefined,
      from: ymdOrNull(fromText) ?? undefined,
      to: ymdOrNull(toText) ?? undefined,
    });
    return NextResponse.json({ tickets, summary: summarizeTickets(tickets) });
  });
}

export async function POST(request: Request) {
  return handleApi(request, async () => {
    const body = await readJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = raceTicketSchema.safeParse(body.value);
    if (!parsed.success) {
      return jsonError(400, "VALIDATION", firstZodMessage(parsed.error));
    }
    const idem = readIdempotencyKey(request);
    if (!idem.ok) return jsonError(400, "VALIDATION", idem.message);
    const bearer = readBearerToken(request);
    if (!bearer) return jsonError(401, "UNAUTHORIZED", "認証できないよ");

    const requestHash = hashRaceTicket(parsed.data);
    if (idem.key) {
      const replay = await findIdempotentTicket({
        key: idem.key,
        tokenHash: tokenFingerprint(bearer),
        requestHash,
      });
      if (!replay.ok) return failureResponse(replay);
      if (replay.ticket) {
        return NextResponse.json({ created: false, ticket: replay.ticket }, { status: 200 });
      }
    }

    const saved = await ingestRaceTickets([parsed.data]);
    if (!saved.ok) return failureResponse(saved);
    if (idem.key) {
      await rememberRaceIdempotency({
        key: idem.key,
        tokenHash: tokenFingerprint(bearer),
        requestHash,
        raceTicketId: saved.rows[0].id,
      });
    }
    if (saved.stats.added > 0 || saved.stats.updated > 0) revalidatePublic();
    return NextResponse.json(
      { created: saved.stats.added > 0, ticket: saved.rows[0], cash: saved.stats.cash },
      { status: saved.stats.added > 0 ? 201 : 200 }
    );
  });
}
