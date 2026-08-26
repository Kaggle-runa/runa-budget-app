import { dateKey } from "@/lib/finance";
import { stakedNmr, toYen, totalNmr, yenDelta24h } from "@/lib/numerai";
import {
  getLatestNmrDailySnapshotBefore,
  upsertNmrDailySnapshot,
} from "@/lib/queries";
import { todayInJapan } from "@/lib/survival";
import type {
  NmrHoldingsDiff,
  NmrQuote,
  NumeraiSnapshot,
} from "@/types/domain";

export function currentNmrHoldings(
  snapshot: NumeraiSnapshot,
  quote: NmrQuote
): { amount: number | null; staked: number | null; yenNow: number | null } {
  const staked = stakedNmr(snapshot.models);
  const amount = totalNmr(snapshot.models, snapshot.wallet?.availableNmr ?? null);
  const usdNow =
    amount !== null && quote.usdPrice !== null ? amount * quote.usdPrice : null;
  const yenNow =
    usdNow !== null && quote.usdJpy !== null ? toYen(usdNow, quote.usdJpy) : null;
  return { amount, staked, yenNow };
}

export async function recordAndDiffNmrHoldings(
  snapshot: NumeraiSnapshot,
  quote: NmrQuote
): Promise<NmrHoldingsDiff> {
  const today = dateKey(todayInJapan());
  const { amount, staked, yenNow } = currentNmrHoldings(snapshot, quote);
  if (snapshot.ok && amount !== null && yenNow !== null) {
    await upsertNmrDailySnapshot({
      date: today,
      nmrAmount: amount,
      stakedAmount: staked,
      yen: yenNow,
      usdPrice: quote.usdPrice,
      usdJpy: quote.usdJpy,
    });
  }

  const previous = await getLatestNmrDailySnapshotBefore(today);
  if (previous && yenNow !== null) {
    const yenDelta = yenNow - previous.yen;
    const change24h =
      previous.yen !== 0 ? (yenDelta / previous.yen) * 100 : null;
    const stakeDelta =
      staked !== null && previous.stakedAmount !== null
        ? staked - previous.stakedAmount
        : null;
    return {
      yenDelta,
      change24h,
      stakeDelta,
      source: "holdings",
      previousDate: previous.date,
    };
  }

  const usdNow =
    amount !== null && quote.usdPrice !== null ? amount * quote.usdPrice : null;
  const yenDelta =
    usdNow !== null && quote.change24h !== null && quote.usdJpy !== null
      ? yenDelta24h(usdNow, quote.change24h, quote.usdJpy)
      : null;
  return {
    yenDelta,
    change24h: quote.change24h,
    stakeDelta: null,
    source: "price",
    previousDate: null,
  };
}
