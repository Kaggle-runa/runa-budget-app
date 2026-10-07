import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { balanceSheet } from "@/lib/finance";
import { decodeCsvBytes, parseKyoteiCsv } from "@/lib/races/csv";
import { dayLedgerLines, projectRaceLedger } from "@/lib/races/ledger";
import {
  monthBounds,
  pageWindow,
  summarizeBetTypes,
  summarizeTickets,
} from "@/lib/races/summary";
import { summarizeSurvival } from "@/lib/survival";
import type { TransactionDTO } from "@/types/domain";

const fixture = readFileSync(
  path.join(process.cwd(), "lib/races/fixtures/kyotei-20261006.csv")
);

function income(amount: number, category = "support"): TransactionDTO {
  return {
    id: "cash",
    date: "2026-10-01",
    type: "income",
    amount,
    category,
    title: "収入",
    memo: null,
    projectId: null,
    projectTitle: null,
    source: null,
    sourceEventId: null,
  };
}

test("競艇CSVは購入8600・払戻7160・収支-1440・回収率83.3%", () => {
  const parsed = parseKyoteiCsv(decodeCsvBytes(fixture));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.tickets.length, 86);
  assert.equal(parsed.tickets[0].venue, "鳴門");
  const totals = summarizeTickets(parsed.tickets);
  assert.equal(totals.stakeYen, 8600);
  assert.equal(totals.payoutYen, 7160);
  assert.equal(totals.netYen, -1440);
  assert.equal(totals.recoveryPercent, 83.3);
  assert.equal(totals.hits, 40);
  assert.equal(totals.races, 53);
});

test("券種別の回収率は購入の合計が8600円になり、一覧は20件ずつ", () => {
  const parsed = parseKyoteiCsv(decodeCsvBytes(fixture));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const byType = summarizeBetTypes(parsed.tickets);
  assert.deepEqual(
    byType.map((row) => row.key).sort(),
    ["拡連複", "単勝", "複勝", "２連複"].sort()
  );
  assert.equal(
    byType.reduce((sum, row) => sum + row.stakeYen, 0),
    8600
  );
  for (const row of byType) {
    assert.equal(row.recoveryPercent, Math.round((row.payoutYen / row.stakeYen) * 1000) / 10);
  }
  assert.deepEqual(pageWindow(86, 1), { current: 1, pages: 5, start: 0, end: 20 });
  assert.deepEqual(pageWindow(86, 5), { current: 5, pages: 5, start: 80, end: 86 });
  assert.deepEqual(monthBounds("2026-10"), { from: "2026-10-01", to: "2026-10-31" });
});

test("的中返還が範囲外ならファイル全体を捨てる", () => {
  const text = [
    "日付,受付番号,レース場,レース,勝式,組番,購入金額,的中返還,払戻金,払戻計",
    "2026/10/06,1,鳴門,1R,単勝,1,100,返還,100,100",
  ].join("\n");
  const parsed = parseKyoteiCsv(text);
  assert.equal(parsed.ok, false);
});

test("現金10000円にその日を足すと8560円。払戻は自給率の収入に入る", () => {
  const parsed = parseKyoteiCsv(decodeCsvBytes(fixture));
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const lines = dayLedgerLines("kyotei", "2026-10-06", parsed.tickets);
  const net = lines.reduce((sum, line) => sum + (line.type === "income" ? line.amount : -line.amount), 0);
  assert.equal(net, -1440);
  assert.equal(lines.some((line) => line.title.includes("の購入") || line.title.includes("の払戻")), false);
  assert.equal(lines[0].title, "競艇 鳴門2R 拡連複 1=3");
  assert.equal(lines[0].type, "income");
  assert.equal(lines[0].amount, 100);
  assert.equal(lines[0].category, "ai_hustle");
  const existing = [income(10000)];
  const next = projectRaceLedger(existing, lines, [{ sport: "kyotei", date: "2026-10-06" }]);
  assert.equal(balanceSheet(next).cash, 8560);
  assert.ok(balanceSheet(projectRaceLedger([], lines, [{ sport: "kyotei", date: "2026-10-06" }])).cash < 0);

  const before = summarizeSurvival([income(10000)], new Date("2026-10-07T12:00:00"));
  const meal: TransactionDTO = {
    ...income(1000),
    id: "meal",
    type: "expense",
    category: "llm_api",
    amount: 1000,
    date: "2026-10-02",
  };
  const withMeal = summarizeSurvival([income(5000), meal], new Date("2026-10-07T12:00:00"));
  const gains = lines.filter((line) => line.type === "income").reduce((sum, line) => sum + line.amount, 0);
  const after = summarizeSurvival(
    [income(5000), meal, ...lines.map((line, index) => ({ ...income(line.amount, line.category), id: `race-${index}`, type: line.type, title: line.title, date: line.date }))],
    new Date("2026-10-07T12:00:00")
  );
  assert.equal(after.monthIncome, withMeal.monthIncome + gains);
  assert.equal(after.monthMealCost, withMeal.monthMealCost);
  assert.equal(after.cash, withMeal.cash - 1440);
  assert.equal(before.cash, 10000);
});
