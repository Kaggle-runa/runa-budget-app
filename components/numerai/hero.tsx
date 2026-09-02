import { formatYen } from "@/lib/format";
import {
  formatRoundTarget,
  formatStakeNmr,
  stakedNmr,
  stakedYenTotal,
  toYen,
  totalNmr,
} from "@/lib/numerai";
import type { NmrQuote, NumeraiSnapshot } from "@/types/domain";

function holdingsYen(
  amount: number | null,
  quote: NmrQuote
): number | null {
  if (amount === null || quote.usdPrice === null || quote.usdJpy === null) {
    return null;
  }
  return toYen(amount * quote.usdPrice, quote.usdJpy);
}

export function NumeraiHero({
  snapshot,
  quote,
}: {
  snapshot: NumeraiSnapshot;
  quote: NmrQuote;
}) {
  const staked = stakedNmr(snapshot.models);
  const total = totalNmr(snapshot.models, snapshot.wallet?.availableNmr ?? null);
  const totalYen = holdingsYen(total, quote);
  const stakeYen = stakedYenTotal(snapshot.models, quote);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-sky-50 px-4 py-4">
        <p className="text-sm text-sky-800">総NMR</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zinc-800 sm:text-4xl">
          {formatStakeNmr(total)}
        </p>
        <p className="mt-1 text-sm font-semibold tabular-nums text-sky-800">
          {totalYen !== null ? `約${formatYen(totalYen)}` : "—"}
        </p>
      </div>
      <div className="rounded-2xl bg-teal-50 px-4 py-4">
        <p className="text-sm text-teal-800">Stake中</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-teal-700 sm:text-4xl">
          {formatStakeNmr(staked)}
        </p>
        <p className="mt-1 text-sm font-semibold tabular-nums text-teal-800">
          {stakeYen !== null ? `約${formatYen(stakeYen)}` : "—"}
        </p>
        {snapshot.round ? (
          <p className="mt-1 text-xs text-teal-800">
            Round {snapshot.round.number} · {formatRoundTarget(snapshot.round.target, snapshot.round.scoringDays)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
