import { dateKey } from "@/lib/finance";
import { formatAsOf } from "@/lib/format";
import { recordAndDiffNmrHoldings, currentNmrHoldings } from "@/lib/nmr-holdings";
import { getNmrQuote, getNumeraiSnapshot } from "@/lib/numerai";
import {
  getLatestUpdatedAt,
  listEvents,
  listProjects,
  listTransactions,
} from "@/lib/queries";
import {
  summarizeChallenges,
  summarizeSurvival,
  todayInJapan,
  totalAssetsYen,
} from "@/lib/survival";

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
  const { yenNow, staked } = currentNmrHoldings(numerai, quote);
  const diff = await recordAndDiffNmrHoldings(numerai, quote);

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
    assets: {
      total: totalAssetsYen(survival.cash, survival.equipment, yenNow),
      cash: survival.cash,
      equipment: survival.equipment,
      nmrYen: yenNow,
      note: "総資産 = 現金 + 機材 + NMR円。損益・自給率にはNMRを入れない。",
    },
    nmr: {
      yenNow,
      yenDelta: diff.yenDelta,
      change24h: diff.change24h,
      staked,
      stakeDelta: diff.stakeDelta,
      includedInProfit: false,
      note: "NMRの円は評価額。円の前日比は価格と枚数の変化を含む。stakeDelta は Stake 枚数の差。総資産には入れる。損益・自給率・現金には入れない。",
    },
    challenges,
    recentTransactions: transactions.slice(0, 10),
    upcomingEvents: upcoming,
  };
}
