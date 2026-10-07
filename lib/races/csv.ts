import { normalizeVenue, type RaceSport, type RaceTicketInput } from "@/lib/races/types";

export const KYOTEI_HEADER = [
  "日付",
  "受付番号",
  "レース場",
  "レース",
  "勝式",
  "組番",
  "購入金額",
  "的中返還",
  "払戻金",
  "払戻計",
] as const;

export type CsvRowError = {
  line: number;
  message: string;
};

export type ParsedKyoteiCsv =
  | { ok: true; tickets: RaceTicketInput[] }
  | { ok: false; message: string; errors: CsvRowError[] };

export function decodeCsvBytes(bytes: Uint8Array): string {
  const utf8 = new TextDecoder("utf-8", { fatal: true });
  try {
    const text = utf8.decode(bytes).replace(/^\uFEFF/, "");
    if (text.includes("日付")) return text;
  } catch {
    // CP932 の投票履歴は UTF-8 として読めない
  }
  return new TextDecoder("shift_jis").decode(bytes).replace(/^\uFEFF/, "");
}

export function parseCsvTable(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (quoted) {
      if (char === '"') {
        if (source[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((value) => value.trim() !== ""));
}

function parseDate(value: string): string | null {
  const slash = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(value.trim());
  if (slash) return `${slash[1]}-${slash[2]}-${slash[3]}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return value.trim();
  return null;
}

function parseYen(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

export function parseKyoteiCsv(text: string, sport: RaceSport = "kyotei"): ParsedKyoteiCsv {
  const table = parseCsvTable(text);
  if (table.length === 0) {
    return { ok: false, message: "CSVが空です", errors: [] };
  }
  const header = table[0].map((cell) => cell.trim());
  const headerOk =
    header.length === KYOTEI_HEADER.length &&
    KYOTEI_HEADER.every((name, index) => header[index] === name);
  if (!headerOk) {
    return {
      ok: false,
      message: "競艇CSVのヘッダが違います",
      errors: [{ line: 1, message: `期待する列は ${KYOTEI_HEADER.join(",")} です` }],
    };
  }

  const tickets: RaceTicketInput[] = [];
  const errors: CsvRowError[] = [];
  for (let index = 1; index < table.length; index += 1) {
    const cells = table[index];
    const line = index + 1;
    if (cells.length !== KYOTEI_HEADER.length) {
      errors.push({ line, message: "列の数が違います" });
      continue;
    }
    const date = parseDate(cells[0]);
    const receiptNumber = cells[1].trim();
    const venue = normalizeVenue(cells[2]);
    const race = cells[3].trim();
    const betType = cells[4].trim();
    const selection = cells[5].trim();
    const stakeYen = parseYen(cells[6]);
    const hitRaw = cells[7].trim();
    const payoutYen = parseYen(cells[8]);
    const payoutTotalYen = parseYen(cells[9]);
    if (!date || !receiptNumber || !venue || !race || !betType || !selection) {
      errors.push({ line, message: "日付・受付番号・場・レース・勝式・組番が足りません" });
      continue;
    }
    if (stakeYen === null || stakeYen < 1 || payoutYen === null || payoutTotalYen === null) {
      errors.push({ line, message: "金額が整数ではありません" });
      continue;
    }
    if (hitRaw !== "的中" && hitRaw !== "なし") {
      errors.push({ line, message: "的中返還は「的中」か「なし」だけです" });
      continue;
    }
    tickets.push({
      sport,
      date,
      receiptNumber,
      venue,
      race,
      betType,
      selection,
      stakeYen,
      hitStatus: hitRaw === "的中" ? "hit" : "miss",
      payoutYen,
      payoutTotalYen,
    });
  }

  if (errors.length > 0) {
    const head = errors
      .slice(0, 8)
      .map((error) => `${error.line}行目: ${error.message}`)
      .join(" / ");
    const more = errors.length > 8 ? ` ほか${errors.length - 8}行` : "";
    return {
      ok: false,
      message: `このCSVは取り込みませんでした。${head}${more}`,
      errors,
    };
  }
  if (tickets.length === 0) {
    return { ok: false, message: "買い目の行がありません", errors: [] };
  }
  return { ok: true, tickets };
}
