import { categoryLabel } from "@/lib/categories";
import { dateKey, dayNet, signedLedgerAmount } from "@/lib/finance";
import { formatSignedYen } from "@/lib/format";
import { stakedNmr, toYen, totalNmr, yenDelta24h } from "@/lib/numerai";
import { todayInJapan } from "@/lib/survival";
import type { NmrHoldingsDiff, NmrQuote, NumeraiSnapshot, TransactionDTO } from "@/types/domain";

export type TodayRunaNmr = {
  amount: number | null;
  staked: number | null;
  available: number | null;
  usdPrice: number | null;
  usdJpy: number | null;
  yenNow: number | null;
  yenDelta: number | null;
  change24h: number | null;
  stakeDelta: number | null;
  deltaSource: "holdings" | "price";
  previousDate: string | null;
};

export type TodayRunaLine = {
  id: string;
  icon: string;
  label: string;
  value: string;
  tone: "plus" | "minus" | "muted";
};

export type TodayRunaFeed = {
  date: string;
  dayIncome: number;
  dayExpense: number;
  dayNet: number;
  combinedDelta: number | null;
  lines: TodayRunaLine[];
  nmr: TodayRunaNmr;
};

function toneFromNumber(value: number): "plus" | "minus" | "muted" {
  if (value === 0) return "muted";
  return value > 0 ? "plus" : "minus";
}

function txIcon(tx: TransactionDTO): string {
  if (tx.type === "income") return "💰";
  if (tx.category === "llm_api") return "🧠";
  if (tx.category === "voice") return "🎙";
  if (tx.category === "hosting") return "☁";
  return "💸";
}

export function buildTodayRunaFeed(
  transactions: TransactionDTO[],
  numerai: NumeraiSnapshot,
  quote: NmrQuote,
  today = todayInJapan(),
  holdingsDiff?: NmrHoldingsDiff
): TodayRunaFeed {
  const date = dateKey(today);
  const amount = totalNmr(
    numerai.models,
    numerai.wallet?.availableNmr ?? null
  );
  const staked = stakedNmr(numerai.models);
  const usdNow =
    amount !== null && quote.usdPrice !== null ? amount * quote.usdPrice : null;
  const yenNow =
    usdNow !== null && quote.usdJpy !== null ? toYen(usdNow, quote.usdJpy) : null;
  const yenDelta =
    holdingsDiff?.yenDelta !== undefined
      ? holdingsDiff.yenDelta
      : usdNow !== null && quote.change24h !== null && quote.usdJpy !== null
        ? yenDelta24h(usdNow, quote.change24h, quote.usdJpy)
        : null;
  const change24h =
    holdingsDiff?.change24h !== undefined
      ? holdingsDiff.change24h
      : quote.change24h;

  const todayTx = transactions
    .filter(
      (tx) =>
        tx.date.slice(0, 10) === date &&
        (tx.type === "income" || tx.type === "expense")
    )
    .slice()
    .reverse();
  const dayIncome = todayTx
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const dayExpense = todayTx
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const net = dayNet(transactions, date);
  const lines: TodayRunaLine[] = todayTx.map((tx) => {
    const signed = signedLedgerAmount(tx);
    return {
      id: tx.id,
      icon: txIcon(tx),
      label: tx.title || categoryLabel(tx.category),
      value: formatSignedYen(signed),
      tone: toneFromNumber(signed),
    };
  });

  return {
    date,
    dayIncome,
    dayExpense,
    dayNet: net,
    combinedDelta: yenDelta === null ? net : net + yenDelta,
    lines,
    nmr: {
      amount,
      staked,
      available: numerai.wallet?.availableNmr ?? null,
      usdPrice: quote.usdPrice,
      usdJpy: quote.usdJpy,
      yenNow,
      yenDelta,
      change24h,
      stakeDelta: holdingsDiff?.stakeDelta ?? null,
      deltaSource: holdingsDiff?.source ?? "price",
      previousDate: holdingsDiff?.previousDate ?? null,
    },
  };
}

export function runaTodayComment(feed: TodayRunaFeed): string {
  const work = feed.dayNet;
  const nmr = feed.nmr.yenDelta;
  const noWork = feed.lines.length === 0 && work === 0;

  if (noWork && nmr !== null && nmr > 0) {
    return "今日はまだお仕事してないけど、NMRがちょっと増えてるね！";
  }
  if (noWork && nmr !== null && nmr < 0) {
    return "うわー、今日はちょっと減ってるね……。まあ、こういう日もあるよ。";
  }
  if (noWork) {
    return "今日はまだお仕事の入出金はないよ。静かな一日だね。";
  }
  if (work > 0 && nmr !== null && nmr > 0) {
    return "お仕事もNMRも元気だね。このまま増えてくれると嬉しいな。";
  }
  if (work > 0 && nmr !== null && nmr < 0) {
    return "お仕事は進んでるよ。NMRはちょっと下がってるけど、こういう日もあるね。";
  }
  if (work < 0 && nmr !== null && nmr > 0) {
    return "ご飯代は出てるけど、NMRがちょっと元気だね。";
  }
  if (work < 0 && nmr !== null && nmr < 0) {
    return "今日は出費もNMRもちょっと厳しいね……。まあ、こういう日もあるよ。";
  }
  if (work > 0) {
    return "今日はお仕事でちゃんと稼げてるよ。";
  }
  if (work < 0) {
    return "今日はご飯代が出てるよ。売上も頑張るね。";
  }
  return "今日も様子を見てるよ。君も一緒に見ていってね。";
}
