import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { RACE_PAYOUT_CATEGORY } from "@/lib/categories";
import { balanceSheet } from "@/lib/finance";
import { decodeCsvBytes, parseKyoteiCsv } from "@/lib/races/csv";
import { dayLedgerLines, projectRaceLedger } from "@/lib/races/ledger";
import { summarizeTickets } from "@/lib/races/summary";
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
  assert.deepEqual(
    lines.map((line) => [line.type, line.amount, line.title]),
    [
      ["expense", 8600, "競艇の購入"],
      ["income", 7160, "競艇の払戻"],
    ]
  );
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
  const payout = next.find((tx) => tx.category === RACE_PAYOUT_CATEGORY);
  assert.ok(payout);
  const after = summarizeSurvival([income(5000), meal, payout], new Date("2026-10-07T12:00:00"));
  assert.equal(after.monthIncome, withMeal.monthIncome + payout.amount);
  assert.equal(after.selfSufficiencyPercent, Math.round((after.monthIncome / 1000) * 100));
  assert.equal(after.cash, withMeal.cash + payout.amount);
  assert.equal(before.cash, 10000);
});
