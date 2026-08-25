import { formatYen } from "@/lib/format";
import { stakedYenTotal } from "@/lib/numerai";
import type { NmrQuote, NumeraiSnapshot } from "@/types/domain";

export function NumeraiHero({
  snapshot,
  quote,
}: {
  snapshot: NumeraiSnapshot;
  quote: NmrQuote;
}) {
  const yen = stakedYenTotal(snapshot.models, quote);
  const count = snapshot.models.length;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl bg-teal-50 px-4 py-4">
        <p className="text-sm text-teal-800">現在Stake総額</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-teal-700 sm:text-4xl">
          {yen !== null ? `約${formatYen(yen)}` : "—"}
        </p>
      </div>
      <div className="rounded-2xl bg-sky-50 px-4 py-4">
        <p className="text-sm text-sky-800">モデル数</p>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-zinc-800 sm:text-4xl">
          {count}体
        </p>
      </div>
    </div>
  );
}
