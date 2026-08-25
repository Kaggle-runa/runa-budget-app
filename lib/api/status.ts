import { dateKey } from "@/lib/finance";
import { formatAsOf } from "@/lib/format";
import { getNmrQuote, getNumeraiSnapshot, toYen, totalNmr, yenDelta24h } from "@/lib/numerai";
import {
  getLatestUpdatedAt,
  listEvents,
  listProjects,
  listTransactions,
} from "@/lib/queries";
import { summarizeChallenges, summarizeSurvival, todayInJapan } from "@/lib/survival";

export async function buildApiStatus() {
  const [transactions, events, projects, latest, numerai, quote] = await Promise.all([
    listTransactions(),
    listEvents(),
    listProjects(),
    getLatestUpdatedAt(),
    getNumeraiSnapshot(),
    getNmrQuote(),
  ]);
  const today = todayInJapan();
  const todayKey = dateKey(today);
  const survival = summarizeSurvival(transactions, today);
  const challenges = summarizeChallenges(transactions, projects);
  const amount = totalNmr(numerai.models, numerai.wallet?.availableNmr ?? null);
  const usdNow =
    amount !== null && quote.usdPrice !== null ? amount * quote.usdPrice : null;
  const yenNow =
    usdNow !== null && quote.usdJpy !== null ? toYen(usdNow, quote.usdJpy) : null;
  const yenDelta =
    usdNow !== null && quote.change24h !== null && quote.usdJpy !== null
      ? yenDelta24h(usdNow, quote.change24h, quote.usdJpy)
      : null;

  const startOfToday = new Date(`${todayKey}T00:00:00+09:00`);
  const upcoming = events
    .filter((event) => new Date(event.endAt) >= startOfToday)
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 10);

  return {
    asOf: latest ? formatAsOf(latest) : `${todayKey}時点`,
    today: todayKey,
    survival: {
      cash: survival.cash,
      todayDelta: survival.todayDelta,
      monthIncome: survival.monthIncome,
      monthMealCost: survival.monthMealCost,
      selfSufficiencyPercent: survival.selfSufficiencyPercent,
      runwayDays: survival.runwayDays,
      streakDays: survival.streakDays,
    },
    nmr: {
      yenNow,
      yenDelta,
      change24h: quote.change24h,
      includedInProfit: false,
      note: "NMRの円は評価額。損益・自給率・所持金（現金）には入れない。",
    },
    challenges,
    recentTransactions: transactions.slice(0, 10),
    upcomingEvents: upcoming,
  };
}
