import { formatPayoutMultiplier, formatRoundTarget } from "@/lib/numerai";
import type { NumeraiRoundSnapshot } from "@/types/domain";

export function NumeraiRoundStatus({ round }: { round: NumeraiRoundSnapshot | null }) {
  if (!round) return null;

  const payout =
    round.payoutScores.length === 0
      ? "—"
      : round.payoutScores
          .map((score) => `${score.displayName} ${formatPayoutMultiplier(score.defaultMultiplier)}`)
          .join(" · ");

  return (
    <div className="rounded-2xl border border-sky-100 bg-white/80 px-5 py-5">
      <p className="text-sm font-semibold text-secondary">いまの大会</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-zinc-500">ラウンド</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-zinc-900">{round.number}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">評価期間</dt>
          <dd className="mt-0.5 font-semibold text-zinc-900">
            {formatRoundTarget(round.target, round.scoringDays)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">支払い対象</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-zinc-900">{payout}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm leading-relaxed text-zinc-600">
        Stakeはラウンドごとにオンチェーンでロックしてるよ。昔のウォレットに残ってるNMRは、もうステーキングには使わないよ。PayoutとBurnはラウンドが終わって確定してから、Stakeの枚数に入るよ。まだの分は収入に入れてないよ。
      </p>
    </div>
  );
}
