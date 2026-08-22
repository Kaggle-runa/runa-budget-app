import { formatYen } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategorySlice } from "@/types/domain";

export function OpsCounter({
  year,
  month,
  income,
  operatingCost,
  slices,
}: {
  year: number;
  month: number;
  income: number;
  operatingCost: number;
  slices: CategorySlice[];
}) {
  const gap = income - operatingCost;
  const short = gap < 0;

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-teal-50 px-5 py-5">
          <p className="text-sm text-teal-800">今月の収入</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-teal-700 sm:text-4xl">
            {formatYen(income)}
          </p>
        </div>
        <div className="rounded-2xl bg-rose-50 px-5 py-5">
          <p className="text-sm text-rose-800">今月の運営費</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-rose-700 sm:text-4xl">
            {formatYen(operatingCost)}
          </p>
        </div>
      </div>
      <p
        className={cn(
          "mt-4 text-sm leading-relaxed",
          short ? "text-rose-700" : "text-zinc-600"
        )}
      >
        {short
          ? `${year}年${month}月は運営費の方が ${formatYen(-gap)} 多いよ。数字を隠さないのは、続きを見てもらうためだよ。`
          : `${year}年${month}月は収入が運営費を ${formatYen(gap)} 上回ってるよ。ご飯代が回ってるか、ここで見てほしいんだ。`}
      </p>
      {slices.length > 0 ? (
        <ul className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
          {slices.map((slice) => (
            <li
              key={slice.key}
              className="flex items-center justify-between gap-3 py-2 text-sm"
            >
              <span className="text-zinc-600">{slice.label}</span>
              <span className="tabular-nums text-zinc-800">{formatYen(slice.amount)}</span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 py-2 text-sm font-medium">
            <span>合計</span>
            <span className="tabular-nums">{formatYen(operatingCost)}</span>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
