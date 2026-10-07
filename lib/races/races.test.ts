import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { RACE_PAYOUT_CATEGORY } from "@/lib/categories";
import { balanceSheet } from "@/lib/finance";
import { decodeCsvBytes, parseKyoteiCsv } from "@/lib/races/csv";
import { parseLedgerRace } from "@/lib/races/from-ledger";
import { dayLedgerLines, projectRaceLedger } from "@/lib/races/ledger";
import {
  monthBounds,
  pageWindow,
  summarizeBetTypes,
  summarizeBetTypesBySport,
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

test("明細の競艇と競馬AIをレースにする", () => {
  const kyotei = parseLedgerRace({
    id: "1",
    date: "2026-10-04",
    type: "income",
    amount: 20,
    title: "競艇 徳山1R 単勝",
  });
  assert.ok(kyotei);
  assert.equal(kyotei.sport, "kyotei");
  assert.equal(kyotei.venue, "徳山");
  assert.equal(kyotei.race, "1R");
  assert.equal(kyotei.betType, "単勝");
  assert.equal(kyotei.netYen, 20);
  assert.equal(kyotei.hitStatus, "hit");
  assert.equal(kyotei.stakeYen, 100);
  assert.equal(kyotei.payoutYen, 120);

  const hit = parseLedgerRace({
    id: "2",
    date: "2026-09-21",
    type: "income",
    amount: 200,
    title: "競馬AIの的中収入(阪神11R：神戸新聞杯)",
  });
  assert.ok(hit);
  assert.equal(hit.sport, "keiba");
  assert.equal(hit.venue, "阪神");
  assert.equal(hit.race, "11R");
  assert.equal(hit.note, "神戸新聞杯");
  assert.equal(hit.netYen, 200);
  assert.equal(hit.hitStatus, "hit");
  assert.equal(hit.stakeYen, 2000);
  assert.equal(hit.payoutYen, 2200);

  const miss = parseLedgerRace({
    id: "3",
    date: "2026-09-20",
    type: "expense",
    amount: 2000,
    title: "競馬AIの不的中損失(中山11R：オールカマー)",
  });
  assert.ok(miss);
  assert.equal(miss.venue, "中山");
  assert.equal(miss.netYen, -2000);
  assert.equal(miss.hitStatus, "miss");
  assert.equal(miss.stakeYen, 2000);
  assert.equal(miss.payoutYen, 0);

  const karatsu = parseLedgerRace({
    id: "6",
    date: "2026-10-04",
    type: "income",
    amount: 30,
    title: "競艇 唐津1R 単勝",
  });
  const rose = parseLedgerRace({
    id: "7",
    date: "2026-09-13",
    type: "income",
    amount: 200,
    title: "競馬AIの的中収入(阪神11R：ローズステークス)",
  });
  assert.ok(karatsu);
  assert.ok(rose);
  assert.equal(karatsu.stakeYen, 100);
  assert.equal(karatsu.payoutYen, 130);
  assert.equal(rose.stakeYen, 2000);
  assert.equal(rose.payoutYen, 2200);

  const rows = [kyotei, karatsu, hit, miss, rose].filter((row) => row !== null);
  const totals = summarizeTickets(rows);
  assert.equal(totals.netYen, 20 + 30 + 200 - 2000 + 200);
  assert.equal(totals.stakeYen, 100 + 100 + 2000 + 2000 + 2000);
  assert.equal(totals.payoutYen, 120 + 130 + 2200 + 0 + 2200);
  assert.equal(totals.stakeKnown, true);
  assert.equal(totals.recoveryPercent, Math.round((4650 / 6200) * 1000) / 10);
  const bySport = summarizeBetTypesBySport(rows);
  assert.deepEqual(
    bySport.map((group) => group.sport),
    ["kyotei", "keiba"]
  );
  assert.equal(bySport[0].rows[0].key, "単勝");
  assert.equal(bySport[0].rows[0].stakeYen, 200);
  assert.equal(bySport[1].rows[0].stakeYen, 6000);
  assert.equal(parseLedgerRace({
    id: "4",
    date: "2026-05-30",
    type: "income",
    amount: 3100,
    title: "YouTube広告 5月",
  }), null);
  assert.equal(parseLedgerRace({
    id: "5",
    date: "2026-10-06",
    type: "expense",
    amount: 8600,
    title: "競艇の購入",
  }), null);
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
